// Set — 이제 바꾸고 싶다
// 기능: CODETALK 100일 키워드 기록 + 경계 설정 / Ax Mercer 3조건 합의 체크리스트
// Stage 2-2: Ax Mercer 3조건 (경계, 합의, 소통) 아코디언 체크리스트 추가

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb, supabase } from '@/integrations/supabase/client';
import type { VeilorUserBoundary, VeilorConsentChecklist } from '@/integrations/supabase/veilor-types';
import { toast } from '@/hooks/use-toast';
import { saveSetSignal } from '@/hooks/useSignalPipeline';
import CodetalkTab from '@/components/set/CodetalkTab';
import BoundaryTab, { ALL_AX_MERCER_KEYS, AX_MERCER_SECTIONS, type BoundaryCategory } from '@/components/set/BoundaryTab';
import AxMercerTab from '@/components/set/AxMercerTab';
import MiniToolsCard from '@/components/set/MiniToolsCard';
import ConcernRouter from '@/components/set/ConcernRouter';
import PersonaBranding from '@/components/set/PersonaBranding';
import RelationshipSimulation from '@/components/set/RelationshipSimulation';
import RelationshipCoaching from '@/components/set/RelationshipCoaching';
import ExperientialContent from '@/components/content/ExperientialContent';

type Tab = 'codetalk' | 'boundary' | 'feed' | 'tools' | 'practice';

type ConditionKey = 'no_cross_boundary' | 'safe_to_speak' | 'can_withdraw';

