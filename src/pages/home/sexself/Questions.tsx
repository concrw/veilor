// SexSelf — 적응형 단계별 질문 페이지 (v3)
// Stage 1 (7문항) → 개방성 점수 기반 → Stage 2 (10문항) → Stage 3 (8문항)
// 트라우마 인폼드: 언제든 중단 가능, 비판단적 언어, 안전 안내 포함

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag } from '@use-gesture/react';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    stageLabels: ['1단계', '2단계', '3단계'],
    privacy: '이 내용은 나만 볼 수 있어요',
    btnExit: '← 나가기',
    axisLabels: {
      DES: '욕망의 실체',
      SHA: '수치심 탐색',
      PWR: '권력·통제',
      BDY: '몸과의 관계',
      HIS: '성적 역사',
      FAN: '판타지·금기',
      CON: '연결 방식',
    },
    btnNext: '다음',
    btnPrev: '이전 문항으로',
    noAnswer: '정답은 없어요. 지금 느끼는 것 그대로가 답이에요.',
    // stage1_gate
    gate1Title: '여기서 멈출 수 있어요',
    gate1Body: '지금까지 답한 내용만으로도 결과를 받을 수 있어요.\n\n더 깊이 들어가고 싶다면 계속할 수 있어요 —\n아직 탐색하지 않은 영역(억제 요인, 몸과의 관계, 권력 역학)으로 이어집니다.',
    gate1Note: '언제든 나가거나 멈출 수 있어요.',
    gate1Continue: '더 깊이 탐색할게요 →',
    gate1Finish: '여기서 결과 받기',
    // stage2_gate
    gate2Title: '가장 깊은 층으로',
    gate2Body: '이 단계는 자기 탐색의 가장 깊은 층입니다 —\n신체 탐색, 트라우마 경험, 판타지와 금기의 영역.\n\n불편한 기억이 올라올 수 있어요. 언제든 멈출 수 있고,\n여기까지로도 충분히 깊은 결과를 받을 수 있어요.',
    gate2Note: '이 내용은 나만 볼 수 있어요.',
    gate2Continue: '바닥까지 가볼게요 →',
    gate2Finish: '여기서 결과 받기',
  },
  en: {
    stageLabels: ['Stage 1', 'Stage 2', 'Stage 3'],
    privacy: 'Only you can see this',
    btnExit: '← Exit',
    axisLabels: {
      DES: 'Desire',
      SHA: 'Shame exploration',
      PWR: 'Power & control',
      BDY: 'Body relationship',
      HIS: 'Sexual history',
      FAN: 'Fantasy & taboo',
      CON: 'Connection style',
    },
    btnNext: 'Next',
    btnPrev: 'Previous question',
    noAnswer: "There are no right answers. What you feel right now is the answer.",
    // stage1_gate
    gate1Title: 'You can stop here',
    gate1Body: "You can receive results based on what you've answered so far.\n\nIf you'd like to go deeper, you can continue —\nit leads into unexplored areas (inhibition factors, body relationship, power dynamics).",
    gate1Note: 'You can exit or stop at any time.',
    gate1Continue: "I'll explore deeper →",
    gate1Finish: 'Get results here',
    // stage2_gate
    gate2Title: 'Into the deepest layer',
    gate2Body: "This stage is the deepest layer of self-exploration —\nbody exploration, trauma experiences, fantasy and taboo.\n\nDifficult memories may surface. You can stop at any time,\nand you can still receive deeply meaningful results up to this point.",
    gate2Note: 'Only you can see this.',
    gate2Continue: "I'll go all the way →",
    gate2Finish: 'Get results here',
  },
};
import {
  SEX_SELF_QUESTIONS,
  STAGE_1_END,
  STAGE_2_END,
  STAGE_2_THRESHOLD,
  STAGE_3_THRESHOLD,
} from '@/data/sexSelfQuestions';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { C, alpha } from '@/lib/colors';

const STORAGE_KEY = 'veilor:sexself-progress-v3';

const AXIS_COLORS: Record<string, string> = {
  DES: '#10b981',
  SHA: '#ec4899',
  PWR: '#f59e0b',
  BDY: '#3b82f6',
  HIS: '#8b5cf6',
  FAN: '#ef4444',
  CON: '#14b8a6',
};

