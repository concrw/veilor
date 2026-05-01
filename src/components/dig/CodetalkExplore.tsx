import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import type { VeilorCodetalkKeyword } from '@/integrations/supabase/veilor-types';
import CoupleTalkCodetalk from './CoupleTalkCodetalk';
import { useDigTranslations } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/context/LanguageContext';
import { useUserLanguages } from '@/hooks/useUserLanguages';

const ANON_ALIASES = {
  ko: {
    adjectives: ['조용한', '따뜻한', '솔직한', '깊은', '유연한'],
    nouns: ['달', '별', '숲', '강', '빛'],
  },
  en: {
    adjectives: ['Quiet', 'Warm', 'Honest', 'Deep', 'Flexible'],
    nouns: ['Moon', 'Star', 'Forest', 'River', 'Light'],
  },
} as const;

type StepKey = 'definition' | 'imprinting_moment' | 'root_cause';

const STEP_KEYS: StepKey[] = ['definition', 'imprinting_moment', 'root_cause'];

interface PublicEntry {
  anon_alias: string | null;
  definition: string | null;
  imprinting_moment: string | null;
  root_cause: string | null;
  created_at: string;
}

type TopMode = 'solo' | 'together';
type ViewState = 'entry' | 'list' | 'form' | 'feed';
type ExploreMode = 'rel' | 'psych';

const REL_CODES = ['rel_lover', 'rel_family', 'rel_friend', 'rel_self', 'rel_society'] as const;
const PSYCH_CODES = ['psych_attachment', 'psych_emotion', 'psych_boundary', 'psych_desire', 'psych_identity', 'psych_trauma', 'psych_growth', 'psych_sexuality'] as const;
const REL_EMOJIS: Record<string, string> = { rel_lover: '💑', rel_family: '🏡', rel_friend: '🤝', rel_self: '🪞', rel_society: '🌐' };
const PSYCH_EMOJIS: Record<string, string> = { psych_attachment: '🔗', psych_emotion: '🌊', psych_boundary: '🚪', psych_desire: '🔥', psych_identity: '🧭', psych_trauma: '🌀', psych_growth: '🌱', psych_sexuality: '✨' };

type RelCode   = typeof REL_CODES[number];
type PsychCode = typeof PSYCH_CODES[number];
type SelectedCategory = RelCode | PsychCode | null;

