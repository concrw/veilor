// Set — 이제 바꾸고 싶다
// 기능: CODETALK 100일 키워드 기록 + 경계 설정 / Ax Mercer 3조건 합의 체크리스트

import { useState, useEffect } from 'react';
import { useSetTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb, supabase } from '@/integrations/supabase/client';
import type { VeilorUserBoundary, VeilorConsentChecklist } from '@/integrations/supabase/veilor-types';
import { toast } from '@/hooks/use-toast';
import { saveSetSignal } from '@/hooks/useSignalPipeline';
import { usePremiumTrigger } from '@/hooks/usePremiumTrigger';
import UpgradeModal from '@/components/premium/UpgradeModal';
import { ALL_AX_MERCER_KEYS, BOUNDARY_CATEGORY_KEYS, type BoundaryCategory } from '@/components/set/BoundaryTab';
import StoryFeedTab from '@/components/set/StoryFeedTab';
import MiniToolsCard from '@/components/set/MiniToolsCard';
import ConcernRouter from '@/components/set/ConcernRouter';
import PersonaBranding from '@/components/set/PersonaBranding';
import RelationshipSimulation from '@/components/set/RelationshipSimulation';
import RelationshipCoaching from '@/components/set/RelationshipCoaching';
import ExperientialContent from '@/components/content/ExperientialContent';
import MantraCorner from '@/components/set/MantraCorner';
import CoupleTalkTab from '@/components/set/CoupleTalkTab';
import CommunityInlineEmbed from '@/components/community/CommunityInlineEmbed';
import { useDomain } from '@/context/DomainContext';
import { SetPageCodetalkSection } from '@/components/set/SetPageCodetalkSection';
import { SetPageBoundarySection } from '@/components/set/SetPageBoundarySection';
import { C } from '@/lib/colors';
import { AmberBtn } from '@/layouts/HomeLayout';
import { useAmberAttention } from '@/hooks/useAmberAttention';
import AmberSheet from '@/components/vent/AmberSheet';
import { useVentTranslations } from '@/hooks/useTranslation';

const SET_ACCENT = '#F59E0B';

type Tab = 'codetalk' | 'boundary' | 'feed' | 'tools' | 'practice' | 'us' | 'mantra';
type CodetalkMode = 'hub' | 'daily' | 'category' | 'relation';
type ConditionKey = 'no_cross_boundary' | 'safe_to_speak' | 'can_withdraw';

