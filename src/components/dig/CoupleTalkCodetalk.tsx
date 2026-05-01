import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { useCoupleTalkSession } from '@/hooks/useCoupleTalk';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { VeilorCodetalkKeyword, CoupleCodetalkSession } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    noPartnerTitle: '파트너가 연결되지 않았어요',
    noPartnerDesc: '함께 하는 코드토크는 파트너 연결 후 이용 가능해요.',
    goConnectPartner: 'Us 탭에서 파트너 연결하기 →',
    pendingListTitle: '진행 중인 함께 코드토크',
    statusBothDone: '비교 준비 완료',
    statusMyDone: '파트너 대기 중',
    statusNeedMine: '내 기록 필요',
    newKeywordStart: '+ 새 키워드로 시작하기',
    newKeywordDesc: '카테고리 선택 → 키워드 선택',
    modeSelectTitle: '탐색 방식 선택',
    backToList: '← 목록',
    byRelation: '관계 유형으로',
    byRelationDesc: '연인·가족·친구·나',
    byPsych: '심리 주제로',
    byPsychDesc: '애착·감정·경계·욕구',
    categoryRelTitle: '관계 유형 선택',
    categoryPsychTitle: '심리 주제 선택',
    backBtn: '← 뒤로',
    keywordSearch: '키워드 검색…',
    noResults: '검색 결과가 없어요.',
    backToCategory: '← 카테고리',
    formDesc: '파트너와 각자 기록한 뒤, 둘 다 완료되면 비교 화면이 열려요.',
    backToListBtn: '← 목록',
    freePlaceholder: '자유롭게 적어주세요 (최대 500자)',
    prev: '이전',
    saving: '저장 중…',
    save: '저장',
    next: '다음',
    waitingPartner: '파트너가 기록 중이에요.',
    waitingDesc: '둘 다 완료되면 비교 화면이 열려요.',
    checkReveal: '완료 확인하기',
    backToListShort: '목록으로',
    revealSuffix: '— 비교',
    listBtn: '목록 →',
    me: '나',
    partner: '파트너',
    exploreMore: '다른 키워드 함께 탐색하기',
    toastBothDone: '둘 다 기록 완료! 비교 화면을 열어요.',
    toastMyDone: '내 기록 저장 완료 ✓ 파트너를 기다리는 중이에요.',
    toastPartnerWaiting: '파트너가 아직 기록 중이에요.',
    errNoPartner: '파트너가 연결되지 않았습니다',
    errSessionFail: '세션 생성에 실패했습니다',
    errEntrySave: '답변 저장에 실패했습니다',
    errSessionUpdate: '세션 업데이트에 실패했습니다',
    steps: {
      definition:        { label: '정의', prompt: '이 키워드를 당신만의 언어로 정의한다면?' },
      imprinting_moment: { label: '각인', prompt: '이 키워드가 처음 각인된 기억이나 순간은?' },
      root_cause:        { label: '원인', prompt: '왜 이것이 지금의 관계에서 반복되는 것 같나요?' },
    },
    relCategories: [
      { code: 'rel_lover',   label: '연인·파트너', emoji: '💑' },
      { code: 'rel_family',  label: '가족',         emoji: '🏡' },
      { code: 'rel_friend',  label: '친구·동료',    emoji: '🤝' },
      { code: 'rel_self',    label: '나 자신',      emoji: '🪞' },
      { code: 'rel_society', label: '사회·세상',    emoji: '🌐' },
    ],
    psychCategories: [
      { code: 'psych_attachment', label: '애착·거리감',    emoji: '🔗' },
      { code: 'psych_emotion',    label: '감정·수용',       emoji: '🌊' },
      { code: 'psych_boundary',   label: '경계·소통',       emoji: '🚪' },
      { code: 'psych_desire',     label: '욕구·친밀감',     emoji: '🔥' },
      { code: 'psych_identity',   label: '정체성·자존감',   emoji: '🧭' },
      { code: 'psych_trauma',     label: '각인·반복',       emoji: '🌀' },
      { code: 'psych_growth',     label: '성장·변화',       emoji: '🌱' },
      { code: 'psych_sexuality',  label: '몸·섹슈얼리티',   emoji: '✨' },
    ],
  },
  en: {
    noPartnerTitle: 'No partner connected',
    noPartnerDesc: 'Codetalk together is available after connecting a partner.',
    goConnectPartner: 'Connect a partner in the Us tab →',
    pendingListTitle: 'Ongoing Codetalk sessions',
    statusBothDone: 'Ready to compare',
    statusMyDone: 'Waiting for partner',
    statusNeedMine: 'My entry needed',
    newKeywordStart: '+ Start with a new keyword',
    newKeywordDesc: 'Select category → select keyword',
    modeSelectTitle: 'Choose exploration mode',
    backToList: '← List',
    byRelation: 'By relationship type',
    byRelationDesc: 'Partner · Family · Friends · Self',
    byPsych: 'By psychological topic',
    byPsychDesc: 'Attachment · Emotion · Boundary · Desire',
    categoryRelTitle: 'Select relationship type',
    categoryPsychTitle: 'Select psychological topic',
    backBtn: '← Back',
    keywordSearch: 'Search keywords…',
    noResults: 'No results found.',
    backToCategory: '← Categories',
    formDesc: 'Each of you records separately — when both are done, the comparison screen opens.',
    backToListBtn: '← List',
    freePlaceholder: 'Write freely (max 500 characters)',
    prev: 'Previous',
    saving: 'Saving…',
    save: 'Save',
    next: 'Next',
    waitingPartner: 'Your partner is recording.',
    waitingDesc: 'The comparison screen opens when both are done.',
    checkReveal: 'Check if done',
    backToListShort: 'Back to list',
    revealSuffix: '— Compare',
    listBtn: 'List →',
    me: 'Me',
    partner: 'Partner',
    exploreMore: 'Explore another keyword together',
    toastBothDone: 'Both entries done! Opening the comparison screen.',
    toastMyDone: 'My entry saved ✓ Waiting for your partner.',
    toastPartnerWaiting: 'Your partner is still recording.',
    errNoPartner: 'No partner connected',
    errSessionFail: 'Failed to create session',
    errEntrySave: 'Failed to save entry',
    errSessionUpdate: 'Failed to update session',
    steps: {
      definition:        { label: 'Define',   prompt: 'How would you define this keyword in your own words?' },
      imprinting_moment: { label: 'Imprint',  prompt: 'What memory or moment first imprinted this keyword?' },
      root_cause:        { label: 'Root',     prompt: 'Why do you think this keeps repeating in your relationships now?' },
    },
    relCategories: [
      { code: 'rel_lover',   label: 'Partner · Lover',       emoji: '💑' },
      { code: 'rel_family',  label: 'Family',                 emoji: '🏡' },
      { code: 'rel_friend',  label: 'Friends · Colleagues',   emoji: '🤝' },
      { code: 'rel_self',    label: 'Myself',                 emoji: '🪞' },
      { code: 'rel_society', label: 'Society · World',        emoji: '🌐' },
    ],
    psychCategories: [
      { code: 'psych_attachment', label: 'Attachment · Distance',    emoji: '🔗' },
      { code: 'psych_emotion',    label: 'Emotion · Acceptance',      emoji: '🌊' },
      { code: 'psych_boundary',   label: 'Boundary · Communication',  emoji: '🚪' },
      { code: 'psych_desire',     label: 'Desire · Intimacy',         emoji: '🔥' },
      { code: 'psych_identity',   label: 'Identity · Self-worth',     emoji: '🧭' },
      { code: 'psych_trauma',     label: 'Imprint · Repetition',      emoji: '🌀' },
      { code: 'psych_growth',     label: 'Growth · Change',           emoji: '🌱' },
      { code: 'psych_sexuality',  label: 'Body · Sexuality',          emoji: '✨' },
    ],
  },
} as const;

