import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode, type UXMode, DOMAIN_MODES } from '@/context/ModeContext';
import { useDomain, type Domain } from '@/context/DomainContext';
import { useLanguageContext } from '@/context/LanguageContext';

// ──────────────────────────────────────────────────────────────────────────────
// i18n
// ──────────────────────────────────────────────────────────────────────────────

const S = {
  ko: {
    brandSubtitle: '관계의 가면을 발견하는 여정',
    sidebarHint: '나에게 맞는 방식을 선택하세요.\n언제든 설정에서 바꿀 수 있습니다.',
    step1Header: '어떤 퍼포먼스를\n관리하고 싶으신가요?',
    step1Sub: '도메인을 선택하면 맞춤 기능이 열립니다',
    step2Header: '어떤 방식으로\n베일러를 쓰고 싶으신가요?',
    step2Sub: '언제든 설정에서 바꿀 수 있습니다',
    selected: '선택됨',
    back: '이전',
    skipBtn: '지금은 기본 모드로 시작할게요',
    confirm: {
      original: '털어놓으러 가기',
      clear: '대시보드 보러 가기',
      routine: '루틴 시작하기',
      focus: '집중 시작하기',
      sprint: '스프린트 시작하기',
      connect: '연결 시작하기',
      mirror: '패턴 보러 가기',
      social: '관심 영역 탐색하기',
    },
    domains: {
      self:     { name: '나',    sub: '나의 퍼포먼스',    desc: '감정·에너지·루틴 중심 자기 관리' },
      work:     { name: '업무',  sub: '업무 퍼포먼스',    desc: '집중·태스크·시간 예측으로 실행력 관리' },
      relation: { name: '관계',  sub: '관계 퍼포먼스',    desc: '관계 온도·패턴 인식으로 연결 관리' },
      social:   { name: '사회',  sub: '사회관리 퍼포먼스', desc: '관심 영역·기여·임팩트 중심 사회적 실천 관리' },
    },
    modes: {
      original: { name: '오리지널',  tagline: '말하지 않아도 알 것 같은 공간',     keywords: ['감성적', '비구조적', '대화 중심'] },
      clear:    { name: '클리어',    tagline: '지금 어디쯤 와 있는지 한눈에',      keywords: ['구조적', '진척 중심', '대시보드'] },
      routine:  { name: '루틴',      tagline: '매일 30초로 쌓이는 나의 숫자',      keywords: ['습관', '데이터', '스트릭'] },
      focus:    { name: '포커스',    tagline: '딥워크 — 오늘 집중할 것에만',       keywords: ['딥워크', '타이머', '워크리스트'] },
      sprint:   { name: '스프린트',  tagline: '주간 실행력을 숫자로',              keywords: ['TBQC', '주간 성과', '메타인지'] },
      connect:  { name: '커넥트',    tagline: '관계 온도를 느껴보세요',            keywords: ['관계', '온도', '연결'] },
      mirror:   { name: '미러',      tagline: '관계 패턴을 발견하세요',            keywords: ['패턴', '인식', '인사이트'] },
      social:   { name: '소셜',      tagline: '세상 어디에 기여하고 싶은지 발견',  keywords: ['관심 영역', '임팩트', '기여'] },
    },
  },
  en: {
    brandSubtitle: 'Discover your relationship language',
    sidebarHint: 'Choose the style that suits you.\nYou can change it anytime in settings.',
    step1Header: 'Which performance area\ndo you want to manage?',
    step1Sub: 'Selecting a domain unlocks tailored features',
    step2Header: 'How would you like\nto use Veilor?',
    step2Sub: 'You can change this anytime in settings',
    selected: 'Selected',
    back: 'Back',
    skipBtn: 'Start with default mode for now',
    confirm: {
      original: 'Go vent',
      clear: 'See dashboard',
      routine: 'Start routine',
      focus: 'Start focus',
      sprint: 'Start sprint',
      connect: 'Start connecting',
      mirror: 'See patterns',
      social: 'Explore interests',
    },
    domains: {
      self:     { name: 'Self',         sub: 'My Performance',           desc: 'Emotion, energy, and routine-centered self-management' },
      work:     { name: 'Work',         sub: 'Work Performance',         desc: 'Manage execution with focus, tasks, and time prediction' },
      relation: { name: 'Relationship', sub: 'Relationship Performance', desc: 'Manage connection with relationship temperature and pattern recognition' },
      social:   { name: 'Social',       sub: 'Social Performance',       desc: 'Track interest areas, contributions, and social impact over time' },
    },
    modes: {
      original: { name: 'Original',  tagline: 'A space that just gets it',            keywords: ['Emotional', 'Unstructured', 'Conversation-first'] },
      clear:    { name: 'Clear',     tagline: 'See exactly where you stand',          keywords: ['Structured', 'Progress-focused', 'Dashboard'] },
      routine:  { name: 'Routine',   tagline: '30 seconds a day builds your numbers', keywords: ['Habits', 'Data', 'Streaks'] },
      focus:    { name: 'Focus',     tagline: 'Deep work — only what matters today',  keywords: ['Deep work', 'Timer', 'Worklist'] },
      sprint:   { name: 'Sprint',    tagline: 'Weekly execution in numbers',          keywords: ['TBQC', 'Weekly', 'Metacognition'] },
      connect:  { name: 'Connect',   tagline: 'Feel the temperature of your bonds',  keywords: ['Relation', 'Temperature', 'Connection'] },
      mirror:   { name: 'Mirror',    tagline: 'Discover your relationship patterns',  keywords: ['Pattern', 'Recognition', 'Insight'] },
      social:   { name: 'Social',    tagline: 'Discover where you want to contribute', keywords: ['Interests', 'Impact', 'Contribution'] },
    },
  },
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// 스타일 메타
// ──────────────────────────────────────────────────────────────────────────────

const DOMAIN_META: { id: Domain; accent: string; border: string; bgSelected: string }[] = [
  { id: 'self',     accent: 'text-amber-400',   border: 'border-amber-400/60',   bgSelected: 'bg-amber-400/10' },
  { id: 'work',     accent: 'text-sky-400',     border: 'border-sky-400/60',     bgSelected: 'bg-sky-400/10' },
  { id: 'relation', accent: 'text-rose-400',    border: 'border-rose-400/60',    bgSelected: 'bg-rose-400/10' },
  { id: 'social',   accent: 'text-teal-400',    border: 'border-teal-400/60',    bgSelected: 'bg-teal-400/10' },
];

const MODE_META: { id: UXMode; accent: string; border: string; bgSelected: string }[] = [
  { id: 'original', accent: 'text-amber-400',   border: 'border-amber-400/60',   bgSelected: 'bg-amber-400/10' },
  { id: 'clear',    accent: 'text-stone-300',   border: 'border-stone-400/60',   bgSelected: 'bg-stone-400/10' },
  { id: 'routine',  accent: 'text-amber-300',   border: 'border-amber-300/60',   bgSelected: 'bg-amber-300/10' },
  { id: 'focus',    accent: 'text-sky-300',     border: 'border-sky-300/60',     bgSelected: 'bg-sky-300/10' },
  { id: 'sprint',   accent: 'text-sky-400',     border: 'border-sky-400/60',     bgSelected: 'bg-sky-400/10' },
  { id: 'connect',  accent: 'text-rose-300',    border: 'border-rose-300/60',    bgSelected: 'bg-rose-300/10' },
  { id: 'mirror',   accent: 'text-rose-400',    border: 'border-rose-400/60',    bgSelected: 'bg-rose-400/10' },
  { id: 'social',   accent: 'text-teal-400',   border: 'border-teal-400/60',    bgSelected: 'bg-teal-400/10' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function ModeSelect() {
  const { setMode, dismissFirstVisit } = useMode();
  const { setDomain } = useDomain();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDomain, setSelectedDomain] = useState<Domain>('self');
  const [selectedMode, setSelectedMode] = useState<UXMode>('original');

  function handleDomainConfirm() {
    // 도메인 변경 시 해당 도메인의 첫 번째 모드로 초기화
    const available = DOMAIN_MODES[selectedDomain];
    setSelectedMode(available[0]);
    setStep(2);
  }

  function handleConfirm(overrideMode?: UXMode) {
    const finalMode = overrideMode ?? selectedMode;
    setDomain(selectedDomain);
    setMode(finalMode);
    dismissFirstVisit();
    navigate('/home/vent', { replace: true });
  }

  const availableModes = DOMAIN_MODES[selectedDomain];

  return (
    <div className="min-h-screen bg-[#1C1917] flex">
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <h1 className="text-4xl font-bold tracking-widest mb-3" style={{ color: '#D4A574', letterSpacing: '0.2em' }}>VEILOR</h1>
          <p className="text-base font-light text-stone-400">{s.brandSubtitle}</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-light text-stone-400 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
            {s.sidebarHint}
          </p>
          <div className="space-y-3">
            {DOMAIN_META.map(meta => (
              <div key={meta.id} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: '#292524' }}>
                <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: '#D4A574', height: 32 }} />
                <div>
                  <p className="text-sm font-medium text-stone-200">{s.domains[meta.id].name}</p>
                  <p className="text-xs text-stone-500">{s.domains[meta.id].sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-stone-700">© 2026 VEILOR</p>
      </div>

      {/* 우측 콘텐츠 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[540px] items-center justify-center px-4 py-12">

        {/* ── Step 1: 도메인 선택 ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-10 w-full max-w-sm">
              <p className="text-xs tracking-[0.3em] text-stone-400 uppercase mb-3">Veilor</p>
              <h1 className="text-2xl font-semibold text-stone-100 leading-snug" style={{ whiteSpace: 'pre-line' }}>
                {s.step1Header}
              </h1>
              <p className="text-sm text-stone-400 mt-3">{s.step1Sub}</p>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
              {DOMAIN_META.map(meta => {
                const isSelected = selectedDomain === meta.id;
                const dt = s.domains[meta.id];
                return (
                  <button
                    key={meta.id}
                    onClick={() => setSelectedDomain(meta.id)}
                    className={[
                      'text-left rounded-2xl border p-5 transition-all duration-200',
                      isSelected ? `${meta.bgSelected} ${meta.border}` : 'border-stone-700/50 bg-stone-900/40',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-base font-semibold ${isSelected ? meta.accent : 'text-stone-200'}`}>
                        {dt.name}
                      </span>
                      {isSelected && (
                        <span className={`text-xs font-medium ${meta.accent} bg-stone-800/60 px-2 py-0.5 rounded-full`}>
                          {s.selected}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium mb-1 ${isSelected ? 'text-stone-100' : 'text-stone-300'}`}>
                      {dt.sub}
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">{dt.desc}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleDomainConfirm}
              className="mt-8 w-full max-w-sm bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-semibold text-sm py-3.5 rounded-2xl transition-colors"
            >
              {language === 'ko' ? '다음' : 'Next'}
            </button>

            <button
              onClick={() => handleConfirm('original')}
              className="mt-3 text-xs text-stone-500 hover:text-stone-400 transition-colors py-2"
            >
              {s.skipBtn}
            </button>
          </>
        )}

        {/* ── Step 2: UX 스타일 선택 ── */}
        {step === 2 && (
          <>
            <div className="text-center mb-10 w-full max-w-sm">
              <p className="text-xs tracking-[0.3em] text-stone-400 uppercase mb-3">Veilor</p>
              <h1 className="text-2xl font-semibold text-stone-100 leading-snug" style={{ whiteSpace: 'pre-line' }}>
                {s.step2Header}
              </h1>
              <p className="text-sm text-stone-400 mt-3">{s.step2Sub}</p>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
              {availableModes.map(modeId => {
                const meta = MODE_META.find(m => m.id === modeId)!;
                const isSelected = selectedMode === modeId;
                const mt = s.modes[modeId];
                return (
                  <button
                    key={modeId}
                    onClick={() => setSelectedMode(modeId)}
                    className={[
                      'text-left rounded-2xl border p-5 transition-all duration-200',
                      isSelected ? `${meta.bgSelected} ${meta.border}` : 'border-stone-700/50 bg-stone-900/40',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-base font-semibold ${isSelected ? meta.accent : 'text-stone-200'}`}>
                        {mt.name}
                      </span>
                      {isSelected && (
                        <span className={`text-xs font-medium ${meta.accent} bg-stone-800/60 px-2 py-0.5 rounded-full`}>
                          {s.selected}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium mb-3 ${isSelected ? 'text-stone-100' : 'text-stone-300'}`}>
                      {mt.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {mt.keywords.map(kw => (
                        <span
                          key={kw}
                          className={[
                            'text-[10px] px-2 py-0.5 rounded-full border',
                            isSelected
                              ? `${meta.accent} border-current/30 opacity-80`
                              : 'text-stone-500 border-stone-700',
                          ].join(' ')}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handleConfirm()}
              className="mt-8 w-full max-w-sm bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-semibold text-sm py-3.5 rounded-2xl transition-colors"
            >
              {s.confirm[selectedMode]}
            </button>

            <button
              onClick={() => setStep(1)}
              className="mt-3 text-xs text-stone-500 hover:text-stone-400 transition-colors py-2"
            >
              {s.back}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
