import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { VFILE_QUESTIONS } from '@/data/vfileQuestions';
import { VFILE_CONTEXT_LABELS } from '@/lib/vfileAlgorithm';
import type { VFileContext } from '@/lib/vfileAlgorithm';
import { Slider } from '@/components/ui/slider';

const STORAGE_KEY = 'veilor:priper-progress';

export default function PriperQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const context = ((location.state as Record<string, unknown>)?.context as VFileContext) ?? 'general';
  const storageKey = context === 'general' ? STORAGE_KEY : `${STORAGE_KEY}-${context}`;

  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { responses: r } = JSON.parse(saved);
        return r ?? {};
      }
    } catch (e) { console.warn("localStorage parse failed:", e); }
    return {};
  });
  const [sliderVal, setSliderVal] = useState(50);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { current: c } = JSON.parse(saved);
        if (c) setCurrent(c);
      }
    } catch (e) { console.warn("localStorage parse failed:", e); }
  }, []);

  const q = VFILE_QUESTIONS[current];
  const progress = Math.round(((current) / VFILE_QUESTIONS.length) * 100);
  const isAnswered = responses[q.id] !== undefined;

  const contextLabel = VFILE_CONTEXT_LABELS[context];

  const saveProgress = (newResponses: Record<string, number>, idx: number) => {
    localStorage.setItem(storageKey, JSON.stringify({ responses: newResponses, current: idx }));
  };

  const handleAnswer = (score: number) => {
    const newR = { ...responses, [q.id]: score };
    setResponses(newR);

    if (current < VFILE_QUESTIONS.length - 1) {
      const next = current + 1;
      setCurrent(next);
      setSliderVal(newR[VFILE_QUESTIONS[next].id] ?? 50);
      saveProgress(newR, next);
    } else {
      localStorage.removeItem(storageKey);
      navigate('/onboarding/vfile/result', { state: { responses: newR, context } });
    }
  };

  const handleSliderConfirm = () => handleAnswer(sliderVal);

  const handlePrev = () => {
    if (current > 0) {
      const prev = current - 1;
      setCurrent(prev);
      setSliderVal(responses[VFILE_QUESTIONS[prev].id] ?? 50);
    }
  };

  const choiceButtonStyle = (selected: boolean) => ({
    border: `1px solid ${selected ? '#D4A574' : '#44403C'}`,
    background: selected ? '#D4A57410' : 'transparent',
    color: selected ? '#D4A574' : '#F5F5F4',
    fontWeight: selected ? 500 : 400,
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties);

  return (
    <div
      className="min-h-screen flex flex-col px-6 py-8"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col">
        {/* 맥락 배지 */}
        {context !== 'general' && (
          <div className="mb-3">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: '#D4A57415', color: '#D4A574', border: '1px solid #D4A57430' }}
            >
              {contextLabel.icon} {contextLabel.ko}
            </span>
          </div>
        )}

        {/* 진행바 */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: '#A8A29E' }}>
            <span>{current + 1} / {VFILE_QUESTIONS.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: '#292524' }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%`, background: '#D4A574' }}
            />
          </div>
        </div>

        {/* 축 배지 */}
        <div className="mb-4">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#D4A57415', color: '#D4A574' }}
          >
            {q.axis === 'A' ? '애착' : q.axis === 'B' ? '소통' : q.axis === 'C' ? '욕구표현' : '역할'}
          </span>
        </div>

        {/* 질문 */}
        <h2 className="text-lg font-semibold leading-snug mb-8 flex-1" style={{ color: '#F5F5F4' }}>{q.question}</h2>

        {/* scenario 선택 */}
        {q.type === 'scenario' && q.choices && (
          <div className="space-y-3">
            {q.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(choice.score)}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all"
                style={choiceButtonStyle(responses[q.id] === choice.score)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {/* slider */}
        {q.type === 'slider' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Slider
                min={0} max={100} step={5}
                value={[sliderVal]}
                onValueChange={([v]) => setSliderVal(v)}
                className="w-full"
              />
              <div className="flex justify-between text-xs">
                <span style={{ color: '#A8A29E' }}>{q.sliderMin}</span>
                <span className="font-medium" style={{ color: '#D4A574' }}>{sliderVal}</span>
                <span style={{ color: '#A8A29E' }}>{q.sliderMax}</span>
              </div>
            </div>
            <button
              onClick={handleSliderConfirm}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ background: '#D4A574', color: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
            >
              다음
            </button>
          </div>
        )}

        {/* binary 선택 */}
        {q.type === 'binary' && q.choices && (
          <div className="space-y-3">
            {q.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(choice.score)}
                className="w-full text-left px-4 py-4 rounded-xl text-sm leading-relaxed transition-all"
                style={choiceButtonStyle(responses[q.id] === choice.score)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {/* 이전 버튼 */}
        {current > 0 && (
          <button
            onClick={handlePrev}
            className="mt-6 text-xs underline underline-offset-2"
            style={{ color: '#A8A29E' }}
          >
            이전 문항으로
          </button>
        )}
      </div>
    </div>
  );
}
