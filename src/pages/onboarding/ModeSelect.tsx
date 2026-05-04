import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode, type UXMode, DOMAIN_MODES } from '@/context/ModeContext';
import { useDomain, type Domain } from '@/context/DomainContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { C, alpha } from '@/lib/colors';

// ──────────────────────────────────────────────────────────────────────────────
// 이키가이 SVG 다이어그램
// ──────────────────────────────────────────────────────────────────────────────

const IKIGAI_CIRCLES: {
  id: Domain;
  cx: number; cy: number;
  lx: number; ly: number;
  labelKo: string; labelEn: string;
  color: string;
  coreQ: { ko: string; en: string };
}[] = [
  {
    id: 'self',     cx: 0,   cy: -52, lx: 0,    ly: -135,
    labelKo: '자기', labelEn: 'Self',
    color: '#D4A574',
    coreQ: { ko: '나는 지금 무엇을 느끼고 있는가?', en: 'What am I feeling right now?' },
  },
  {
    id: 'work',     cx: 52,  cy: 0,   lx: 135,  ly: 4,
    labelKo: '사업', labelEn: 'Work',
    color: '#38BDF8',
    coreQ: { ko: '오늘 집중할 한 가지는 무엇인가?', en: 'What is the one thing to focus on today?' },
  },
  {
    id: 'relation', cx: 0,   cy: 52,  lx: 0,    ly: 142,
    labelKo: '관계', labelEn: 'Relation',
    color: '#FB7185',
    coreQ: { ko: '이 관계에서 나는 어떤 역할을 하고 있는가?', en: 'What role am I playing in this relationship?' },
  },
  {
    id: 'social',   cx: -52, cy: 0,   lx: -135, ly: 4,
    labelKo: '사회', labelEn: 'Social',
    color: '#7FB89A',
    coreQ: { ko: '나는 무엇에 기여하고 싶은가?', en: 'What do I want to contribute to?' },
  },
];

interface IkigaiDiagramProps {
  selected: Domain;
  onSelect: (d: Domain) => void;
  size?: number;
  language: 'ko' | 'en';
}