export default function SetPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('codetalk');
  const [entry, setEntry] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  // --- 경계 설정 로컬 상태 ---
  const [boundaryTexts, setBoundaryTexts] = useState<Record<string, string>>({
    emotional: '', physical: '', time: '', digital: '',
  });
  const [checkedConditions, setCheckedConditions] = useState<Record<string, boolean>>({
    no_cross_boundary: false, safe_to_speak: false, can_withdraw: false,
  });

  // --- Ax Mercer 3조건 체크리스트 상태 ---
  const [axMercerChecks, setAxMercerChecks] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ALL_AX_MERCER_KEYS.forEach(k => { init[k] = false; });
    return init;
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    boundary: true, consent: false, communication: false,
  });

  // ========== CODETALK 쿼리 ==========
  const { data: keyword, isLoading } = useQuery({
    queryKey: ['codetalk-today', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data: profile } = await veilorDb
        .from('user_profiles')
        .select('codetalk_day').eq('user_id', user.id).single();
      const day = profile?.codetalk_day ?? 1;
      const { data } = await veilorDb
        .from('codetalk_keywords')
        .select('*').eq('day_number', day).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: todayEntry } = useQuery({
    queryKey: ['codetalk-entry-today', user?.id, keyword?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const today = new Date().toLocaleDateString('sv-SE');
      const { data } = await veilorDb
        .from('codetalk_entries')
        .select('*').eq('user_id', user.id).eq('keyword_id', keyword.id)
        .eq('entry_date', today).single();
      return data;
    },
    enabled: !!user && !!keyword,
  });

  const requestCodetalkInsight = async () => {
    if (!user || !todayEntry) return;
    setAiInsightLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('codetalk-ai-insights', {
        body: { entry_id: todayEntry.id, user_id: user.id },
      });
      if (!error && data?.insight) {
        setAiInsight(data.insight);
      }
    } catch {
      toast({ title: 'AI 인사이트를 생성하지 못했어요', variant: 'destructive' });
    } finally {
      setAiInsightLoading(false);
    }
  };

  const { data: pastEntries } = useQuery({
    queryKey: ['codetalk-history', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data } = await veilorDb
        .from('codetalk_entries')
        .select('*, codetalk_keywords(keyword, day_number)')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: publicFeed } = useQuery({
    queryKey: ['codetalk-public', keyword?.id],
    queryFn: async () => {
      const today = new Date().toLocaleDateString('sv-SE');
      const { data } = await veilorDb
        .from('codetalk_entries')
        .select('id, content, created_at, user_id')
        .eq('keyword_id', keyword.id)
        .eq('is_public', true)
        .eq('entry_date', today)
        .order('created_at', { ascending: false })
        .limit(30);
      return data ?? [];
    },
    enabled: !!keyword && tab === 'feed',
  });

  // ========== 경계 설정 쿼리 ==========
  const { data: savedBoundaries } = useQuery({
    queryKey: ['user-boundaries', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data } = await veilorDb
        .from('user_boundaries')
        .select('*').eq('user_id', user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: savedChecklist } = useQuery({
    queryKey: ['consent-checklist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data } = await veilorDb
        .from('consent_checklist')
        .select('*').eq('user_id', user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // DB 데이터 → 로컬 상태 동기화
  useEffect(() => {
    if (savedBoundaries) {
      const texts: Record<string, string> = { emotional: '', physical: '', time: '', digital: '' };
      savedBoundaries.forEach((b: VeilorUserBoundary) => { texts[b.category] = b.boundary_text ?? ''; });
      setBoundaryTexts(texts);
    }
  }, [savedBoundaries]);

  useEffect(() => {
    if (savedChecklist) {
      const checks: Record<string, boolean> = { no_cross_boundary: false, safe_to_speak: false, can_withdraw: false };
      const axChecks: Record<string, boolean> = {};
      ALL_AX_MERCER_KEYS.forEach(k => { axChecks[k] = false; });

      savedChecklist.forEach((c: VeilorConsentChecklist) => {
        const key = c.condition_key;
        if (key in checks) {
          checks[key] = c.is_checked ?? false;
        }
        if (key in axChecks) {
          axChecks[key] = c.is_checked ?? false;
        }
      });
      setCheckedConditions(checks);
      setAxMercerChecks(axChecks);
    }
  }, [savedChecklist]);

  // ========== 뮤테이션 ==========
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!keyword) throw new Error('오늘의 키워드를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      const today = new Date().toLocaleDateString('sv-SE');
      await veilorDb.from('codetalk_entries').upsert({
        user_id: user.id,
        keyword_id: keyword.id,
        keyword: keyword.keyword ?? '',
        definition: entry,
        content: entry,
        entry_date: today,
        is_public: isPublic,
      }, { onConflict: 'user_id,keyword_id,entry_date' });
      const { data: profile } = await veilorDb
        .from('user_profiles')
        .select('codetalk_day').eq('user_id', user.id).single();
      const nextDay = Math.min((profile?.codetalk_day ?? 1) + 1, 100);
      await veilorDb.from('user_profiles')
        .update({ codetalk_day: nextDay }).eq('user_id', user.id);
    },
    onSuccess: () => {
      // user_signals 테이블에 Set 시그널 저장
      if (user && keyword) {
        saveSetSignal(user.id, {
          keyword: keyword.keyword ?? '',
          dayNumber: keyword.day_number ?? 1,
          definition: entry,
        }).catch(err => console.error('[SetPage] saveSetSignal failed:', err));
      }

      toast({ title: '기록 저장 완료 ✓' });
      setEntry('');
      qc.invalidateQueries({ queryKey: ['codetalk-today'] });
      qc.invalidateQueries({ queryKey: ['codetalk-history'] });
      qc.invalidateQueries({ queryKey: ['codetalk-public'] });
    },
  });

  const saveBoundaryMutation = useMutation({
    mutationFn: async (category: BoundaryCategory) => {
      if (!user) throw new Error('Not authenticated');
      await veilorDb.from('user_boundaries').upsert(
        {
          user_id: user.id,
          category,
          boundary_text: boundaryTexts[category],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,category' }
      );
    },
    onSuccess: () => {
      toast({ title: '경계 저장 완료 ✓' });
      qc.invalidateQueries({ queryKey: ['user-boundaries'] });
    },
  });

  // Used by BoundaryTab component
  const toggleConsentMutation = useMutation({ // eslint-disable-line @typescript-eslint/no-unused-vars
    mutationFn: async (conditionKey: ConditionKey) => {
      if (!user) throw new Error('Not authenticated');
      const newChecked = !checkedConditions[conditionKey];
      await veilorDb.from('consent_checklist').upsert(
        {
          user_id: user.id,
          condition_key: conditionKey,
          is_checked: newChecked,
          checked_at: newChecked ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,condition_key' }
      );
      return { conditionKey, newChecked };
    },
    onSuccess: ({ conditionKey, newChecked }) => {
      setCheckedConditions(prev => ({ ...prev, [conditionKey]: newChecked }));
      toast({ title: newChecked ? '약속을 확인했어요 ✓' : '약속을 해제했어요' });
      qc.invalidateQueries({ queryKey: ['consent-checklist'] });
    },
  });

  // Ax Mercer 체크리스트 토글 (consent_checklist 테이블 재활용)
  const toggleAxMercerMutation = useMutation({
    mutationFn: async (itemKey: string) => {
      if (!user) throw new Error('Not authenticated');
      const newChecked = !axMercerChecks[itemKey];
      await veilorDb.from('consent_checklist').upsert(
        {
          user_id: user.id,
          condition_key: itemKey,
          is_checked: newChecked,
          checked_at: newChecked ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,condition_key' }
      );
      return { itemKey, newChecked };
    },
    onSuccess: ({ itemKey, newChecked }) => {
      setAxMercerChecks(prev => ({ ...prev, [itemKey]: newChecked }));
      qc.invalidateQueries({ queryKey: ['consent-checklist'] });
    },
  });

  // 섹션 토글
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Ax Mercer 완료율 계산
  const getAxMercerProgress = (sectionId: string) => {
    const section = AX_MERCER_SECTIONS.find(s => s.id === sectionId);
    if (!section) return { checked: 0, total: 0, pct: 0 };
    const total = section.items.length;
    const checked = section.items.filter(i => axMercerChecks[i.key]).length;
    return { checked, total, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
  };

  const totalAxProgress = (() => {
    const total = ALL_AX_MERCER_KEYS.length;
    const checked = ALL_AX_MERCER_KEYS.filter(k => axMercerChecks[k]).length;
    return { checked, total, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
  })();

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Set</h2>
        <p className="text-sm text-muted-foreground mt-1">오늘의 언어로 나를 재설정해요.</p>
      </div>

      {/* 탭 */}
      <div className="bg-card border rounded-2xl p-1 flex">
        {([['codetalk', '키워드'], ['boundary', '경계'], ['tools', '도구'], ['practice', '실천'], ['feed', '스토리']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
              ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'codetalk' ? (
        <CodetalkTab
          keyword={keyword}
          todayEntry={todayEntry}
          pastEntries={pastEntries}
          entry={entry}
          setEntry={setEntry}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          saveMutation={saveMutation}
          aiInsight={aiInsight}
          aiInsightLoading={aiInsightLoading}
          onRequestInsight={requestCodetalkInsight}
        />
      ) : tab === 'boundary' ? (
        <>
          {/* SexSelf 진입 배너 — 경계 탭 상단에 위치 */}
          <button
            onClick={() => navigate('/home/sexself/questions')}
            className="w-full rounded-2xl p-4 text-left transition-all mb-1"
            style={{
              background: 'rgba(236,72,153,0.05)',
              border: '1px solid rgba(236,72,153,0.2)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌸</span>
                  <span className="text-sm font-medium" style={{ color: '#ec4899' }}>
                    성적 자아 탐색
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)' }}>
                    SexSelf
                  </span>
                </div>
                <p className="text-xs font-light" style={{ color: 'rgba(236,72,153,0.7)' }}>
                  나는 어떤 성적 존재인가 — 욕구 패턴·수치심·표현 능력 진단
                </p>
              </div>
              <span style={{ color: 'rgba(236,72,153,0.5)', fontSize: 18 }}>›</span>
            </div>
          </button>
          <BoundaryTab
          boundaryTexts={boundaryTexts}
          setBoundaryTexts={setBoundaryTexts}
          saveBoundaryMutation={saveBoundaryMutation}
          axMercerChecks={axMercerChecks}
          toggleAxMercerMutation={toggleAxMercerMutation}
          openSections={openSections}
          toggleSection={toggleSection}
          totalAxProgress={totalAxProgress}
          getAxMercerProgress={getAxMercerProgress}
        />
        </>
      ) : tab === 'tools' ? (
        <div className="space-y-4">
          <MiniToolsCard />
          <ConcernRouter />
          <PersonaBranding />
        </div>
      ) : tab === 'practice' ? (
        <div className="space-y-4">
          <RelationshipSimulation />
          <RelationshipCoaching />
          <ExperientialContent />
        </div>
      ) : (
        <AxMercerTab
          keyword={keyword}
          publicFeed={publicFeed}
        />
      )}
    </div>
  );
}
