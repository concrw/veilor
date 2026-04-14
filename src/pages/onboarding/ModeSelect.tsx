import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMode, type UXMode } from '@/context/ModeContext';

// ──────────────────────────────────────────────────────────────────────────────
// 모드 카드 데이터
// ──────────────────────────────────────────────────────────────────────────────

const MODES: {
  id: UXMode;
  name: string;
  tagline: string;
  description: string;
  keywords: string[];
  accent: string;       // tailwind text color
  border: string;       // tailwind border color
  bgSelected: string;   // tailwind bg when selected
}[] = [
  {
    id: 'original',
    name: '오리지널',
    tagline: '말하지 않아도 알 것 같은 공간',
    description: '음성이나 자유로운 글로 털어놓으면 엠버가 함께 있어 줍니다. 구조 없이, 판단 없이.',
    keywords: ['감성적', '비구조적', '대화 중심'],
    accent: 'text-amber-400',
    border: 'border-amber-400/60',
    bgSelected: 'bg-amber-400/10',
  },
  {
    id: 'clear',
    name: '클리어',
    tagline: '지금 어디쯤 와 있는지 한눈에',
    description: '멘탈 지표를 대시보드로 봅니다. 오늘 할 것, 이번 주 흐름, 우선순위가 명확하게 정리됩니다.',
    keywords: ['구조적', '진척 중심', '대시보드'],
    accent: 'text-stone-300',
    border: 'border-stone-400/60',
    bgSelected: 'bg-stone-400/10',
  },
  {
    id: 'routine',
    name: '루틴',
    tagline: '매일 30초로 쌓이는 나의 숫자',
    description: '스트릭을 쌓고, 점수 변화를 봅니다. 성장이 보여야 계속하게 됩니다.',
    keywords: ['습관', '데이터', '스트릭'],
    accent: 'text-amber-300',
    border: 'border-amber-300/60',
    bgSelected: 'bg-amber-300/10',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────────────────────────────────────

export default function ModeSelect() {
  const { setMode, dismissFirstVisit } = useMode();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UXMode>('original');

  function handleConfirm(override?: UXMode) {
    setMode(override ?? selected);
    dismissFirstVisit();
    navigate('/home/vent', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center px-4 py-12">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-stone-400 uppercase mb-3">Veilor</p>
        <h1 className="text-2xl font-semibold text-stone-100 leading-snug">
          어떤 방식으로<br />베일러를 쓰고 싶으신가요?
        </h1>
        <p className="text-sm text-stone-400 mt-3">
          언제든 설정에서 바꿀 수 있습니다
        </p>
      </div>

      {/* 모드 카드 */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {MODES.map((m) => {
          const isSelected = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={[
                'text-left rounded-2xl border p-5 transition-all duration-200',
                isSelected ? `${m.bgSelected} ${m.border}` : 'border-stone-700/50 bg-stone-900/40',
              ].join(' ')}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-base font-semibold ${isSelected ? m.accent : 'text-stone-200'}`}>
                  {m.name}
                </span>
                {isSelected && (
                  <span className={`text-xs font-medium ${m.accent} bg-stone-800/60 px-2 py-0.5 rounded-full`}>
                    선택됨
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium mb-1 ${isSelected ? 'text-stone-100' : 'text-stone-300'}`}>
                {m.tagline}
              </p>
              <p className="text-xs text-stone-400 leading-relaxed mb-3">
                {m.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {m.keywords.map((kw) => (
                  <span
                    key={kw}
                    className={[
                      'text-[10px] px-2 py-0.5 rounded-full border',
                      isSelected
                        ? `${m.accent} border-current/30 opacity-80`
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

      {/* 확인 버튼 */}
      <button
        onClick={handleConfirm}
        className="mt-8 w-full max-w-sm bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-semibold text-sm py-3.5 rounded-2xl transition-colors"
      >
        {selected === 'original' ? '털어놓으러 가기' : selected === 'clear' ? '대시보드 보러 가기' : '루틴 시작하기'}
      </button>

      {/* 건너뛰기 — 항상 오리지널(기본값)로 진행 */}
      <button
        onClick={() => handleConfirm('original')}
        className="mt-3 text-xs text-stone-500 hover:text-stone-400 transition-colors py-2"
      >
        지금은 기본 모드로 시작할게요
      </button>
    </div>
  );
}
