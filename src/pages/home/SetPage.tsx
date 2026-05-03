// Set — 이제 바꾸고 싶다
// 기능: CODETALK 100일 키워드 기록 + 경계 설정 / Ax Mercer 3조건 합의 체크리스트
// Stage 2-2: Ax Mercer 3조건 (경계, 합의, 소통) 아코디언 체크리스트 추가

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetTranslations } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb, supabase } from '@/integrations/supabase/client';
import type { VeilorUserBoundary, VeilorConsentChecklist } from '@/integrations/supabase/veilor-types';
import { toast } from '@/hooks/use-toast';
import { saveSetSignal } from '@/hooks/useSignalPipeline';
import { usePremiumTrigger } from '@/hooks/usePremiumTrigger';
import UpgradeModal from '@/components/premium/UpgradeModal';
import CodetalkTab from '@/components/set/CodetalkTab';
import CoupleTalkTab from '@/components/set/CoupleTalkTab';
import BoundaryTab, { ALL_AX_MERCER_KEYS, BOUNDARY_CATEGORY_KEYS, type BoundaryCategory } from '@/components/set/BoundaryTab';
import StoryFeedTab from '@/components/set/StoryFeedTab';
import MiniToolsCard from '@/components/set/MiniToolsCard';
import ConcernRouter from '@/components/set/ConcernRouter';
import PersonaBranding from '@/components/set/PersonaBranding';
import RelationshipSimulation from '@/components/set/RelationshipSimulation';
import RelationshipCoaching from '@/components/set/RelationshipCoaching';
import ExperientialContent from '@/components/content/ExperientialContent';

type Tab = 'codetalk' | 'boundary' | 'feed' | 'tools' | 'practice' | 'us';

type ConditionKey = 'no_cross_boundary' | 'safe_to_speak' | 'can_withdraw';

export default function SetPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const set = useSetTranslations();
  const { isPro, tryAccess, modalOpen: premiumModalOpen, activeTrigger, closeModal } = usePremiumTrigger();
  const [tab, setTab] = useState<Tab>('codetalk');
  const [entry, setEntry] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  // --- 경계 설정 로컬 상태 ---
  const [boundaryTexts, setBoundaryTexts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    BOUNDARY_CATEGORY_KEYS.forEach(k => { init[k] = ''; });
    return init;
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
    if (!isPro && !tryAccess('codetalk_ai_limit')) return;
    if (!user || !todayEntry) return;
    setAiInsightLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('codetalk-ai-insights', {
        body: { entry_id: todayEntry.id, user_id: user.id },
      });
      if (!error && data?.insights) {
        const { insight, pattern, growth, affirmation } = data.insights;
        setAiInsight([insight, pattern, growth, affirmation].filter(Boolean).join('\n\n'));
      }
    } catch {
      toast({ title: set.insightError, variant: 'destructive' });
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
      if (!keyword) throw new Error(set.insightError);
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

      toast({ title: set.codetalk.savedToast });
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
      toast({ title: set.boundary.savedToast });
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
      toast({ title: newChecked ? set.boundary.consentChecked : set.boundary.consentUnchecked });
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
    const prefixMap: Record<string, string> = { boundary: 'bnd_', consent: 'cns_', communication: 'com_' };
    const prefix = prefixMap[sectionId];
    if (!prefix) return { checked: 0, total: 0, pct: 0 };
    const sectionKeys = ALL_AX_MERCER_KEYS.filter(k => k.startsWith(prefix));
    const total = sectionKeys.length;
    const checked = sectionKeys.filter(k => axMercerChecks[k]).length;
    return { checked, total, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
  };

  const totalAxProgress = (() => {
    const total = ALL_AX_MERCER_KEYS.length;
    const checked = ALL_AX_MERCER_KEYS.filter(k => axMercerChecks[k]).length;
    return { checked, total, pct: total > 0 ? Math.round((checked / total) * 100) : 0 };
  })();

  const SET_TABS: [Tab, string][] = [
    ['codetalk', set.tabs.codetalk],
    ['boundary', set.tabs.boundary],
    ['us', set.tabs2.us],
    ['tools', set.tabs2.tools],
    ['practice', set.tabs2.practice],
    ['feed', set.tabs.feed],
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* PC: 세로 탭 사이드바 */}
      <nav className="hidden lg:flex flex-col flex-shrink-0 border-r border-border"
        style={{ width: 140, padding: '24px 12px', gap: 4 }}>
        <div className="mb-4 px-2">
          <h2 className="text-base font-semibold">{set.header}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{set.sidebarSubtitle}</p>
        </div>
        {SET_TABS.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors
              ${tab === t ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            {label}
          </button>
        ))}
      </nav>

      {/* 모바일: 가로 탭바 */}
      <div className="lg:hidden px-4 pt-5 pb-0">
        <div>
          <h2 className="text-lg font-semibold">{set.header}</h2>
          <p className="text-sm text-muted-foreground mt-1">{set.subtitle}</p>
        </div>
        <div className="bg-card border rounded-2xl p-1 flex mt-4">
          {SET_TABS.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 px-0.5 rounded-xl text-xs font-medium transition-colors truncate
                ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 px-4 py-5 lg:py-6 space-y-5 overflow-y-auto max-w-3xl">
      {tab === 'codetalk' ? (
        isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
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
        )
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
                    {set.sexSelfBanner.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)' }}>
                    SexSelf
                  </span>
                </div>
                <p className="text-xs font-light" style={{ color: 'rgba(236,72,153,0.7)' }}>
                  {set.sexSelfBanner.desc}
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
      ) : tab === 'us' ? (
        <CoupleTalkTab />
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
        <StoryFeedTab
          keyword={keyword}
          publicFeed={publicFeed}
        />
      )}
      </div>

      <UpgradeModal open={premiumModalOpen} trigger={activeTrigger} onClose={closeModal} />
    </div>
  );
}
