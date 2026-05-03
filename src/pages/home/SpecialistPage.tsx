import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { SpecialistEntry, SpecialistHandoff } from '@/integrations/supabase/veilor-types';
import { C } from '@/lib/colors';
import { UserCheck, ExternalLink, Send, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function HandoffBadge({ status }: { status: SpecialistHandoff['status'] }) {
  const map = {
    pending:   { label: '대기 중', color: '#9C9590' },
    accepted:  { label: '수락됨', color: '#7FB89A' },
    declined:  { label: '거절됨', color: '#C97A6A' },
    completed: { label: '완료', color: '#6B9EC9' },
  };
  const { label, color } = map[status];
  return (
    <span style={{ fontSize: 10, color, border: `1px solid ${color}44`, borderRadius: 6, padding: '2px 8px' }}>{label}</span>
  );
}

function SpecialistCard({ specialist }: { specialist: SpecialistEntry }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: myHandoff } = useQuery({
    queryKey: ['handoff', specialist.id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await veilorDb.from('specialist_handoffs')
        .select('*').eq('specialist_id', specialist.id).eq('requester_id', user!.id)
        .order('requested_at', { ascending: false }).limit(1).maybeSingle();
      return data as SpecialistHandoff | null;
    },
  });

  const { mutate: request, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인 필요');
      const { error } = await veilorDb.from('specialist_handoffs').insert({
        requester_id: user.id, specialist_id: specialist.id, reason: reason || null, status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['handoff', specialist.id, user?.id] });
      setReason(''); setShowForm(false);
      toast({ title: '연결 요청이 전송됐습니다' });
    },
  });

  const domainColor: Record<string, string> = { work: '#6B9EC9', relation: '#C97A6A', clear: '#7FB89A', social: '#5EEAD4' };
  const dc = specialist.domain ? (domainColor[specialist.domain] ?? C.amber) : C.amber;

  return (
    <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `color-mix(in srgb, ${dc} 15%, #1C1917)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UserCheck size={18} color={dc} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ color: C.text, fontSize: 15, fontFamily: "'Cormorant Garamond', serif" }}>{specialist.name}</span>
            {specialist.domain && <span style={{ fontSize: 10, color: dc, border: `1px solid ${dc}44`, borderRadius: 5, padding: '1px 6px' }}>{specialist.domain}</span>}
          </div>
          <p style={{ fontSize: 12, color: C.amber, marginBottom: 4 }}>{specialist.specialty}</p>
          {specialist.bio && <p style={{ fontSize: 12, color: C.text4, lineHeight: 1.5 }}>{specialist.bio}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        {specialist.contact_url && (
          <a href={specialist.contact_url} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text4, textDecoration: 'none' }}>
            <ExternalLink size={11} />프로필
          </a>
        )}
        <div style={{ flex: 1 }} />
        {myHandoff ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={11} color={C.text4} />
            <HandoffBadge status={myHandoff.status} />
          </div>
        ) : (
          <button onClick={() => setShowForm(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '6px 14px', borderRadius: 8, background: showForm ? '#2A2724' : dc, color: showForm ? C.text4 : '#1C1917', border: 'none', cursor: 'pointer' }}>
            <Send size={11} />{showForm ? '취소' : '연결 요청'}
          </button>
        )}
      </div>

      {showForm && !myHandoff && (
        <div style={{ marginTop: 12 }}>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="연결 이유 (선택)" rows={2}
            style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '8px 12px', color: C.text, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <button onClick={() => request()} disabled={isPending}
            style={{ width: '100%', padding: '9px', borderRadius: 10, background: dc, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer' }}>
            {isPending ? '전송 중...' : '요청 보내기'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SpecialistPage() {
  const [filterDomain, setFilterDomain] = useState<string | null>(null);

  const { data: specialists = [], isLoading } = useQuery({
    queryKey: ['specialist_directory', filterDomain],
    queryFn: async () => {
      let q = veilorDb.from('specialist_directory').select('*').eq('is_active', true);
      if (filterDomain) q = q.eq('domain', filterDomain);
      const { data } = await q.order('name');
      return (data ?? []) as SpecialistEntry[];
    },
  });

  const domains = ['work', 'relation', 'clear', 'social'];
  const domainColor: Record<string, string> = { work: '#6B9EC9', relation: '#C97A6A', clear: '#7FB89A', social: '#5EEAD4' };

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border2}` }}>
        <span style={{ fontSize: 22, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>Specialists</span>
        <p style={{ fontSize: 10, color: C.text4, margin: '2px 0 0', letterSpacing: '.02em' }}>전문가 연결 · 핸드오프</p>
      </div>

      <div style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border2}`, display: 'flex', gap: 8 }}>
        <button onClick={() => setFilterDomain(null)}
          style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: 'none',
            background: !filterDomain ? C.amber : '#2A2724', color: !filterDomain ? '#1C1917' : C.text4 }}>
          전체
        </button>
        {domains.map(d => (
          <button key={d} onClick={() => setFilterDomain(filterDomain === d ? null : d)}
            style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: 'none',
              background: filterDomain === d ? `color-mix(in srgb, ${domainColor[d]} 15%, #1C1917)` : '#2A2724',
              color: filterDomain === d ? domainColor[d] : C.text4 }}>
            {d}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 40 }}>불러오는 중...</div>
        ) : specialists.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 60 }}>
            <UserCheck size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>등록된 전문가가 없습니다</p>
          </div>
        ) : (
          specialists.map(s => <SpecialistCard key={s.id} specialist={s} />)
        )}
      </div>
    </div>
  );
}