// Stage 1 완료 후 개방성 점수 계산
function computeOpenness(responses: Record<string, number>): number {
  const stage1Ids = SEX_SELF_QUESTIONS.slice(0, STAGE_1_END).map((q) => q.id);
  const vals = stage1Ids.map((id) => responses[id]).filter((v) => v !== undefined) as number[];
  if (vals.length === 0) return 50;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// Stage 2 완료 후 개방성 점수 계산
function computeStage2Openness(responses: Record<string, number>): number {
  const stage2Ids = SEX_SELF_QUESTIONS.slice(STAGE_1_END, STAGE_2_END).map((q) => q.id);
  const vals = stage2Ids.map((id) => responses[id]).filter((v) => v !== undefined) as number[];
  if (vals.length === 0) return 50;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

type GateState =
  | 'answering'           // 질문에 답하는 중
  | 'stage1_gate'         // Stage 1 완료 — 계속/마침 선택
  | 'stage2_gate'         // Stage 2 완료 — Stage 3 진입 여부 선택
  | 'done';               // 완료 → 결과 페이지로

export default function SexSelfQuestions() {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.responses ?? {};
      }
    } catch { /* ignore */ }
    return {};
  });
  const [sliderVal, setSliderVal] = useState(50);
  const [gate, setGate] = useState<GateState>('answering');

  // 저장된 진행상태 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.current === 'number') setCurrent(parsed.current);
        if (parsed.gate) setGate(parsed.gate);
      }
    } catch { /* ignore */ }
  }, []);

  const saveProgress = useCallback(
    (newResponses: Record<string, number>, idx: number, gateState: GateState) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ responses: newResponses, current: idx, gate: gateState }),
      );
    },
    [],
  );

  const finishDiagnosis = useCallback(
    (finalResponses: Record<string, number>) => {
      localStorage.removeItem(STORAGE_KEY);
      navigate('/home/sexself/result', {
        state: {
          responses: Object.fromEntries(
            Object.entries(finalResponses).map(([k, v]) => [k, String(v)]),
          ),
        },
      });
    },
    [navigate],
  );

  const handleAnswer = useCallback(
    (score: number) => {
      const q = SEX_SELF_QUESTIONS[current];
      const newR = { ...responses, [q.id]: score };
      setResponses(newR);

      const nextIdx = current + 1;

      // Stage 1 마지막 문항 완료
      if (current === STAGE_1_END - 1) {
        const openness = computeOpenness(newR);
        if (openness >= STAGE_2_THRESHOLD) {
          // 개방성 충분 → Stage 2 자동 진입 (게이트 없이)
          setCurrent(nextIdx);
          setSliderVal(newR[SEX_SELF_QUESTIONS[nextIdx]?.id] ?? 50);
          saveProgress(newR, nextIdx, 'answering');
        } else {
          // 개방성 낮음 → 선택지 제공
          setGate('stage1_gate');
          saveProgress(newR, nextIdx, 'stage1_gate');
        }
        return;
      }

      // Stage 2 마지막 문항 완료
      if (current === STAGE_2_END - 1) {
        const openness2 = computeStage2Openness(newR);
        if (openness2 >= STAGE_3_THRESHOLD) {
          // Stage 3 진입 여부 묻기
          setGate('stage2_gate');
          saveProgress(newR, nextIdx, 'stage2_gate');
        } else {
          // Stage 3 건너뛰고 완료
          finishDiagnosis(newR);
        }
        return;
      }

      // 마지막 문항 (Stage 3 완료)
      if (nextIdx >= SEX_SELF_QUESTIONS.length) {
        finishDiagnosis(newR);
        return;
      }

      // 일반 진행
      setCurrent(nextIdx);
      setSliderVal(newR[SEX_SELF_QUESTIONS[nextIdx].id] ?? 50);
      saveProgress(newR, nextIdx, 'answering');
    },
    [current, responses, saveProgress, finishDiagnosis],
  );

  const handleSliderConfirm = () => handleAnswer(sliderVal);

  const handlePrev = () => {
    if (gate !== 'answering') {
      setGate('answering');
      return;
    }
    if (current > 0) {
      const prev = current - 1;
      setCurrent(prev);
      setSliderVal(responses[SEX_SELF_QUESTIONS[prev].id] ?? 50);
    }
  };

  // ── 게이트 화면 ────────────────────────────────────────────

  if (gate === 'stage1_gate') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8" style={{ background: C.bg }}>
        <div className="max-w-lg w-full mx-auto flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center space-y-3">
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl"
              style={{ background: alpha('#ec4899', 0.1) }}
            >
              🌸
            </div>
            <h2
              className="text-xl font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}
            >
              {s.gate1Title}
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: C.text2 }}>
              {s.gate1Body.split('\n').map((line, i) => (
                <span key={i}>{line}{i < s.gate1Body.split('\n').length - 1 && <br />}</span>
              ))}
            </p>
            <p className="text-[10px]" style={{ color: alpha(C.text4, 0.5) }}>
              {s.gate1Note}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-sm"
              onClick={() => {
                setGate('answering');
                saveProgress(responses, current, 'answering');
              }}
              style={{ background: '#ec4899', borderColor: '#ec4899' }}
            >
              {s.gate1Continue}
            </Button>
            <button
              className="w-full h-11 text-sm rounded-xl border"
              onClick={() => finishDiagnosis(responses)}
              style={{ borderColor: C.border, color: C.text4, background: C.bg2 }}
            >
              {s.gate1Finish}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gate === 'stage2_gate') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8" style={{ background: C.bg }}>
        <div className="max-w-lg w-full mx-auto flex-1 flex flex-col justify-center space-y-8">
          <div className="text-center space-y-3">
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl"
              style={{ background: alpha('#ef4444', 0.1) }}
            >
              🔥
            </div>
            <h2
              className="text-xl font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}
            >
              {s.gate2Title}
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: C.text2 }}>
              {s.gate2Body.split('\n').map((line, i) => (
                <span key={i}>{line}{i < s.gate2Body.split('\n').length - 1 && <br />}</span>
              ))}
            </p>
            <p className="text-[10px]" style={{ color: alpha(C.text4, 0.5) }}>
              {s.gate2Note}
            </p>
          </div>
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-sm"
              onClick={() => {
                setGate('answering');
                saveProgress(responses, current, 'answering');
              }}
              style={{ background: '#ef4444', borderColor: '#ef4444' }}
            >
              {s.gate2Continue}
            </Button>
            <button
              className="w-full h-11 text-sm rounded-xl border"
              onClick={() => finishDiagnosis(responses)}
              style={{ borderColor: C.border, color: C.text4, background: C.bg2 }}
            >
              {s.gate2Finish}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 일반 질문 화면 ─────────────────────────────────────────

  const q = SEX_SELF_QUESTIONS[current];
  const totalAnswered = Object.keys(responses).length;
  const progress = Math.round((totalAnswered / SEX_SELF_QUESTIONS.length) * 100);
  const axisColor = AXIS_COLORS[q.axis] ?? C.amber;

  // 단계 표시
  const stageLabel =
    current < STAGE_1_END ? s.stageLabels[0] :
    current < STAGE_2_END ? s.stageLabels[1] : s.stageLabels[2];

  // 스와이프: 좌 → 다음(슬라이더/선택값 확인), 우 → 이전
  // axis < 0 이면 오른쪽→왼쪽 스와이프 (다음), axis > 0 이면 왼쪽→오른쪽 (이전)
  const bind = useDrag(
    ({ last, movement: [mx], direction: [dx], axis }) => {
      if (!last) return;
      if (axis !== 'x') return; // 수직 드래그 무시 (슬라이더 충돌 방지)
      if (Math.abs(mx) < 60) return; // 임계값 미만 무시
      if (dx < 0) {
        // 왼쪽 스와이프 → 다음
        if (q.type === 'slider') handleSliderConfirm();
        else if (responses[q.id] !== undefined) handleAnswer(responses[q.id]);
      } else {
        // 오른쪽 스와이프 → 이전
        handlePrev();
      }
    },
    { axis: 'x', filterTaps: true },
  );

  return (
    <div className="min-h-screen flex flex-col px-6 py-8" style={{ background: C.bg }}>
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col" {...bind()}>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-xs underline underline-offset-2"
            style={{ color: C.text4 }}
          >
            {s.btnExit}
          </button>
          <span className="text-[10px] font-light" style={{ color: C.text4 }}>
            {s.privacy}
          </span>
        </div>

        {/* 진행바 */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: C.text4 }}>
            <span>
              {current + 1} / {SEX_SELF_QUESTIONS.length}
              <span
                className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: alpha(axisColor, 0.1), color: axisColor }}
              >
                {stageLabel}
              </span>
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: C.border }}>
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(progress, 2)}%`, background: axisColor }}
            />
          </div>
        </div>

        {/* 트라우마 경고 */}
        {q.depth_warning && (
          <div
            className="mb-4 px-3 py-2.5 rounded-lg text-xs leading-relaxed"
            style={{ background: alpha('#f59e0b', 0.08), border: `1px solid ${alpha('#f59e0b', 0.2)}`, color: '#b45309' }}
          >
            {language === 'en' ? (q.depth_warningEn ?? q.depth_warning) : q.depth_warning}
          </div>
        )}

        {/* 축 배지 */}
        <div className="mb-4">
          <span
            className="text-[10px] px-2.5 py-1 rounded-full font-medium"
            style={{ background: alpha(axisColor, 0.1), color: axisColor }}
          >
            {s.axisLabels[q.axis as keyof typeof s.axisLabels] ?? q.axis}
          </span>
        </div>

        {/* 질문 */}
        <h2
          className="text-lg font-light leading-snug mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}
        >
          {language === 'en' ? (q.questionEn ?? q.question) : q.question}
        </h2>

        {/* 보조 설명 */}
        {q.subtext ? (
          <p className="text-xs mb-6 leading-relaxed" style={{ color: C.text4 }}>
            {language === 'en' ? (q.subtextEn ?? q.subtext) : q.subtext}
          </p>
        ) : (
          <div className="mb-6" />
        )}

        {/* 응답 — scenario */}
        {q.type === 'scenario' && q.choices && (
          <div className="space-y-3 flex-1">
            {q.choices.map((choice, i) => {
              const selected = responses[q.id] === choice.score;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(choice.score)}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm leading-relaxed transition-all"
                  style={{
                    border: `1px solid ${selected ? axisColor : C.border}`,
                    background: selected ? alpha(axisColor, 0.06) : C.bg2,
                    color: selected ? C.text : C.text2,
                    fontWeight: selected ? 500 : 300,
                  }}
                >
                  {language === 'en' ? (choice.labelEn ?? choice.label) : choice.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 응답 — slider */}
        {q.type === 'slider' && (
          <div className="space-y-6 flex-1">
            <div className="space-y-4">
              <Slider
                min={0} max={100} step={5}
                value={[sliderVal]}
                onValueChange={([v]) => setSliderVal(v)}
                className="w-full"
              />
              <div className="flex justify-between text-xs" style={{ color: C.text4 }}>
                <span>{language === 'en' ? (q.sliderMinEn ?? q.sliderMin) : q.sliderMin}</span>
                <span className="font-medium" style={{ color: axisColor }}>{sliderVal}</span>
                <span>{language === 'en' ? (q.sliderMaxEn ?? q.sliderMax) : q.sliderMax}</span>
              </div>
            </div>
            <Button
              className="w-full h-11"
              onClick={handleSliderConfirm}
              style={{ background: axisColor, borderColor: axisColor }}
            >
              {s.btnNext}
            </Button>
          </div>
        )}

        {/* 응답 — binary */}
        {q.type === 'binary' && q.choices && (
          <div className="space-y-3 flex-1">
            {q.choices.map((choice, i) => {
              const selected = responses[q.id] === choice.score;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(choice.score)}
                  className="w-full text-left px-4 py-4 rounded-xl text-sm leading-relaxed transition-all"
                  style={{
                    border: `1px solid ${selected ? axisColor : C.border}`,
                    background: selected ? alpha(axisColor, 0.06) : C.bg2,
                    color: selected ? C.text : C.text2,
                    fontWeight: selected ? 500 : 300,
                  }}
                >
                  {language === 'en' ? (choice.labelEn ?? choice.label) : choice.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 이전 + 안내 */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {current > 0 && (
            <button
              onClick={handlePrev}
              className="text-xs underline underline-offset-2"
              style={{ color: C.text4 }}
            >
              {s.btnPrev}
            </button>
          )}
          <p className="text-[10px] text-center leading-relaxed" style={{ color: alpha(C.text4, 0.5) }}>
            {s.noAnswer}
          </p>
        </div>
      </div>
    </div>
  );
}