export default function SetPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { language } = useLanguageContext();
  const set = useSetTranslations();
  const vent = useVentTranslations();
  const { domain } = useDomain();
  const { isPro, tryAccess, modalOpen: premiumModalOpen, activeTrigger, closeModal } = usePremiumTrigger();
  const amberFlash = useAmberAttention();
  const [amberOpen, setAmberOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('codetalk');
  const [codetalkMode, setCodetalkMode] = useState<CodetalkMode>('hub');
  const [entry, setEntry] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  const [boundaryTexts, setBoundaryTexts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    BOUNDARY_CATEGORY_KEYS.forEach(k => { init[k] = ''; });
    return init;
  });
  const [checkedConditions, setCheckedConditions] = useState<Record<string, boolean>>({
    no_cross_boundary: false, safe_to_speak: false, can_withdraw: false,
  });
  const [axMercerChecks, setAxMercerChecks] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ALL_AX_MERCER_KEYS.forEach(k => { init[k] = false; });
    return init;
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    boundary: true, consent: false, communication: false,
  });

  // ── Codetalk 쿼리 ────────────────────────────────────────────────────────
  const { data: keyword, isLoading } = useQuery({
    queryKey: ['codetalk-today', user?.id, language],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data: profile } = await veilorDb.from('user_profiles').select('codetalk_day').eq('user_id', user.id).single();
      const day = profile?.codetalk_day ?? 1;
      const { data } = await veilorDb.from('codetalk_keywords').select('*').eq('day_number', day).eq('lang', language).maybeSingle();
      if (data) return data;
      const { data: fallback } = await veilorDb.from('codetalk_keywords').select('*').eq('day_number', day).eq('lang', 'ko').maybeSingle();
      return fallback;
    },
    enabled: !!user,
  });

  const { data: todayEntry } = useQuery({
    queryKey: ['codetalk-entry-today', user?.id, keyword?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const today = new Date().toLocaleDateString('sv-SE');
      const { data } = await veilorDb.from('codetalk_entries').select('*').eq('user_id', user.id).eq('keyword_id', keyword.id).eq('entry_date', today).single();
      return data;
    },
    enabled: !!user && !!keyword,
  });

  const { data: pastEntries } = useQuery({
    queryKey: ['codetalk-history', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data } = await veilorDb.from('codetalk_entries').select('*, codetalk_keywords(keyword, day_number)').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: publicFeed } = useQuery({
    queryKey: ['codetalk-public', keyword?.id],
    queryFn: async () => {
      const today = new Date().toLocaleDateString('sv-SE');
      const { data } = await veilorDb.from('codetalk_entries').select('id, content, created_at, user_id').eq('keyword_id', keyword.id).eq('is_public', true).eq('entry_date', today).order('created_at', { ascending: false }).limit(30);
      return data ?? [];
    },
    enabled: !!keyword && tab === 'feed',
  });

  // ── 경계 설정 쿼리 ────────────────────────────────────────────────────────
  const { data: savedBoundaries } = useQuery({
    queryKey: ['user-boundaries', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data } = await veilorDb.from('user_boundaries').select('*').eq('user_id', user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: savedChecklist } = useQuery({
    queryKey: ['consent-checklist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data } = await veilorDb.from('consent_checklist').select('*').eq('user_id', user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

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
        if (key in checks) checks[key] = c.is_checked ?? false;
        if (key in axChecks) axChecks[key] = c.is_checked ?? false;
      });
      setCheckedConditions(checks);
      setAxMercerChecks(axChecks);
    }
  }, [savedChecklist]);

  // ── 뮤테이션 ──────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!keyword) throw new Error(set.insightError);
      const today = new Date().toLocaleDateString('sv-SE');
      await veilorDb.from('codetalk_entries').upsert({
        user_id: user.id, keyword_id: keyword.id, keyword: keyword.keyword ?? '',
        definition: entry, content: entry, entry_date: today, is_public: isPublic,
      }, { onConflict: 'user_id,keyword_id,entry_date' });
      const { data: profile } = await veilorDb.from('user_profiles').select('codetalk_day').eq('user_id', user.id).single();
      const nextDay = Math.min((profile?.codetalk_day ?? 1) + 1, 100);
      await veilorDb.from('user_profiles').update({ codetalk_day: nextDay }).eq('user_id', user.id);
    },
    onSuccess: () => {
      if (user && keyword) {
        saveSetSignal(user.id, { keyword: keyword.keyword ?? '', dayNumber: keyword.day_number ?? 1, definition: entry })
          .catch(err => console.error('[SetPage] saveSetSignal failed:', err));
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
        { user_id: user.id, category, boundary_text: boundaryTexts[category], updated_at: new Date().toISOString() },
        { onConflict: 'user_id,category' }
      );
    },
    onSuccess: () => {
      toast({ title: set.boundary.savedToast });
      qc.invalidateQueries({ queryKey: ['user-boundaries'] });
    },
  });

  const toggleConsentMutation = useMutation({ // eslint-disable-line @typescript-eslint/no-unused-vars
    mutationFn: async (conditionKey: ConditionKey) => {
      if (!user) throw new Error('Not authenticated');
      const newChecked = !checkedConditions[conditionKey];
      await veilorDb.from('consent_checklist').upsert(
        { user_id: user.id, condition_key: conditionKey, is_checked: newChecked, checked_at: newChecked ? new Date().toISOString() : null },
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

  const toggleAxMercerMutation = useMutation({
    mutationFn: async (itemKey: string) => {
      if (!user) throw new Error('Not authenticated');
      const newChecked = !axMercerChecks[itemKey];
      await veilorDb.from('consent_checklist').upsert(
        { user_id: user.id, condition_key: itemKey, is_checked: newChecked, checked_at: newChecked ? new Date().toISOString() : null },
        { onConflict: 'user_id,condition_key' }
      );
      return { itemKey, newChecked };
    },
    onSuccess: ({ itemKey, newChecked }) => {
      setAxMercerChecks(prev => ({ ...prev, [itemKey]: newChecked }));
      qc.invalidateQueries({ queryKey: ['consent-checklist'] });
    },
  });

  const requestCodetalkInsight = async () => {
    if (!isPro && !tryAccess('codetalk_ai_limit')) return;
    if (!user || !todayEntry) return;
    setAiInsightLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('codetalk-ai-insights', { body: { entry_id: todayEntry.id, user_id: user.id } });
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

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

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

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === 'codetalk') setCodetalkMode('hub');
  };

  const SET_TABS: [Tab, string][] = [
    ['codetalk', set.tabs.codetalk],
    ['boundary', set.tabs.boundary],
    ['mantra', set.tabs2.mantra],
    ['us', set.tabs2.us],
    ['tools', set.tabs2.tools],
    ['practice', set.tabs2.practice],
    ['feed', set.tabs.feed],
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* 고정 헤더 */}
      <div className="flex-shrink-0 flex items-center gap-[10px] px-4 py-2" style={{ borderBottom: `1px solid ${C.border2}` }}>
        <div className="flex flex-col gap-[2px] flex-shrink-0">
          <span className="text-[22px] leading-none tracking-[.01em]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: C.text }}>{set.header}</span>
          <span className="text-[10px] font-light tracking-[.02em]" style={{ color: C.text4 }}>{set.subtitle}</span>
        </div>
        <div className="flex-1" />
        <AmberBtn onClick={() => setAmberOpen(true)} flash={amberFlash} />
      </div>

      <div className="flex flex-col flex-1 lg:flex-row overflow-hidden">
      {/* PC: 세로 탭 사이드바 */}
      <nav className="hidden lg:flex flex-col flex-shrink-0 border-r border-border"
        style={{ width: 140, padding: '24px 12px', gap: 4 }}>
        {SET_TABS.map(([t, label]) => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors
              ${tab === t ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            {label}
          </button>
        ))}
      </nav>

      {/* 모바일: 가로 탭바 */}
      <div className="lg:hidden px-4 pt-5 pb-0">
        <div className="bg-card border rounded-2xl p-1 flex mt-0">
          {SET_TABS.map(([t, label]) => (
            <button key={t} onClick={() => handleTabChange(t)}
              className={`flex-1 py-2 px-0.5 rounded-xl text-xs font-medium transition-colors truncate
                ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 px-4 py-5 lg:py-6 space-y-5 overflow-y-auto max-w-3xl">
        {tab === 'codetalk' ? (
          <SetPageCodetalkSection
            isLoading={isLoading}
            codetalkMode={codetalkMode}
            setCodetalkMode={setCodetalkMode}
            keyword={keyword}
            todayEntry={todayEntry}
            pastEntries={pastEntries ?? []}
            entry={entry}
            setEntry={setEntry}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            saveMutation={saveMutation}
            aiInsight={aiInsight}
            aiInsightLoading={aiInsightLoading}
            onRequestInsight={requestCodetalkInsight}
            backLabel="← MODES"
          />
        ) : tab === 'boundary' ? (
          <SetPageBoundarySection
            boundaryTexts={boundaryTexts}
            setBoundaryTexts={setBoundaryTexts}
            saveBoundaryMutation={saveBoundaryMutation}
            axMercerChecks={axMercerChecks}
            toggleAxMercerMutation={toggleAxMercerMutation}
            openSections={openSections}
            toggleSection={toggleSection}
            totalAxProgress={totalAxProgress}
            getAxMercerProgress={getAxMercerProgress}
            sexSelfTitle={set.sexSelfBanner.title}
            sexSelfDesc={set.sexSelfBanner.desc}
          />
        ) : tab === 'mantra' ? (
          <MantraCorner domain={domain} />
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
          <>
            <CommunityInlineEmbed tab="set" accent={SET_ACCENT} />
            <StoryFeedTab keyword={keyword} publicFeed={publicFeed} />
          </>
        )}
      </div>

      <UpgradeModal open={premiumModalOpen} trigger={activeTrigger} onClose={closeModal} />
      </div>
      <AmberSheet open={amberOpen} onClose={() => setAmberOpen(false)} aiName={vent.amberName} />
    </div>
  );
}