function IkigaiDiagram({ selected, onSelect, size = 280, language }: IkigaiDiagramProps) {
  return (
    <svg
      viewBox="-160 -160 320 320"
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible', cursor: 'default' }}
    >
      {IKIGAI_CIRCLES.map(c => {
        const isSelected = selected === c.id;
        return (
          <circle
            key={c.id}
            cx={c.cx}
            cy={c.cy}
            r={80}
            fill={c.color}
            fillOpacity={isSelected ? 0.18 : 0.06}
            stroke={c.color}
            strokeOpacity={isSelected ? 1 : 0.35}
            strokeWidth={isSelected ? 1.5 : 1}
            style={{ transition: 'all .35s', cursor: 'pointer' }}
            onClick={() => onSelect(c.id)}
          />
        );
      })}
      {IKIGAI_CIRCLES.map(c => {
        const isSelected = selected === c.id;
        const label = language === 'ko' ? c.labelKo : c.labelEn;
        const textAnchor =
          c.lx > 50 ? 'start' :
          c.lx < -50 ? 'end' :
          'middle';
        return (
          <text
            key={c.id}
            x={c.lx}
            y={c.ly}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={isSelected ? 600 : 400}
            fill={isSelected ? c.color : C.text3}
            style={{ transition: 'fill .3s', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => onSelect(c.id)}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

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

const DOMAIN_META: { id: Domain; color: string }[] = [
  { id: 'self',     color: '#D4A574' },
  { id: 'work',     color: '#38BDF8' },
  { id: 'relation', color: '#FB7185' },
  { id: 'social',   color: '#7FB89A' },
];

const MODE_META: { id: UXMode; color: string }[] = [
  { id: 'original', color: '#D4A574' },
  { id: 'clear',    color: '#D6D3D1' },
  { id: 'routine',  color: '#FCD34D' },
  { id: 'focus',    color: '#7DD3FC' },
  { id: 'sprint',   color: '#38BDF8' },
  { id: 'connect',  color: '#FDA4AF' },
  { id: 'mirror',   color: '#FB7185' },
  { id: 'social',   color: '#7FB89A' },
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
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14"
        style={{ borderRight: `1px solid ${C.border2}` }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-widest mb-3" style={{ color: C.amber, letterSpacing: '0.2em' }}>VEILOR</h1>
          <p className="text-base font-light" style={{ color: C.text3 }}>{s.brandSubtitle}</p>
        </div>
        <div className="space-y-6">
          {/* Mini 이키가이 다이어그램 — PC 사이드바 (Step 1에서만 표시) */}
          {step === 1 && (
            <div className="flex justify-center">
              <IkigaiDiagram
                selected={selectedDomain}
                onSelect={setSelectedDomain}
                size={280}
                language={language}
              />
            </div>
          )}
          <div className="space-y-4">
            <p className="text-sm font-light leading-relaxed" style={{ color: C.text3, whiteSpace: 'pre-line' }}>
              {s.sidebarHint}
            </p>
            <div className="space-y-3">
              {DOMAIN_META.map(meta => {
                const isSelected = selectedDomain === meta.id;
                return (
                  <div
                    key={meta.id}
                    className="flex gap-3 items-start p-3 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: isSelected ? alpha(meta.color, 0.08) : C.bg3,
                      border: `1px solid ${isSelected ? alpha(meta.color, 0.33) : 'transparent'}`,
                    }}
                    onClick={() => step === 1 && setSelectedDomain(meta.id)}
                  >
                    <div
                      className="w-1 rounded-full flex-shrink-0 mt-1"
                      style={{ background: isSelected ? meta.color : C.text5, height: 32, transition: 'background .3s' }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: isSelected ? meta.color : C.text, transition: 'color .3s' }}>
                        {s.domains[meta.id].name}
                      </p>
                      <p className="text-xs" style={{ color: C.text3 }}>{s.domains[meta.id].sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="text-xs" style={{ color: C.text5 }}>© 2026 VEILOR</p>
      </div>

      {/* 우측 콘텐츠 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[540px] items-center justify-center px-4 py-12">

        {/* ── Step 1: 도메인 선택 ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-8 w-full max-w-sm">
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: C.text3 }}>Veilor</p>
              <h1 className="text-2xl font-semibold leading-snug" style={{ color: C.text, whiteSpace: 'pre-line' }}>
                {s.step1Header}
              </h1>
              <p className="text-sm mt-3" style={{ color: C.text3 }}>{s.step1Sub}</p>
            </div>

            {/* 이키가이 SVG 다이어그램 */}
            <div className="flex justify-center mb-4">
              <IkigaiDiagram
                selected={selectedDomain}
                onSelect={setSelectedDomain}
                size={280}
                language={language}
              />
            </div>

            {/* 선택된 도메인 정보 카드 — key로 fade 효과 */}
            {(() => {
              const meta = DOMAIN_META.find(m => m.id === selectedDomain)!;
              const circle = IKIGAI_CIRCLES.find(c => c.id === selectedDomain)!;
              const dt = s.domains[selectedDomain];
              const coreQ = language === 'ko' ? circle.coreQ.ko : circle.coreQ.en;
              return (
                <div
                  key={selectedDomain}
                  className="w-full max-w-sm rounded-2xl border p-5 mb-6"
                  style={{
                    borderColor: alpha(meta.color, 0.4),
                    background: alpha(meta.color, 0.07),
                    animation: 'vr-fadeIn .3s ease',
                  }}
                >
                  <style>{`@keyframes vr-fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono uppercase tracking-widest" style={{ color: meta.color }}>
                      {selectedDomain}
                    </span>
                    <span className="text-base font-semibold" style={{ color: meta.color }}>
                      {dt.name}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: C.text3 }}>{dt.desc}</p>
                  <p className="text-xs font-medium" style={{ color: C.text2 }}>
                    {`"${coreQ}"`}
                  </p>
                </div>
              );
            })()}

            <button
              onClick={handleDomainConfirm}
              className="w-full max-w-sm font-semibold text-sm py-3.5 rounded-2xl transition-colors"
              style={{ background: C.amber, color: C.bg }}
            >
              {language === 'ko' ? '다음' : 'Next'}
            </button>

            <button
              onClick={() => handleConfirm('original')}
              className="mt-3 text-xs transition-colors py-2"
              style={{ color: C.text3 }}
            >
              {s.skipBtn}
            </button>
          </>
        )}

        {/* ── Step 2: UX 스타일 선택 ── */}
        {step === 2 && (
          <>
            <div className="text-center mb-10 w-full max-w-sm">
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: C.text3 }}>Veilor</p>
              <h1 className="text-2xl font-semibold leading-snug" style={{ color: C.text, whiteSpace: 'pre-line' }}>
                {s.step2Header}
              </h1>
              <p className="text-sm mt-3" style={{ color: C.text3 }}>{s.step2Sub}</p>
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
                    className="text-left rounded-2xl border p-5 transition-all duration-200"
                    style={{
                      borderColor: isSelected ? alpha(meta.color, 0.6) : alpha(C.border, 0.5),
                      background:  isSelected ? alpha(meta.color, 0.1) : alpha(C.bg, 0.4),
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-base font-semibold" style={{ color: isSelected ? meta.color : C.text }}>
                        {mt.name}
                      </span>
                      {isSelected && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ color: meta.color, background: alpha(C.bg3, 0.6) }}
                        >
                          {s.selected}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-3" style={{ color: isSelected ? C.text : C.text2 }}>
                      {mt.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {mt.keywords.map(kw => (
                        <span
                          key={kw}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{
                            color:       isSelected ? meta.color : C.text3,
                            borderColor: isSelected ? alpha(meta.color, 0.3) : C.text5,
                          }}
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
              className="mt-8 w-full max-w-sm font-semibold text-sm py-3.5 rounded-2xl transition-colors"
              style={{ background: C.amber, color: C.bg }}
            >
              {s.confirm[selectedMode]}
            </button>

            <button
              onClick={() => setStep(1)}
              className="mt-3 text-xs transition-colors py-2"
              style={{ color: C.text3 }}
            >
              {s.back}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
