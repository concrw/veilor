// 위기 대응 3단계 배너
// 1단계: 감지 + 전화번호 (즉시)
// 2단계: 안정화 기법 (호흡 가이드, 그라운딩 5-4-3-2-1)
// 3단계: 전문 상담사 연결
import { useState, useEffect, useRef, memo } from 'react';
import { C } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';

type CrisisStage = 'alert' | 'stabilize' | 'connect';

interface CrisisBannerProps {
  severity: 'high' | 'critical';
  onDismiss?: () => void;
}

const S = {
  ko: {
    critical: '지금 많이 힘드시군요. 혼자 감당하지 않아도 돼요.',
    high: '힘든 감정이 느껴지시나요? 도움을 요청할 수 있어요.',
    disclaimer: '이 앱은 전문 상담을 대체하지 않습니다.',
    close: '닫기',
    closeBanner: '배너 닫기',
    calmFirst: '먼저 마음을 가라앉히기',
    callExpert: '전문가에게 연락하기',
    stabilizeTitle: '잠깐 멈추고, 지금 여기에 집중해 볼게요',
    breathingTitle: '호흡 가이드',
    breathingMethod: '4-7-8 호흡법',
    groundingTitle: '그라운딩',
    groundingMethod: '5-4-3-2-1 기법',
    otherTechnique: '다른 기법 선택',
    toConnect: '전문가 연결로 이동',
    connectTitle: '전문가에게 연락해 주세요',
    backToStabilize: '마음 가라앉히기로 돌아가기',
    fullDisclaimer: 'VEILOR은 자기탐색 도구이며, 전문 심리상담 또는 치료를 대체하지 않습니다.',
    breathing: {
      roundFmt: '4-7-8 호흡법 · {round}/3 라운드',
      inhale: '들이쉬세요',
      hold: '멈추세요',
      exhale: '내쉬세요',
    },
    grounding: {
      title: '5-4-3-2-1 그라운딩',
      steps: [
        { n: 5, sense: '보이는 것', icon: '👁️' },
        { n: 4, sense: '만질 수 있는 것', icon: '✋' },
        { n: 3, sense: '들리는 것', icon: '👂' },
        { n: 2, sense: '냄새 맡을 수 있는 것', icon: '👃' },
        { n: 1, sense: '맛볼 수 있는 것', icon: '👅' },
      ],
      stepFmt: (n: number, sense: string) => `${n}가지 ${sense}을 찾아보세요`,
      next: '다음 단계',
    },
    hotlines: [
      { tel: '1393', name: '자살예방상담전화 1393', note: '24시간 · 무료 · 즉시 연결', primary: true },
      { tel: '1577-0199', name: '정신건강위기상담 1577-0199', note: '24시간 · 무료', primary: false },
      { tel: '1588-9191', name: '생명의전화 1588-9191', note: '24시간', primary: false },
      { tel: '1388', name: '청소년 전화 1388', note: '24시간', primary: false },
    ],
  },
  en: {
    critical: "It sounds like you're going through a lot right now. You don't have to handle this alone.",
    high: 'Are you feeling overwhelmed? You can reach out for help.',
    disclaimer: 'This app does not replace professional counseling.',
    close: 'Close',
    closeBanner: 'Close banner',
    calmFirst: 'Calm down first',
    callExpert: 'Contact a professional',
    stabilizeTitle: 'Pause for a moment — let\'s focus on right now',
    breathingTitle: 'Breathing Guide',
    breathingMethod: '4-7-8 technique',
    groundingTitle: 'Grounding',
    groundingMethod: '5-4-3-2-1 method',
    otherTechnique: 'Try a different technique',
    toConnect: 'Go to professional help',
    connectTitle: 'Please reach out to a professional',
    backToStabilize: 'Back to calming techniques',
    fullDisclaimer: 'VEILOR is a self-exploration tool and does not replace professional psychological counseling or therapy.',
    breathing: {
      roundFmt: '4-7-8 breathing · Round {round}/3',
      inhale: 'Breathe in',
      hold: 'Hold',
      exhale: 'Breathe out',
    },
    grounding: {
      title: '5-4-3-2-1 Grounding',
      steps: [
        { n: 5, sense: 'things you can see', icon: '👁️' },
        { n: 4, sense: 'things you can touch', icon: '✋' },
        { n: 3, sense: 'things you can hear', icon: '👂' },
        { n: 2, sense: 'things you can smell', icon: '👃' },
        { n: 1, sense: 'thing you can taste', icon: '👅' },
      ],
      stepFmt: (n: number, sense: string) => `Find ${n} ${sense}`,
      next: 'Next step',
    },
    hotlines: [
      { tel: '1393', name: 'Suicide Prevention 1393', note: '24hr · Free · Immediate', primary: true },
      { tel: '1577-0199', name: 'Mental Health Crisis 1577-0199', note: '24hr · Free', primary: false },
      { tel: '1588-9191', name: 'Life Line 1588-9191', note: '24hr', primary: false },
      { tel: '1388', name: 'Youth Line 1388', note: '24hr', primary: false },
    ],
  },
};

