import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { PairTrustGrant, TrustLevel } from '@/integrations/supabase/veilor-types';
import { C } from '@/lib/colors';
import { Shield, ShieldPlus, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/i18n/useT';

const LEVEL_COLORS: Record<TrustLevel, string> = { 1: '#9C9590', 2: '#7FB89A', 3: '#C97A6A' };

function TrustGrantCard({ grant }: { grant: PairTrustGrant & { grantee_profile?: { nickname?: string } } }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const s = useT().pairTrustPage;
  const isGrantor = grant.grantor_id === user?.id;
  const level = grant.trust_level as TrustLevel;
  const info = { label: s.levels[level].label, color: LEVEL_COLORS[level], desc: s.levels[level].desc };

  const { mutate: revoke, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await veilorDb.from('pair_trust_grants')
        .update({ is_active: false }).eq('id', grant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pair_trust_grants'] });
      toast({ title: s.revoked });
    },
  });

  return (
    <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `color-mix(in srgb, ${info.color} 15%, #1C1917)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Shield size={16} color={info.color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 11, color: info.color, border: `1px solid ${info.color}44`, borderRadius: 5, padding: '1px 6px' }}>{info.label}</span>
          <span style={{ fontSize: 11, color: C.text4 }}>{isGrantor ? s.directionOut : s.directionIn}</span>
        </div>
        <p style={{ fontSize: 13, color: C.text }}>{info.desc}</p>
        <p style={{ fontSize: 10, color: C.text4, marginTop: 2 }}>
          {isGrantor ? `${s.granteePrefix}${grant.grantee_id.slice(0, 8)}...` : `${s.grantorPrefix}${grant.grantor_id.slice(0, 8)}...`}
        </p>
      </div>
      {isGrantor && (
        <button onClick={() => revoke()} disabled={isPending}
          style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, background: 'rgba(201,122,106,0.1)', color: '#C97A6A', border: '1px solid rgba(201,122,106,0.3)', cursor: 'pointer' }}>
          {isPending ? s.revoking : s.revoke}
        </button>
      )}
    </div>
  );
}

export default function PairTrustPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const s = useT().pairTrustPage;
  const [granteeId, setGranteeId] = useState('');
  const [trustLevel, setTrustLevel] = useState<TrustLevel>(1);
  const [showForm, setShowForm] = useState(false);

  const { data: grants = [], isLoading } = useQuery({
    queryKey: ['pair_trust_grants', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await veilorDb.from('pair_trust_grants')
        .select('*').eq('is_active', true)
        .or(`grantor_id.eq.${user!.id},grantee_id.eq.${user!.id}`)
        .order('granted_at', { ascending: false });
      return (data ?? []) as PairTrustGrant[];
    },
  });

  const { mutate: grant, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login required');
      const { error } = await veilorDb.from('pair_trust_grants').upsert({
        grantor_id: user.id, grantee_id: granteeId.trim(),
        trust_level: trustLevel, is_active: true,
      }, { onConflict: 'grantor_id,grantee_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pair_trust_grants'] });
      setGranteeId(''); setShowForm(false);
      toast({ title: s.granted });
    },
    onError: () => toast({ title: s.grantFailed, variant: 'destructive' }),
  });

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 22, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>Pair Trust</span>
          <p style={{ fontSize: 10, color: C.text4, margin: '2px 0 0', letterSpacing: '.02em' }}>{s.subtitle}</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowForm(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: showForm ? '#2A2724' : C.amber, color: showForm ? C.text4 : '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer' }}>
          <ShieldPlus size={14} />{showForm ? s.cancel : s.grant}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {showForm && (
          <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
            <input placeholder={s.granteePlaceholder} value={granteeId} onChange={e => setGranteeId(e.target.value)}
              style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {([1, 2, 3] as TrustLevel[]).map(lv => {
                const lvColor = LEVEL_COLORS[lv];
                return (
                  <button key={lv} onClick={() => setTrustLevel(lv)}
                    style={{ flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 11, textAlign: 'center', cursor: 'pointer', border: 'none',
                      background: trustLevel === lv ? `color-mix(in srgb, ${lvColor} 15%, #1C1917)` : '#2A2724',
                      color: trustLevel === lv ? lvColor : C.text4 }}>
                    {s.levels[lv].label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: C.text4, marginBottom: 12 }}>{s.levels[trustLevel].desc}</p>
            <button onClick={() => grant()} disabled={!granteeId.trim() || isPending}
              style={{ width: '100%', padding: '10px', borderRadius: 10, background: C.amber, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer', opacity: !granteeId.trim() ? 0.5 : 1 }}>
              {isPending ? s.granting : s.grantButton}
            </button>
          </div>
        )}

        {/* 레벨 설명 */}
        <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Heart size={13} color={C.amber} />
            <span style={{ fontSize: 12, color: C.text4 }}>{s.levelGuide}</span>
          </div>
          {([1, 2, 3] as TrustLevel[]).map(lv => (
            <div key={lv} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: LEVEL_COLORS[lv], minWidth: 60 }}>{s.levels[lv].label}</span>
              <span style={{ fontSize: 11, color: C.text4 }}>{s.levels[lv].desc}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 20 }}>{s.loading}</div>
        ) : grants.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 40 }}>
            <Shield size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>{s.empty}</p>
          </div>
        ) : (
          grants.map(g => <TrustGrantCard key={g.id} grant={g} />)
        )}
      </div>
    </div>
  );
}
