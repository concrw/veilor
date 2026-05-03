// V-NEED 욕구 진단 화면 — Phase 2
// "나의 욕구 지도" — 12욕구 Desired/Satisfied 슬라이더 → Gap 시각화 → cq_responses 저장
// 근거: veilor_desire_system.md v2.0 / needAlgorithm.ts

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    inputTitle: '나의 욕구 지도',
    inputSub: '각 욕구가 얼마나 원해지는지, 얼마나 채워지는지 슬라이더로 표시해 주세요.',
    layerPrefix: 'Layer — ',
    sliderDesired: '원하는 정도',
    sliderSatisfied: '채워진 정도',
    btnAnalyze: '욕구 지도 보기',
    resultLabel: '결과',
    resultTitle: '나의 욕구 지도',
    gapChartTitle: '12욕구 결핍 현황',
    top3Title: '지금 가장 채워지지 않는 욕구',
    anxietyFrozenTitle: '성욕구 결핍 조정 적용됨',
    anxietyFrozenBody: 'SexSelf 진단 결과를 바탕으로 BIO-SEX 충족도가 자동 조정되었습니다.\n지금 느끼는 욕구의 동결 상태는 자연스러운 보호 반응일 수 있습니다.',
    moderateCTATitle: '성적 자아 탐색 권유',
    moderateCTABody: '성욕구 충족도에 개선 여지가 있습니다. SexSelf 진단으로 더 자세히 살펴볼 수 있어요.',
    moderateCTABtn: '탐색해보기 →',
    severeCTATitle: '성적 자아 탐색 강권 안내',
    severeCTABody: '성욕구 결핍이 크게 감지됩니다. 지금의 상태를 더 잘 이해하려면 SexSelf 진단이\n중요한 첫걸음이 될 수 있습니다. 결과는 오직 나만 볼 수 있습니다.',
    severeCTABtn: '성적 자아 진단 시작하기 →',
    btnReset: '다시 입력',
    btnSaving: '저장 중…',
    btnSave: '저장하기',
  },
  en: {
    inputTitle: 'My Need Map',
    inputSub: 'Use the sliders to indicate how much each need is desired and how much it is being met.',
    layerPrefix: 'Layer — ',
    sliderDesired: 'Desired',
    sliderSatisfied: 'Satisfied',
    btnAnalyze: 'View my need map',
    resultLabel: 'Results',
    resultTitle: 'My Need Map',
    gapChartTitle: '12-need deficit overview',
    top3Title: 'Needs least fulfilled right now',
    anxietyFrozenTitle: 'Sexual need deficit adjustment applied',
    anxietyFrozenBody: 'BIO-SEX satisfaction has been automatically adjusted based on your SexSelf diagnosis results.\nThe frozen state of desire you are experiencing may be a natural protective response.',
    moderateCTATitle: 'Sexual self-exploration suggested',
    moderateCTABody: 'There is room for improvement in sexual need fulfillment. You can explore this further with the SexSelf diagnosis.',
    moderateCTABtn: 'Explore →',
    severeCTATitle: 'Sexual self-exploration strongly recommended',
    severeCTABody: 'A significant sexual need deficit has been detected. The SexSelf diagnosis can be\nan important first step to better understanding your current state. Only you can see the results.',
    severeCTABtn: 'Start Sexual Self diagnosis →',
    btnReset: 'Re-enter',
    btnSaving: 'Saving…',
    btnSave: 'Save',
  },
};
import {
  analyzeNeedProfile,
  createEmptyNeedResponses,
  NEED_LABELS,
  LAYER_LABELS,
  GAP_LEVEL_COLORS,
  GAP_LEVEL_LABELS,
  type NeedCode,
  type NeedLayer,
  type NeedResponses,
  type NeedProfile,
} from '@/lib/needAlgorithm';