type StepKey = 'definition' | 'imprinting_moment' | 'root_cause';
const STEP_KEYS: StepKey[] = ['definition', 'imprinting_moment', 'root_cause'];

type RelCode = 'rel_lover' | 'rel_family' | 'rel_friend' | 'rel_self' | 'rel_society';
type PsychCode = 'psych_attachment' | 'psych_emotion' | 'psych_boundary' | 'psych_desire' | 'psych_identity' | 'psych_trauma' | 'psych_growth' | 'psych_sexuality';
type SelectedCategory = RelCode | PsychCode | null;
type ExploreMode = 'rel' | 'psych';

type View =
  | 'no-partner'
  | 'pending-list'
  | 'mode'
  | 'category'
  | 'list'
  | 'form'
  | 'waiting'
  | 'reveal';

interface EntrySnapshot {
  definition: string;
  imprinting_moment: string;
  root_cause: string;
}

interface PendingSession {
  id: string;
  keyword: string;
  created_at: string | null;
  user_a_id: string;
  user_b_id: string;
  entry_a_id: string | null;
  entry_b_id: string | null;
}

export default function CoupleTalkCodetalk() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const { data: coupleSession, isLoading: sessionLoading } = useCoupleTalkSession();
  const isConnected = !!(coupleSession?.user_b_id);
  const partnerId = coupleSession
    ? coupleSession.user_a_id === user?.id
      ? coupleSession.user_b_id ?? null
      : coupleSession.user_a_id
    : null;

  const [view, setView]                     = useState<View>(isConnected ? 'pending-list' : 'no-partner');
  const [exploreMode, setExploreMode]       = useState<ExploreMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>(null);
  const [search, setSearch]                 = useState('');
  const [selectedKw, setSelectedKw]         = useState<VeilorCodetalkKeyword | null>(null);
  const [activeSession, setActiveSession]   = useState<CoupleCodetalkSession | null>(null);

  const [step, setStep]   = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<StepKey, string>>>({});

  useState(() => {
    if (!sessionLoading && !isConnected) setView('no-partner');
  });

  const { data: pendingSessions = [] } = useQuery({
    queryKey: ['couple-codetalk-pending', user?.id],
    queryFn: async (): Promise<PendingSession[]> => {
      if (!user) return [];
      const { data } = await veilorDb
        .from('couple_codetalk_sessions')
        .select('id, keyword, created_at, user_a_id, user_b_id, entry_a_id, entry_b_id')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .is('revealed_at', null)
        .order('created_at', { ascending: false })
        .limit(10);
      return (data ?? []) as PendingSession[];
    },
    enabled: !!user && isConnected,
    staleTime: 1000 * 30,
  });

  const { data: keywords = [], isLoading: kwLoading } = useQuery({
    queryKey: ['codetalk-keywords', exploreMode, selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const col = exploreMode === 'rel' ? 'rel_tags' : 'psych_tags';
      const { data } = await veilorDb
        .from('codetalk_keywords')
        .select('*')
        .contains(col, [selectedCategory])
        .order('keyword');
      return (data ?? []) as VeilorCodetalkKeyword[];
    },
    enabled: !!user && !!selectedCategory,
    staleTime: 1000 * 60 * 10,
  });

  const filteredKws = search.trim()
    ? keywords.filter(k => k.keyword.toLowerCase().includes(search.trim().toLowerCase()))
    : keywords;

  const { data: entryA } = useQuery({
    queryKey: ['codetalk-entry', activeSession?.entry_a_id],
    queryFn: async (): Promise<EntrySnapshot | null> => {
      const { data } = await veilorDb
        .from('codetalk_entries')
        .select('definition, imprinting_moment, root_cause')
        .eq('id', activeSession!.entry_a_id!)
        .single();
      return data as EntrySnapshot | null;
    },
    enabled: !!activeSession?.entry_a_id && view === 'reveal',
  });

  const { data: entryB } = useQuery({
    queryKey: ['codetalk-entry', activeSession?.entry_b_id],
    queryFn: async (): Promise<EntrySnapshot | null> => {
      const { data } = await veilorDb
        .from('codetalk_entries')
        .select('definition, imprinting_moment, root_cause')
        .eq('id', activeSession!.entry_b_id!)
        .single();
      return data as EntrySnapshot | null;
    },
    enabled: !!activeSession?.entry_b_id && view === 'reveal',
  });

  const createSessionMutation = useMutation({
    mutationFn: async (kw: VeilorCodetalkKeyword): Promise<CoupleCodetalkSession> => {
      if (!user || !partnerId) throw new Error(s.errNoPartner);
      const { data, error } = await veilorDb
        .from('couple_codetalk_sessions')
        .insert({
          keyword_id: kw.id,
          keyword: kw.keyword,
          user_a_id: user.id,
          user_b_id: partnerId,
        })
        .select('*')
        .single();
      if (error || !data) throw new Error(s.errSessionFail);
      return data as CoupleCodetalkSession;
    },
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: ['couple-codetalk-pending', user?.id] });
      setActiveSession(session);
      setStep(0);
      setAnswers({});
      setView('form');
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  const saveEntryMutation = useMutation({
    mutationFn: async () => {
      if (!user || !activeSession || !selectedKw) return;
      const { data: entry, error } = await veilorDb
        .from('codetalk_entries')
        .insert({
          user_id: user.id,
          keyword_id: activeSession.keyword_id,
          keyword: activeSession.keyword,
          definition: answers.definition ?? '',
          imprinting_moment: answers.imprinting_moment ?? '',
          root_cause: answers.root_cause ?? '',
          is_public: false,
          entry_date: new Date().toISOString().slice(0, 10),
        })
        .select('id')
        .single();
      if (error || !entry) throw new Error(s.errEntrySave);

      const isUserA = activeSession.user_a_id === user.id;
      const entryField = isUserA ? 'entry_a_id' : 'entry_b_id';

      const { data: updated, error: updateErr } = await veilorDb
        .from('couple_codetalk_sessions')
        .update({ [entryField]: entry.id })
        .eq('id', activeSession.id)
        .select('*')
        .single();
      if (updateErr || !updated) throw new Error(s.errSessionUpdate);

      const sess = updated as CoupleCodetalkSession;

      if (sess.entry_a_id && sess.entry_b_id) {
        await veilorDb
          .from('couple_codetalk_sessions')
          .update({ revealed_at: new Date().toISOString() })
          .eq('id', sess.id);
        return { ...sess, revealed_at: new Date().toISOString() } as CoupleCodetalkSession;
      }
      return sess;
    },
    onSuccess: (updated) => {
      if (!updated) return;
      qc.invalidateQueries({ queryKey: ['couple-codetalk-pending', user?.id] });
      setActiveSession(updated);
      if (updated.entry_a_id && updated.entry_b_id) {
        toast({ title: s.toastBothDone });
        setView('reveal');
      } else {
        toast({ title: s.toastMyDone });
        setView('waiting');
      }
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  const currentStepKey = STEP_KEYS[step];
  const isLastStep  = step === STEP_KEYS.length - 1;

  const handleSelectKeyword = (kw: VeilorCodetalkKeyword) => {
    setSelectedKw(kw);
    createSessionMutation.mutate(kw);
  };

  const handleNext = () => {
    if (!answers[currentStepKey]?.trim()) return;
    if (isLastStep) saveEntryMutation.mutate();
    else setStep(sv => sv + 1);
  };

  const handleOpenPending = (ps: PendingSession) => {
    const isUserA = ps.user_a_id === user?.id;
    const myEntryId = isUserA ? ps.entry_a_id : ps.entry_b_id;
    const bothDone  = !!(ps.entry_a_id && ps.entry_b_id);

    setActiveSession({
      id: ps.id,
      keyword_id: '',
      keyword: ps.keyword,
      user_a_id: ps.user_a_id,
      user_b_id: ps.user_b_id,
      entry_a_id: ps.entry_a_id,
      entry_b_id: ps.entry_b_id,
      revealed_at: null,
      created_at: ps.created_at,
    });
    setStep(0);
    setAnswers({});
    setSelectedKw(null);

    if (bothDone) {
      setView('reveal');
    } else if (myEntryId) {
      setView('waiting');
    } else {
      setView('form');
    }
  };

  const handleCheckReveal = async () => {
    if (!activeSession) return;
    const { data } = await veilorDb
      .from('couple_codetalk_sessions')
      .select('*')
      .eq('id', activeSession.id)
      .single();
    if (!data) return;
    const sess = data as CoupleCodetalkSession;
    setActiveSession(sess);
    if (sess.entry_a_id && sess.entry_b_id) {
      if (!sess.revealed_at) {
        await veilorDb
          .from('couple_codetalk_sessions')
          .update({ revealed_at: new Date().toISOString() })
          .eq('id', sess.id);
      }
      setView('reveal');
    } else {
      toast({ title: s.toastPartnerWaiting });
    }
  };

  const currentCategoryLabel = (() => {
    if (!selectedCategory) return '';
    const relCat = s.relCategories.find(c => c.code === selectedCategory);
    if (relCat) return relCat.label;
    const psychCat = s.psychCategories.find(c => c.code === selectedCategory);
    return psychCat?.label ?? '';
  })();

  const myEntry  = activeSession?.user_a_id === user?.id ? entryA : entryB;
  const prtEntry = activeSession?.user_a_id === user?.id ? entryB : entryA;

  if (sessionLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── 파트너 미연결 ── */}
      {(!isConnected || view === 'no-partner') && (
        <div className="bg-card border rounded-2xl p-5 space-y-3 text-center">
          <p className="text-sm font-medium">{s.noPartnerTitle}</p>
          <p className="text-xs text-muted-foreground">{s.noPartnerDesc}</p>
          <Button size="sm" variant="outline" onClick={() => navigate('/home/set')}>
            {s.goConnectPartner}
          </Button>
        </div>
      )}

      {/* ── 대기 중인 세션 목록 ── */}
      {isConnected && view === 'pending-list' && (
        <div className="space-y-3">
          {pendingSessions.length > 0 && (
            <div className="bg-card border rounded-2xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">{s.pendingListTitle}</p>
              {pendingSessions.map(ps => {
                const isUserA  = ps.user_a_id === user?.id;
                const myDone   = isUserA ? !!ps.entry_a_id : !!ps.entry_b_id;
                const prtDone  = isUserA ? !!ps.entry_b_id : !!ps.entry_a_id;
                return (
                  <button
                    key={ps.id}
                    onClick={() => handleOpenPending(ps)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-transparent hover:border-primary/40 hover:bg-muted/40 text-left transition-colors"
                  >
                    <span className="text-sm font-medium">{ps.keyword}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {myDone && prtDone ? s.statusBothDone : myDone ? s.statusMyDone : s.statusNeedMine}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={() => setView('mode')}
            className="w-full p-4 rounded-2xl border border-dashed border-primary/40 hover:border-primary text-left transition-colors"
          >
            <p className="text-sm font-medium">{s.newKeywordStart}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.newKeywordDesc}</p>
          </button>
        </div>
      )}

      {/* ── 모드 선택 (rel / psych) ── */}
      {isConnected && view === 'mode' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{s.modeSelectTitle}</p>
            <button onClick={() => setView('pending-list')} className="text-xs text-muted-foreground hover:text-foreground">
              {s.backToList}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setExploreMode('rel'); setView('category'); }}
              className="p-4 rounded-2xl border text-left hover:border-primary/60 transition-colors"
            >
              <p className="text-sm font-medium">{s.byRelation}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.byRelationDesc}</p>
            </button>
            <button
              onClick={() => { setExploreMode('psych'); setView('category'); }}
              className="p-4 rounded-2xl border text-left hover:border-primary/60 transition-colors"
            >
              <p className="text-sm font-medium">{s.byPsych}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.byPsychDesc}</p>
            </button>
          </div>
        </div>
      )}

      {/* ── 카테고리 선택 ── */}
      {isConnected && view === 'category' && (
        <div className="bg-card border rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-muted-foreground">
              {exploreMode === 'rel' ? s.categoryRelTitle : s.categoryPsychTitle}
            </p>
            <button onClick={() => setView('mode')} className="text-xs text-muted-foreground hover:text-foreground">
              {s.backBtn}
            </button>
          </div>
          {(exploreMode === 'rel' ? s.relCategories : s.psychCategories).map(cat => (
            <button
              key={cat.code}
              onClick={() => { setSelectedCategory(cat.code as SelectedCategory); setSearch(''); setView('list'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-primary/40 hover:bg-muted/40 text-left transition-colors"
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── 키워드 목록 ── */}
      {isConnected && view === 'list' && (
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{currentCategoryLabel}</span>
            <button onClick={() => setView('category')} className="text-xs text-muted-foreground hover:text-foreground">
              {s.backToCategory}
            </button>
          </div>
          <input
            type="text"
            placeholder={s.keywordSearch}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          {kwLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {filteredKws.map(kw => (
                <button
                  key={kw.id}
                  onClick={() => handleSelectKeyword(kw)}
                  disabled={createSessionMutation.isPending}
                  className="px-3 py-1.5 rounded-xl border text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {kw.keyword}
                </button>
              ))}
              {filteredKws.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">{s.noResults}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 3단계 입력 폼 ── */}
      {isConnected && view === 'form' && activeSession && (
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{activeSession.keyword}</span>
            <button onClick={() => setView('list')} className="text-xs text-muted-foreground hover:text-foreground">
              {s.backToListBtn}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{s.formDesc}</p>

          {/* 스텝 인디케이터 */}
          <div className="flex gap-2 items-center">
            {STEP_KEYS.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                  ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {s.steps[key].label}
                </span>
                {i < STEP_KEYS.length - 1 && <div className="w-4 h-px bg-muted" />}
              </div>
            ))}
          </div>

          <p className="text-sm font-medium">{s.steps[currentStepKey].prompt}</p>
          <Textarea
            key={currentStepKey}
            placeholder={s.freePlaceholder}
            maxLength={500}
            value={answers[currentStepKey] ?? ''}
            onChange={e => setAnswers(prev => ({ ...prev, [currentStepKey]: e.target.value }))}
            className="h-28 resize-none"
          />

          <div className="flex justify-between items-center">
            {step > 0 ? (
              <button onClick={() => setStep(sv => sv - 1)} className="text-xs text-muted-foreground underline underline-offset-2">
                {s.prev}
              </button>
            ) : (
              <span />
            )}
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!answers[currentStepKey]?.trim() || saveEntryMutation.isPending}
            >
              {isLastStep
                ? (saveEntryMutation.isPending ? s.saving : s.save)
                : s.next}
            </Button>
          </div>
        </div>
      )}

      {/* ── 파트너 대기 화면 ── */}
      {isConnected && view === 'waiting' && activeSession && (
        <div className="bg-card border rounded-2xl p-5 space-y-4 text-center">
          <p className="text-sm font-medium">{activeSession.keyword}</p>
          <div className="py-4 space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">{s.waitingPartner}</p>
            <p className="text-[10px] text-muted-foreground">{s.waitingDesc}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCheckReveal}>
              {s.checkReveal}
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setView('pending-list')}>
              {s.backToListShort}
            </Button>
          </div>
        </div>
      )}

      {/* ── 비교 화면 ── */}
      {isConnected && view === 'reveal' && activeSession && (
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{activeSession.keyword} {s.revealSuffix}</p>
            <button onClick={() => setView('pending-list')} className="text-xs text-muted-foreground hover:text-foreground">
              {s.listBtn}
            </button>
          </div>

          {(!myEntry || !prtEntry) ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {STEP_KEYS.map(key => (
                <div key={key} className="border rounded-xl overflow-hidden">
                  <div className="bg-muted/40 px-3 py-1.5">
                    <span className="text-xs font-medium">{s.steps[key].label}</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x">
                    <div className="p-3 space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground">{s.me}</p>
                      <p className="text-xs leading-relaxed">{myEntry[key] || '—'}</p>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground">{s.partner}</p>
                      <p className="text-xs leading-relaxed">{prtEntry[key] || '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={() => setView('mode')}>
            {s.exploreMore}
          </Button>
        </div>
      )}
    </div>
  );
}