export default function CodetalkExplore() {
  const { user } = useAuth();
  const dig = useDigTranslations();
  const { language } = useLanguageContext();
  const userLanguages = useUserLanguages();

  const [topMode, setTopMode] = useState<TopMode | null>(null);
  const [view, setView]                     = useState<ViewState>('entry');
  const [exploreMode, setExploreMode]       = useState<ExploreMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>(null);
  const [search, setSearch]                 = useState('');
  const [selected, setSelected]             = useState<VeilorCodetalkKeyword | null>(null);
  const [step, setStep]                     = useState(0);
  const [answers, setAnswers]               = useState<Partial<Record<StepKey, string>>>({});
  const [isPublic, setIsPublic]             = useState(false);
  const [savedKeywordId, setSavedKeywordId] = useState<string | null>(null);

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['codetalk-keywords', exploreMode, selectedCategory, userLanguages],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const col = exploreMode === 'rel' ? 'rel_tags' : 'psych_tags';
      const { data } = await veilorDb
        .from('codetalk_keywords')
        .select('*')
        .contains(col, [selectedCategory])
        .in('lang', userLanguages)
        .order('keyword');
      return (data ?? []) as VeilorCodetalkKeyword[];
    },
    enabled: !!user && !!selectedCategory,
    staleTime: 1000 * 60 * 10,
  });

  const { data: publicFeed = [] } = useQuery({
    queryKey: ['codetalk-explore-feed', savedKeywordId, userLanguages],
    queryFn: async () => {
      const { data } = await veilorDb
        .from('codetalk_entries')
        .select('anon_alias, definition, imprinting_moment, root_cause, created_at')
        .eq('keyword_id', savedKeywordId!)
        .eq('is_public', true)
        .in('lang', userLanguages)
        .neq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      return (data ?? []) as PublicEntry[];
    },
    enabled: !!user && !!savedKeywordId && view === 'feed',
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return keywords;
    return keywords.filter(k => k.keyword.toLowerCase().includes(q));
  }, [keywords, search]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selected) return;

      let alias: string | null = null;
      const { data: existing } = await veilorDb
        .from('anon_author_map')
        .select('anon_alias')
        .eq('real_user_id', user.id)
        .eq('context', 'codetalk')
        .maybeSingle();

      if (existing) {
        alias = existing.anon_alias;
      } else if (isPublic) {
        const aliasPool = ANON_ALIASES[language] ?? ANON_ALIASES.ko;
        alias =
          aliasPool.adjectives[Math.floor(Math.random() * aliasPool.adjectives.length)] +
          ' ' +
          aliasPool.nouns[Math.floor(Math.random() * aliasPool.nouns.length)];
        await veilorDb
          .from('anon_author_map')
          .insert({ real_user_id: user.id, anon_alias: alias, context: 'codetalk' });
      }

      await veilorDb.from('codetalk_entries').insert({
        user_id: user.id,
        keyword_id: selected.id,
        keyword: selected.keyword,
        definition: answers.definition ?? '',
        imprinting_moment: answers.imprinting_moment ?? '',
        root_cause: answers.root_cause ?? '',
        is_public: isPublic,
        anon_alias: alias,
        entry_date: new Date().toISOString().slice(0, 10),
        lang: language,
      });
    },
    onSuccess: () => {
      toast({ title: dig.codetalk.savedToast });
      setSavedKeywordId(selected!.id);
      setView('feed');
    },
  });

  const currentStepKey = STEP_KEYS[step];
  const isLastStep     = step === STEP_KEYS.length - 1;

  const handleSelectKeyword = (kw: VeilorCodetalkKeyword) => {
    setSelected(kw);
    setStep(0);
    setAnswers({});
    setIsPublic(false);
    setSavedKeywordId(null);
    setView('form');
  };

  const handleNext = () => {
    if (!answers[currentStepKey]?.trim()) return;
    if (isLastStep) saveMutation.mutate();
    else setStep(s => s + 1);
  };

  const handleBackToList = () => {
    setSelected(null);
    setView('list');
    setSearch('');
  };

  const handleSelectMode = (mode: ExploreMode) => {
    setExploreMode(mode);
    setSelectedCategory(null);
  };

  const handleSelectCategory = (code: SelectedCategory) => {
    setSelectedCategory(code);
    setView('list');
    setSearch('');
    setSelected(null);
  };

  const handleBackToEntry = () => {
    setView('entry');
    setExploreMode(null);
    setSelectedCategory(null);
    setSearch('');
    setSelected(null);
  };

  const handleBackToCategory = () => {
    setView('entry');
    setSelectedCategory(null);
    setSearch('');
    setSelected(null);
  };

  const currentCategoryLabel = useMemo(() => {
    if (!selectedCategory) return '';
    if (exploreMode === 'rel') return dig.codetalk.relCategories[selectedCategory] ?? selectedCategory;
    return dig.codetalk.psychCategories[selectedCategory] ?? selectedCategory;
  }, [selectedCategory, exploreMode, dig.codetalk]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">{dig.codetalk.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{dig.codetalk.subtitle}</p>
      </div>

      {/* ── 상단: 혼자 / 함께 모드 선택 ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTopMode('solo')}
          className={`p-3 rounded-2xl border text-left transition-colors ${
            topMode === 'solo' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
          }`}
        >
          <p className="text-sm font-medium">{dig.codetalk.soloMode}</p>
          <p className="text-xs text-muted-foreground mt-1">{dig.codetalk.soloModeDesc}</p>
        </button>
        <button
          onClick={() => setTopMode('together')}
          className={`p-3 rounded-2xl border text-left transition-colors ${
            topMode === 'together' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
          }`}
        >
          <p className="text-sm font-medium">{dig.codetalk.togetherMode}</p>
          <p className="text-xs text-muted-foreground mt-1">{dig.codetalk.togetherModeDesc}</p>
        </button>
      </div>

      {/* ── 함께 모드: CoupleTalkCodetalk 위임 ── */}
      {topMode === 'together' && <CoupleTalkCodetalk />}

      {/* ── 혼자 모드 (기존 로직) ── */}
      {topMode === 'solo' && (
      <>

      {/* ── 진입 화면: 모드 & 카테고리 선택 ── */}
      {view === 'entry' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSelectMode('rel')}
              className={`p-4 rounded-2xl border text-left transition-colors ${
                exploreMode === 'rel' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
              }`}
            >
              <p className="text-sm font-medium">{dig.codetalk.byRelation}</p>
              <p className="text-xs text-muted-foreground mt-1">{dig.codetalk.byRelationDesc}</p>
            </button>
            <button
              onClick={() => handleSelectMode('psych')}
              className={`p-4 rounded-2xl border text-left transition-colors ${
                exploreMode === 'psych' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
              }`}
            >
              <p className="text-sm font-medium">{dig.codetalk.byPsych}</p>
              <p className="text-xs text-muted-foreground mt-1">{dig.codetalk.byPsychDesc}</p>
            </button>
          </div>

          {exploreMode === 'rel' && (
            <div className="bg-card border rounded-2xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-3">{dig.codetalk.selectRelation}</p>
              {REL_CODES.map(code => (
                <button
                  key={code}
                  onClick={() => handleSelectCategory(code)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-primary/40 hover:bg-muted/40 text-left transition-colors"
                >
                  <span className="text-lg">{REL_EMOJIS[code]}</span>
                  <span className="text-sm">{dig.codetalk.relCategories[code]}</span>
                </button>
              ))}
            </div>
          )}

          {exploreMode === 'psych' && (
            <div className="bg-card border rounded-2xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-3">{dig.codetalk.selectPsych}</p>
              {PSYCH_CODES.map(code => (
                <button
                  key={code}
                  onClick={() => handleSelectCategory(code)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-primary/40 hover:bg-muted/40 text-left transition-colors"
                >
                  <span className="text-lg">{PSYCH_EMOJIS[code]}</span>
                  <span className="text-sm">{dig.codetalk.psychCategories[code]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 키워드 목록 ── */}
      {view === 'list' && (
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{currentCategoryLabel}</span>
            <button onClick={handleBackToCategory} className="text-xs text-muted-foreground hover:text-foreground">
              {dig.codetalk.backToCategory}
            </button>
          </div>
          <input
            type="text"
            placeholder={dig.codetalk.keywordSearch}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm bg-muted/40 border border-border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {filtered.map(kw => (
                <button
                  key={kw.id}
                  onClick={() => handleSelectKeyword(kw)}
                  className="px-3 py-1.5 rounded-xl border text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                >
                  {kw.keyword}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">{dig.codetalk.noResults}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 3단계 입력 폼 ── */}
      {view === 'form' && selected && (
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{selected.keyword}</span>
            <button onClick={handleBackToList} className="text-xs text-muted-foreground hover:text-foreground">{dig.codetalk.backToList}</button>
          </div>
          {selected.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{selected.description}</p>
          )}

          {/* 스텝 인디케이터 */}
          <div className="flex gap-2 items-center">
            {STEP_KEYS.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                  ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {dig.codetalk.steps[key]}
                </span>
                {i < STEP_KEYS.length - 1 && <div className="w-4 h-px bg-muted" />}
              </div>
            ))}
          </div>

          <p className="text-sm font-medium">{dig.codetalk.stepPrompts[currentStepKey]}</p>
          <Textarea
            key={currentStepKey}
            placeholder={dig.codetalk.freePlaceholder}
            maxLength={500}
            value={answers[currentStepKey] ?? ''}
            onChange={e => setAnswers(prev => ({ ...prev, [currentStepKey]: e.target.value }))}
            className="h-28 resize-none"
          />

          {isLastStep && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <span>{isPublic ? dig.codetalk.publicToggle : dig.codetalk.privateToggle}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="text-xs text-muted-foreground underline underline-offset-2">{dig.codetalk.prev}</button>
            ) : (
              <button onClick={handleBackToList} className="text-xs text-muted-foreground underline underline-offset-2">{dig.codetalk.backToList}</button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!answers[currentStepKey]?.trim() || saveMutation.isPending}
            >
              {isLastStep ? (saveMutation.isPending ? dig.codetalk.saving : dig.codetalk.save) : dig.codetalk.next}
            </Button>
          </div>
        </div>
      )}

      {/* ── 저장 후 공개 피드 ── */}
      {view === 'feed' && selected && (
        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{dig.codetalk.otherEntries.replace('{keyword}', selected.keyword)}</p>
            <button onClick={handleBackToList} className="text-xs text-muted-foreground hover:text-foreground">{dig.codetalk.exploreMore}</button>
          </div>

          {publicFeed.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">{dig.codetalk.noPublicEntries}</p>
          ) : (
            <div className="space-y-3">
              {publicFeed.map((entry, i) => (
                <div key={i} className="border rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{entry.anon_alias ?? dig.codetalk.anonymous}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {entry.definition && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{entry.definition}</p>
                  )}
                  {entry.imprinting_moment && (
                    <p className="text-[10px] text-muted-foreground/70 line-clamp-2">{entry.imprinting_moment}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={handleBackToEntry}>
            {dig.codetalk.backToEntry}
          </Button>
        </div>
      )}

      </>
      )}
    </div>
  );
}