// ── 레이어별 욕구 그룹 ──────────────────────────────────────────────
const LAYER_GROUPS: { layer: NeedLayer; codes: NeedCode[] }[] = [
  { layer: 'BIO', codes: ['BIO-SLP', 'BIO-EAT', 'BIO-SEX'] },
  { layer: 'SAF', codes: ['SAF-SEC', 'SAF-CTL'] },
  { layer: 'CON', codes: ['CON-BEL', 'CON-INT'] },
  { layer: 'GRW', codes: ['GRW-ACH', 'GRW-REC', 'GRW-PWR'] },
  { layer: 'EXS', codes: ['EXS-AUT', 'EXS-MNG'] },
];

const LAYER_COLORS: Record<NeedLayer, string> = {
  BIO: '#f97316',
  SAF: '#eab308',
  CON: '#3b82f6',
  GRW: '#a855f7',
  EXS: '#14b8a6',
};

// ── 슬라이더 컴포넌트 ──────────────────────────────────────────────
function NeedSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;  // caller passes translated label
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] w-16 text-right shrink-0" style={{ color: C.text4 }}>
        {label}
      </span>
      <div className="relative flex-1 h-1.5 rounded-full" style={{ background: '#1e2a38' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="text-xs font-medium w-7 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ── 욕구 카드 ─────────────────────────────────────────────────────
function NeedCard({
  code,
  layer,
  desired,
  satisfied,
  onDesiredChange,
  onSatisfiedChange,
  labelDesired,
  labelSatisfied,
}: {
  code: NeedCode;
  layer: NeedLayer;
  desired: number;
  satisfied: number;
  onDesiredChange: (v: number) => void;
  onSatisfiedChange: (v: number) => void;
  labelDesired: string;
  labelSatisfied: string;
}) {
  const { language: cardLang } = useLanguageContext();
  const lang = cardLang === 'en' ? 'en' : 'ko';
  const layerColor = LAYER_COLORS[layer];
  const gap = Math.max(0, desired - satisfied);

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: C.bg2, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ background: alpha(layerColor, 0.15), color: layerColor }}
          >
            {LAYER_LABELS[layer][lang]}
          </span>
          <span className="text-sm font-medium" style={{ color: C.text }}>
            {NEED_LABELS[code][lang]}
          </span>
        </div>
        {gap >= 10 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: alpha(GAP_LEVEL_COLORS[gap < 30 ? 'MILD_GAP' : gap < 50 ? 'MODERATE_GAP' : 'SEVERE_GAP'], 0.15),
              color: GAP_LEVEL_COLORS[gap < 30 ? 'MILD_GAP' : gap < 50 ? 'MODERATE_GAP' : 'SEVERE_GAP'],
            }}
          >
            Gap {gap}
          </span>
        )}
      </div>
      <NeedSlider label={labelDesired} value={desired} onChange={onDesiredChange} color={layerColor} />
      <NeedSlider label={labelSatisfied} value={satisfied} onChange={onSatisfiedChange} color={`${layerColor}99`} />
    </div>
  );
}

