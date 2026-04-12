// SexSelf — 적응형 단계별 질문 페이지 (v3)
// Stage 1 (7문항) → 개방성 점수 기반 → Stage 2 (10문항) → Stage 3 (8문항)
// 트라우마 인폼드: 언제든 중단 가능, 비판단적 언어, 안전 안내 포함

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AXIS_LABELS: Record<string, string> = {
  DES: '욕망의 실체',
  SHA: '수치심 탐색',
  PWR: '권력·통제',
  BDY: '몸과의 관계',
  HIS: '성적 역사',
  FAN: '판타지·금기',
  CON: '연결 방식',
};

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
        <div className="max-w-sm w-full mx-auto flex-1 flex flex-col justify-center space-y-8">
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
              여기서 멈출 수 있어요
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: C.text2 }}>
              지금까지 답한 내용만으로도 결과를 받을 수 있어요.
              <br /><br />
              더 깊이 들어가고 싶다면 계속할 수 있어요 —
              아직 탐색하지 않은 영역(억제 요인, 몸과의 관계, 권력 역학)으로 이어집니다.
            </p>
            <p className="text-[10px]" style={{ color: alpha(C.text4, 0.5) }}>
              언제든 나가거나 멈출 수 있어요.
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
              더 깊이 탐색할게요 →
            </Button>
            <button
              className="w-full h-11 text-sm rounded-xl border"
              onClick={() => finishDiagnosis(responses)}
              style={{ borderColor: C.border, color: C.text4, background: C.bg2 }}
            >
              여기서 결과 받기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gate === 'stage2_gate') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8" style={{ background: C.bg }}>
        <div className="max-w-sm w-full mx-auto flex-1 flex flex-col justify-center space-y-8">
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
              가장 깊은 층으로
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: C.text2 }}>
              이 단계는 자기 탐색의 가장 깊은 층입니다 —
              신체 탐색, 트라우마 경험, 판타지와 금기의 영역.
              <br /><br />
              불편한 기억이 올라올 수 있어요. 언제든 멈출 수 있고,
              여기까지로도 충분히 깊은 결과를 받을 수 있어요.
            </p>
            <p className="text-[10px]" style={{ color: alpha(C.text4, 0.5) }}>
              이 내용은 나만 볼 수 있어요.
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
              바닥까지 가볼게요 →
            </Button>
            <button
              className="w-full h-11 text-sm rounded-xl border"
              onClick={() => finishDiagnosis(responses)}
              style={{ borderColor: C.border, color: C.text4, background: C.bg2 }}
            >
              여기서 결과 받기
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
    current < STAGE_1_END ? '1단계' :
    current < STAGE_2_END ? '2단계' : '3단계';

  return (
    <div className="min-h-screen flex flex-col px-6 py-8" style={{ background: C.bg }}>
      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-xs underline underline-offset-2"
            style={{ color: C.text4 }}
          >
            ← 나가기
          </button>
          <span className="text-[10px] font-light" style={{ color: C.text4 }}>
            이 내용은 나만 볼 수 있어요
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
            {q.depth_warning}
          </div>
        )}

        {/* 축 배지 */}
        <div className="mb-4">
          <span
            className="text-[10px] px-2.5 py-1 rounded-full font-medium"
            style={{ background: alpha(axisColor, 0.1), color: axisColor }}
          >
            {AXIS_LABELS[q.axis]}
          </span>
        </div>

        {/* 질문 */}
        <h2
          className="text-lg font-light leading-snug mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: C.text }}
        >
          {q.question}
        </h2>

        {/* 보조 설명 */}
        {q.subtext ? (
          <p className="text-xs mb-6 leading-relaxed" style={{ color: C.text4 }}>
            {q.subtext}
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
                  {choice.label}
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
                <span>{q.sliderMin}</span>
                <span className="font-medium" style={{ color: axisColor }}>{sliderVal}</span>
                <span>{q.sliderMax}</span>
              </div>
            </div>
            <Button
              className="w-full h-11"
              onClick={handleSliderConfirm}
              style={{ background: axisColor, borderColor: axisColor }}
            >
              다음
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
                  {choice.label}
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
              이전 문항으로
            </button>
          )}
          <p className="text-[10px] text-center leading-relaxed" style={{ color: alpha(C.text4, 0.5) }}>
            정답은 없어요. 지금 느끼는 것 그대로가 답이에요.
          </p>
        </div>
      </div>
    </div>
  );
}
