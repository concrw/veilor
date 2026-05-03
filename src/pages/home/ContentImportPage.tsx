import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import type { ImportJob, ImportedSignal, ImportSourceType } from '@/integrations/supabase/veilor-types';
import { C } from '@/lib/colors';
import { Link, FileText, Clipboard, Tag, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SOURCE_ICONS: Record<ImportSourceType, React.ReactNode> = {
  url:       <Link size={14} />,
  file:      <FileText size={14} />,
  clipboard: <Clipboard size={14} />,
  notion:    <FileText size={14} />,
  twitter:   <Tag size={14} />,
};

const STATUS_INFO: Record<ImportJob['status'], { icon: React.ReactNode; color: string; label: string }> = {
  pending:    { icon: <Clock size={12} />,         color: '#9C9590', label: '대기 중' },
  processing: { icon: <Clock size={12} />,         color: C.amber,   label: '처리 중' },
  done:       { icon: <CheckCircle size={12} />,   color: '#7FB89A', label: '완료' },
  failed:     { icon: <AlertCircle size={12} />,   color: '#C97A6A', label: '실패' },
};

function SignalCard({ signal }: { signal: ImportedSignal }) {
  const typeColor: Record<string, string> = { quote: C.amber, article: '#6B9EC9', note: '#7FB89A', link: '#9C9590' };
  const color = signal.signal_type ? (typeColor[signal.signal_type] ?? C.text4) : C.text4;
  return (
    <div style={{ background: '#242120', borderRadius: 12, padding: '12px', marginBottom: 8 }}>
      {signal.signal_type && (
        <span style={{ fontSize: 9, color, border: `1px solid ${color}44`, borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'monospace' }}>
          {signal.signal_type}
        </span>
      )}
      {signal.title && <p style={{ fontSize: 13, color: C.text, marginTop: 6, marginBottom: 4, fontFamily: "'Cormorant Garamond', serif" }}>{signal.title}</p>}
      {signal.body && <p style={{ fontSize: 12, color: C.text4, lineHeight: 1.6 }}>{signal.body.slice(0, 200)}{signal.body.length > 200 ? '...' : ''}</p>}
      {signal.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {signal.tags.map(t => (
            <span key={t} style={{ fontSize: 10, color: C.text4, background: '#2A2724', borderRadius: 4, padding: '2px 6px' }}>#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: ImportJob }) {
  const [expanded, setExpanded] = useState(false);
  const info = STATUS_INFO[job.status];

  const { data: signals = [] } = useQuery({
    queryKey: ['imported_signals', job.id],
    enabled: expanded && job.status === 'done',
    queryFn: async () => {
      const { data } = await veilorDb.from('imported_signals')
        .select('*').eq('job_id', job.id).order('imported_at', { ascending: false });
      return (data ?? []) as ImportedSignal[];
    },
  });

  return (
    <div style={{ background: '#1C1917', border: `1px solid ${C.border2}`, borderRadius: 16, marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: job.status === 'done' ? 'pointer' : 'default' }}
        onClick={() => job.status === 'done' && setExpanded(p => !p)}>
        <span style={{ color: C.text4 }}>{SOURCE_ICONS[job.source_type]}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: C.text }}>
            {job.source_url ? job.source_url.slice(0, 40) + (job.source_url.length > 40 ? '...' : '') : job.source_type}
          </p>
          <p style={{ fontSize: 10, color: C.text4 }}>{new Date(job.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: info.color }}>
          {info.icon}
          <span style={{ fontSize: 11 }}>{info.label}</span>
        </div>
      </div>
      {expanded && job.status === 'done' && (
        <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${C.border2}` }}>
          <div style={{ paddingTop: 10 }}>
            {signals.length === 0
              ? <p style={{ color: C.text4, fontSize: 12, textAlign: 'center', padding: '8px 0' }}>추출된 신호 없음</p>
              : signals.map(s => <SignalCard key={s.id} signal={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentImportPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [sourceType, setSourceType] = useState<ImportSourceType>('url');
  const [sourceUrl, setSourceUrl] = useState('');
  const [clipText, setClipText] = useState('');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['import_jobs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await veilorDb.from('import_jobs')
        .select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return (data ?? []) as ImportJob[];
    },
  });

  const { mutate: createJob, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('로그인 필요');
      const payload: Partial<ImportJob> = { user_id: user.id, source_type: sourceType, status: 'pending' };
      if (sourceType === 'url') payload.source_url = sourceUrl.trim();
      const { error } = await veilorDb.from('import_jobs').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['import_jobs', user?.id] });
      setSourceUrl(''); setClipText('');
      toast({ title: '임포트 요청이 등록됐습니다' });
    },
    onError: () => toast({ title: '요청 실패', variant: 'destructive' }),
  });

  const sourceTypes: ImportSourceType[] = ['url', 'clipboard', 'notion', 'twitter'];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipText(text);
      setSourceType('clipboard');
    } catch {
      toast({ title: '클립보드 접근 권한이 필요합니다', variant: 'destructive' });
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border2}` }}>
        <span style={{ fontSize: 22, color: C.text, fontFamily: "'Cormorant Garamond', serif" }}>Content Import</span>
        <p style={{ fontSize: 10, color: C.text4, margin: '2px 0 0', letterSpacing: '.02em' }}>외부 콘텐츠 · 신호 임포트</p>
      </div>

      {/* 입력 영역 */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border2}` }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {sourceTypes.map(t => (
            <button key={t} onClick={() => setSourceType(t)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 4px', borderRadius: 8, fontSize: 11, cursor: 'pointer', border: 'none',
                background: sourceType === t ? `color-mix(in srgb, ${C.amber} 15%, #1C1917)` : '#2A2724',
                color: sourceType === t ? C.amber : C.text4 }}>
              {SOURCE_ICONS[t]}{t}
            </button>
          ))}
        </div>

        {sourceType === 'url' && (
          <input placeholder="https://..." value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
            style={{ width: '100%', background: '#2A2724', border: `1px solid ${C.border2}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
        )}

        {sourceType === 'clipboard' && (
          <div style={{ marginBottom: 10 }}>
            <button onClick={handlePaste}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#2A2724', color: C.text4, border: `1px solid ${C.border2}`, fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
              <Clipboard size={13} />클립보드에서 붙여넣기
            </button>
            {clipText && (
              <div style={{ background: '#2A2724', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.text4, lineHeight: 1.5, maxHeight: 80, overflow: 'hidden' }}>
                {clipText.slice(0, 200)}
              </div>
            )}
          </div>
        )}

        {(sourceType === 'notion' || sourceType === 'twitter') && (
          <div style={{ background: '#2A2724', borderRadius: 10, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={13} color={C.text4} />
            <span style={{ fontSize: 12, color: C.text4 }}>{sourceType === 'notion' ? 'Notion 통합은 준비 중입니다' : 'Twitter/X 통합은 준비 중입니다'}</span>
          </div>
        )}

        <button
          onClick={() => createJob()}
          disabled={isPending || (sourceType === 'url' && !sourceUrl.trim()) || (sourceType === 'clipboard' && !clipText) || sourceType === 'notion' || sourceType === 'twitter'}
          style={{ width: '100%', padding: '10px', borderRadius: 10, background: C.amber, color: '#1C1917', border: 'none', fontSize: 13, cursor: 'pointer',
            opacity: (isPending || (sourceType === 'url' && !sourceUrl.trim()) || sourceType === 'notion' || sourceType === 'twitter') ? 0.5 : 1 }}>
          {isPending ? '등록 중...' : '임포트 요청'}
        </button>
      </div>

      {/* 히스토리 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <p style={{ fontSize: 11, color: C.text4, marginBottom: 12, letterSpacing: '.02em' }}>임포트 히스토리</p>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 20 }}>불러오는 중...</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.text4, fontSize: 13, marginTop: 40 }}>
            <FileText size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>아직 임포트 기록이 없습니다</p>
          </div>
        ) : (
          jobs.map(j => <JobCard key={j.id} job={j} />)
        )}
      </div>
    </div>
  );
}