// ── Gap 바 차트 ───────────────────────────────────────────────────
function GapBarChart({ profile }: { profile: NeedProfile }) {
  const { language: chartLang } = useLanguageContext();
  const lang = chartLang === 'en' ? 'en' : 'ko';
  const sorted = [...profile.gaps].sort((a, b) => b.gap - a.gap);
  return (
    <div className="space-y-2">
      {sorted.map(g => {
        const isTop3 = profile.top3Deficits.includes(g.code);
        const color = GAP_LEVEL_COLORS[g.level];
        return (
          <div key={g.code} className="flex items-center gap-2">
            <span
              className="text-[11px] w-14 text-right shrink-0"
              style={{ color: isTop3 ? color : C.text4 }}
            >
              {NEED_LABELS[g.code][lang]}
            </span>
            <div className="flex-1 h-2 rounded-full" style={{ background: '#1e2a38' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${g.gap}%`, background: color, opacity: isTop3 ? 1 : 0.5 }}
              />
            </div>
            <span className="text-[11px] w-6 text-right" style={{ color: isTop3 ? color : C.text4 }}>
              {g.gap}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function NeedAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const lang = language === 'en' ? 'en' : 'ko';
  const isEn = language === 'en';

  const [responses, setResponses] = useState<NeedResponses>(createEmptyNeedResponses);
  const [profile, setProfile] = useState<NeedProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'input' | 'result'>('input');

  const handleChange = useCallback(
    (code: NeedCode, field: 'desired' | 'satisfied', value: number) => {
      setResponses(prev => ({
        ...prev,
        [code]: { ...prev[code], [field]: value },
      }));
    },
    [],
  );

  const handleAnalyze = () => {
    const result = analyzeNeedProfile(responses);
    setProfile(result);
    setStep('result');
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);

    // 24개 행 (12욕구 × 2) — cq_responses에 question_key/response_value 형태로 저장
    const rows = Object.entries(responses).flatMap(([code, { desired, satisfied }]) => [
      { user_id: user.id, question_key: `need_${code}_desired`, response_value: String(desired) },
      { user_id: user.id, question_key: `need_${code}_satisfied`, response_value: String(satisfied) },
    ]);

    await veilorDb
      .from('cq_responses')
      .upsert(rows, { onConflict: 'user_id,question_key' })
      .then(({ error }) => {
        if (error) console.error('[NeedAssessment] cq_responses 저장 오류:', error);
      });

    setSaving(false);
    navigate('/home/set');
  };

  // ── 입력 화면 ─────────────────────────────────────────────────
  if (step === 'input') {
    return (
      <div className="min-h-screen pb-24 px-4 pt-8" style={{ background: C.bg }}>
        <div className="max-w-2xl mx-auto space-y-6">

          {/* 헤더 */}
          <div>
            <p className="text-[11px] tracking-widest uppercase mb-1" style={{ color: C.text4 }}>
              V-NEED
            </p>
            <h1 className="text-xl font-light" style={{ color: C.text }}>
              {s.inputTitle}
            </h1>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: C.text4 }}>
              {s.inputSub}
            </p>
          </div>

          {/* 레이어별 욕구 카드 */}
          {LAYER_GROUPS.map(({ layer, codes }) => (
            <div key={layer} className="space-y-2">
              <div
                className="text-[11px] font-medium tracking-wider uppercase px-1"
                style={{ color: LAYER_COLORS[layer] }}
              >
                {s.layerPrefix}{LAYER_LABELS[layer][lang]}
              </div>
              {codes.map(code => (
                <NeedCard
                  key={code}
                  code={code}
                  layer={layer}
                  desired={responses[code].desired}
                  satisfied={responses[code].satisfied}
                  onDesiredChange={v => handleChange(code, 'desired', v)}
                  onSatisfiedChange={v => handleChange(code, 'satisfied', v)}
                  labelDesired={s.sliderDesired}
                  labelSatisfied={s.sliderSatisfied}
                />
              ))}
            </div>
          ))}

          <Button
            onClick={handleAnalyze}
            className="w-full h-12 text-sm font-medium"
            style={{ background: '#4AAEFF', color: '#fff' }}
          >
            {s.btnAnalyze}
          </Button>
        </div>
      </div>
    );
  }

  // ── 결과 화면 ─────────────────────────────────────────────────
  if (!profile) return null;

  const bioSexGap = profile.gaps.find(g => g.code === 'BIO-SEX');
  const bioSexSevere = bioSexGap?.level === 'SEVERE_GAP';

  return (
    <div className="min-h-screen pb-24 px-4 pt-8" style={{ background: C.bg }}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* 헤더 */}
        <div>
          <p className="text-[11px] tracking-widest uppercase mb-1" style={{ color: C.text4 }}>
            {s.resultLabel}
          </p>
          <h1 className="text-xl font-light" style={{ color: C.text }}>
            {s.resultTitle}
          </h1>
        </div>

        {/* Gap 바 차트 */}
        <div
          className="rounded-xl p-4"
          style={{ background: C.bg2, border: `1px solid ${C.border}` }}
        >
          <p className="text-xs font-medium mb-3" style={{ color: C.text4 }}>{s.gapChartTitle}</p>
          <GapBarChart profile={profile} />
        </div>

        {/* top3Deficits 강조 카드 */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ background: C.bg2, border: `1px solid ${C.border}` }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: C.text4 }}>{s.top3Title}</p>
          {profile.top3Deficits.map((code, i) => {
            const gap = profile.gaps.find(g => g.code === code)!;
            const color = GAP_LEVEL_COLORS[gap.level];
            return (
              <div key={code} className="flex items-center gap-3">
                <span className="text-base font-light" style={{ color: C.text4 }}>{i + 1}</span>
                <span
                  className="text-sm font-medium flex-1"
                  style={{ color }}
                >
                  {NEED_LABELS[code][lang]}
                </span>
                <span className="text-xs" style={{ color }}>
                  {GAP_LEVEL_LABELS[gap.level][lang]} ({gap.gap}{isEn ? 'pts' : '점'})
                </span>
              </div>
            );
          })}
        </div>

        {/* 레이어 요약 */}
        <div className="grid grid-cols-5 gap-1.5">
          {profile.layerSummary.map(ls => {
            const color = GAP_LEVEL_COLORS[ls.level];
            return (
              <div
                key={ls.layer}
                className="rounded-lg p-2 text-center"
                style={{ background: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.2)}` }}
              >
                <div className="text-[10px] font-medium mb-0.5" style={{ color }}>
                  {LAYER_LABELS[ls.layer][lang]}
                </div>
                <div className="text-xs" style={{ color }}>
                  {ls.avgGap}
                </div>
              </div>
            );
          })}
        </div>

        {/* ANXIETY_FROZEN 안내 */}
        {profile.isAnxietyFrozen && (
          <div
            className="rounded-xl p-4"
            style={{ background: alpha('#6366f1', 0.08), border: `1px solid ${alpha('#6366f1', 0.2)}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: '#6366f1' }}>
              {s.anxietyFrozenTitle}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: C.text2 }}>
              {s.anxietyFrozenBody.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
          </div>
        )}

        {/* BIO-SEX MODERATE → SexSelf 소프트 CTA */}
        {bioSexGap?.level === 'MODERATE_GAP' && !profile.isAnxietyFrozen && (
          <div
            className="rounded-xl p-4"
            style={{ background: alpha('#ec4899', 0.05), border: `1px solid ${alpha('#ec4899', 0.12)}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: alpha('#ec4899', 0.85) }}>
              {s.moderateCTATitle}
            </p>
            <p className="text-xs leading-relaxed mb-2" style={{ color: C.text2 }}>
              {s.moderateCTABody}
            </p>
            <button
              onClick={() => navigate('/home/sexself/questions')}
              className="text-xs"
              style={{ color: alpha('#ec4899', 0.8) }}
            >
              {s.moderateCTABtn}
            </button>
          </div>
        )}

        {/* BIO-SEX SEVERE → SexSelf 하드 CTA */}
        {bioSexSevere && !profile.isAnxietyFrozen && (
          <div
            className="rounded-xl p-4"
            style={{ background: alpha('#ec4899', 0.08), border: `1px solid ${alpha('#ec4899', 0.2)}` }}
          >
            <p className="text-xs font-medium mb-1.5" style={{ color: '#ec4899' }}>
              {s.severeCTATitle}
            </p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: C.text2 }}>
              {s.severeCTABody.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
            <button
              onClick={() => navigate('/home/sexself/questions')}
              className="text-xs font-medium underline"
              style={{ color: '#ec4899' }}
            >
              {s.severeCTABtn}
            </button>
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setStep('input')}
            className="flex-1 h-11 text-sm"
            style={{ borderColor: C.border, color: C.text2 }}
          >
            {s.btnReset}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 text-sm font-medium"
            style={{ background: '#4AAEFF', color: '#fff' }}
          >
            {saving ? s.btnSaving : s.btnSave}
          </Button>
        </div>
      </div>
    </div>
  );
}