function BreathingGuide({ s }: { s: typeof S.ko }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);
  const [round, setRound] = useState(1);
  const timerRef = useRef<number>();

  useEffect(() => {
    const seq = [
      { p: 'inhale' as const, d: 4 },
      { p: 'hold' as const, d: 7 },
      { p: 'exhale' as const, d: 8 },
    ];
    let idx = 0;
    let c = seq[0].d;
    const tick = () => {
      c--;
      if (c <= 0) {
        idx = (idx + 1) % 3;
        if (idx === 0) setRound(r => r + 1);
        c = seq[idx].d;
        setPhase(seq[idx].p);
      }
      setCount(c);
    };
    timerRef.current = window.setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const label = phase === 'inhale' ? s.breathing.inhale : phase === 'hold' ? s.breathing.hold : s.breathing.exhale;
  const circleSize = phase === 'inhale' ? 80 : phase === 'hold' ? 80 : 40;

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
        {s.breathing.roundFmt.replace('{round}', String(round))}
      </p>
      <div style={{
        width: circleSize, height: circleSize, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', margin: '0 auto 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 1s ease-in-out',
      }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>{count}</span>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>{label}</p>
    </div>
  );
}

function GroundingGuide({ s }: { s: typeof S.ko }) {
  const [step, setStep] = useState(0);

  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textAlign: 'center' }}>
        {s.grounding.title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {s.grounding.steps.map((gs, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10,
              background: i === step ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <span style={{ fontSize: 16 }}>{gs.icon}</span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: i === step ? 600 : 400 }}>
              {s.grounding.stepFmt(gs.n, gs.sense)}
            </span>
            {i < step && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>✓</span>}
          </div>
        ))}
      </div>
      {step < s.grounding.steps.length - 1 && (
        <button
          onClick={() => setStep(st => Math.min(st + 1, s.grounding.steps.length - 1))}
          style={{
            display: 'block', width: '100%', marginTop: 10,
            padding: '8px 0', borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            fontSize: 12, cursor: 'pointer',
          }}
        >
          {s.grounding.next}
        </button>
      )}
    </div>
  );
}

export const CrisisBanner = memo(function CrisisBanner({ severity, onDismiss }: CrisisBannerProps) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const [stage, setStage] = useState<CrisisStage>('alert');
  const [stabilizeMode, setStabilizeMode] = useState<'breathing' | 'grounding' | null>(null);

  const isCritical = severity === 'critical';

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: 80, left: 12, right: 12, zIndex: 9999,
        background: isCritical ? '#DC2626' : '#D97706',
        borderRadius: 16, padding: '14px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.3s ease-out',
        maxHeight: '70vh', overflowY: 'auto',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* 단계 표시 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {(['alert', 'stabilize', 'connect'] as CrisisStage[]).map((st) => (
          <div key={st} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: stage === st ? '#fff' : 'rgba(255,255,255,0.25)',
            cursor: 'pointer',
          }} onClick={() => setStage(st)} />
        ))}
      </div>

      {/* 1단계: 알림 */}
      {stage === 'alert' && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
              {isCritical ? '🆘' : '⚠️'}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>
                {isCritical ? s.critical : s.high}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 1.5 }}>
                {s.disclaimer}
              </p>
            </div>
            {onDismiss && (
              <button onClick={onDismiss} aria-label={s.closeBanner}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1 }}>
                ✕
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => setStage('stabilize')}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              {s.calmFirst}
            </button>
            <button onClick={() => setStage('connect')}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#fff', color: isCritical ? '#DC2626' : '#D97706', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              {s.callExpert}
            </button>
          </div>
        </>
      )}

      {/* 2단계: 안정화 */}
      {stage === 'stabilize' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{s.stabilizeTitle}</p>
            {onDismiss && (
              <button onClick={onDismiss} aria-label={s.close}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1 }}>
                ✕
              </button>
            )}
          </div>

          {!stabilizeMode && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStabilizeMode('breathing')}
                style={{ flex: 1, padding: '14px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: 24, marginBottom: 6 }}>🫁</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s.breathingTitle}</span>
                <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.breathingMethod}</span>
              </button>
              <button onClick={() => setStabilizeMode('grounding')}
                style={{ flex: 1, padding: '14px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: 24, marginBottom: 6 }}>🌿</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s.groundingTitle}</span>
                <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.groundingMethod}</span>
              </button>
            </div>
          )}

          {stabilizeMode === 'breathing' && <BreathingGuide s={s} />}
          {stabilizeMode === 'grounding' && <GroundingGuide s={s} />}

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {stabilizeMode && (
              <button onClick={() => setStabilizeMode(null)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 11, cursor: 'pointer' }}>
                {s.otherTechnique}
              </button>
            )}
            <button onClick={() => setStage('connect')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, cursor: 'pointer' }}>
              {s.toConnect}
            </button>
          </div>
        </>
      )}

      {/* 3단계: 상담사 연결 */}
      {stage === 'connect' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{s.connectTitle}</p>
            {onDismiss && (
              <button onClick={onDismiss} aria-label={s.close}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1 }}>
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {s.hotlines.map((h) => (
              <a key={h.tel} href={`tel:${h.tel}`} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: h.primary ? '12px 14px' : '10px 14px', borderRadius: 10,
                background: h.primary ? '#fff' : 'rgba(255,255,255,0.1)',
                color: h.primary ? '#DC2626' : '#fff', textDecoration: 'none',
              }}>
                <span style={{ fontSize: h.primary ? 20 : 18 }}>📞</span>
                <div>
                  <p style={{ fontSize: h.primary ? 13 : 12, fontWeight: h.primary ? 700 : 500, margin: 0 }}>{h.name}</p>
                  <p style={{ fontSize: 10, color: h.primary ? '#666' : 'rgba(255,255,255,0.6)', margin: 0 }}>{h.note}</p>
                </div>
              </a>
            ))}
          </div>

          <button onClick={() => setStage('stabilize')}
            style={{ display: 'block', width: '100%', marginTop: 10, padding: '8px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 11, cursor: 'pointer' }}>
            {s.backToStabilize}
          </button>

          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 10, textAlign: 'center' }}>
            {s.fullDisclaimer}
          </p>
        </>
      )}
    </div>
  );
});
