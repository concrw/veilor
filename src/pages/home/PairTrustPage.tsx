import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { PairTrustGrant, TrustLevel } from '@/integrations/supabase/veilor-types';
import { C } from '@/lib/colors';
import { Shield, ShieldPlus, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LEVEL_INFO: Record<TrustLevel, { label: string; color: string; desc: string }> = {
  1: { label: 'Lv.1 관찰', color: '#9C9590', desc: '서로의 감정 흐름을 볼 수 있어요' },
  2: { label: 'Lv.2 공유', color: '#7FB89A', desc: '세션 요약을 공유할 수 있어요' },
  3: { label: 'Lv.3 동행', color: '#C97A6A', desc: '깊은 분석 레이어를 함께 봐요' },
};

function TrustGrantCard({ grant }: { grant: PairTrustGrant & { grantee_profile?: { nickname?: string } } }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isGrantor = grant.grantor_id === user?.id;
  const level = grant.trust_level as TrustLevel;
  const info = LEVEL_INFO[level];

  const { mutate: revoke, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await veilorDb.from('pair_trust_grants')
        .update({ is_active: false }).eq('id', grant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pair_trust_grants'] });
      toast({ title: '트러스트 연결이 해제됐습니다' });
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
          <span style={{ fontSize: 11, color: C.text4 }}>{isGrantor ? '→ 부여' : '← 수신'}</span>
        </div>
        <p style={{ fontSize: 13, color: C.text }}>{info.desc}</p>
        <p style={{ fontSize: 10, color: C.text4, marginTop: 2 }}>
          {isGrantor ? `상대방 ID: ${grant.grantee_id.slice(0, 8)}...` : `부여자 ID: ${grant.grantor_id.slice(0, 8)}...`}
        </p>
      </div>
      {isGrantor && (
        <button onClick={() => revoke()} disabled={isPending}
          style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, background: 'rgba(201,122,106,0.1)', color: '#C97A6A', border: '1px solid rgba(201,122,106,0.3)', cursor: 'pointer' }}>
          {isPending ? '...' : '해제'}
        </button>
      )}
    </div>
  );
}

export default function PairTrustPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
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
      if (!user) throw new Error('로그인 필요');
      const { error } = await veilorDb.from('pair_trust_grants').upsert({
        grantor_id: user.id, grantee_id: granteeId.trim(),
        trust_level: trustLevel, is_active: true,
      }, { onConflict: 'grantor_id,grantee_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pair_trust_grants'] });
      setGranteeId(''); setShowForm(false);
      toast({ title: '트러스트가 부여됐습니다' });
    },
    onError: () => toast({ title: '부여 실패', variant: 'destructive' }),
  });

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 22, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>Pair Trust</span>
          <p style={{ fontSize: 10, color: C.text4, margin: '2px 0 0', letterSpacing: '.02em' }}>트러스트 연결 · 공유 레벨</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowForm(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: showForm ? '#2A2724' : C.amber, color: showForm ? C.text4 : '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer' }}>
          <ShieldPlus size={14} />{showForm ? '취소' : '부여하기'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {showForm && (
          <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
            <input placeholder="상대방 User ID 입력" value={granteeId} onChange={e => setGranteeId(e.target.value)}
              style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {([1, 2, 3] as TrustLevel[]).map(lv => {
                const info = LEVEL_INFO[lv];
                return (
                  <button key={lv} onClick={() => setTrustLevel(lv)}
                    style={{ flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 11, textAlign: 'center', cursor: 'pointer', border: 'none',
                      background: trustLevel === lv ? `color-mix(in srgb, ${info.color} 15%, #1C1917)` : '#2A2724',
                      color: trustLevel === lv ? info.color : C.text4 }}>
                    {info.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: C.text4, marginBottom: 12 }}>{LEVEL_INFO[trustLevel].desc}</p>
            <button onClick={() => grant()} disabled={!granteeId.trim() || isPending}
              style={{ width: '100%', padding: '10px', borderRadius: 10, background: C.amber, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer', opacity: !granteeId.trim() ? 0.5 : 1 }}>
              {isPending ? '부여 중...' : '트러스트 부여'}
            </button>
          </div>
        )}

        {/* 레벨 설명 */}
        <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Heart size={13} color={C.amber} />
            <span style={{ fontSize: 12, color: C.text4 }}>트러스트 레벨 안내</span>
          </div>
          {([1, 2, 3] as TrustLevel[]).map(lv => {
            const info = LEVEL_INFO[lv];
            return (
              <div key={lv} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: info.color, minWidth: 60 }}>{info.label}</span>
                <span style={{ fontSize: 11, color: C.text4 }}>{info.desc}</span>
              </div>
            );
          })}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 20 }}>불러오는 중...</div>
        ) : grants.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 40 }}>
            <Shield size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>트러스트 연결이 없습니다</p>
          </div>
        ) : (
          grants.map(g => <TrustGrantCard key={g.id} grant={g} />)
        )}
      </div>
    </div>
  );
}
