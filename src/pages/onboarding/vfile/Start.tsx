import { useNavigate } from 'react-router-dom';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    subtitle: '관계의 가면을 발견하는 여정',
    sidebarHeading: '12가지 관계 가면 중\n당신의 패턴을 발견합니다',
    sidebarSubtext: '40개의 질문으로 구성되어 있으며,\n솔직한 답변일수록 정확한 결과를 얻을 수 있습니다.',
    heading: '당신의 V-File을 찾습니다',
    subtext: '12가지 관계 가면 중 당신에게 가장 가까운 패턴을 발견합니다',
    items: [
      '40개 질문 · 약 8분',
      '솔직한 답변일수록 정확합니다',
      '결과는 오직 당신에게만 보입니다',
      '중단 후 이어서 진행 가능합니다',
    ],
    btnStart: '분석 시작',
    disclaimer: 'V-File은 자기탐색 도구이며, 전문 심리상담 또는 의료 진단을 대체하지 않습니다.\n결과는 탐색적 참고 자료로 활용해 주세요.\n정신건강 관련 어려움이 있으시면 전문가 상담을 권장합니다.',
  },
  en: {
    subtitle: 'A journey to discover your relational mask',
    sidebarHeading: 'Discover your pattern\namong 12 relational masks',
    sidebarSubtext: 'Consists of 40 questions.\nThe more honest your answers, the more accurate the results.',
    heading: 'Finding your V-File',
    subtext: 'Discover the pattern closest to you among 12 relational masks',
    items: [
      '40 questions · about 8 min',
      'Honest answers lead to accurate results',
      'Only you can see your results',
      'You can pause and resume anytime',
    ],
    btnStart: 'Start analysis',
    disclaimer: 'V-File is a self-exploration tool and does not replace professional counseling or medical diagnosis.\nPlease use the results as exploratory reference material.\nIf you are experiencing mental health difficulties, we recommend consulting a professional.',
  },
};

export default function PriperStart() {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <h1 className="text-4xl font-bold tracking-widest mb-3" style={{ color: '#D4A574', letterSpacing: '0.2em' }}>VEILOR</h1>
          <p className="text-base font-light" style={{ color: '#A8A29E' }}>{s.subtitle}</p>
        </div>
        <div className="space-y-4">
          <p className="text-2xl font-light leading-snug" style={{ color: '#F5F5F4' }}>
            {s.sidebarHeading.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#78716C' }}>
            {s.sidebarSubtext.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>
        </div>
        <p className="text-xs" style={{ color: '#44403C' }}>© 2026 VEILOR</p>
      </div>

      {/* 우측 콘텐츠 영역 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[480px] items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-8">
        {/* 가면 아이콘 */}
        <div
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
          style={{ background: '#D4A57415', border: '1px solid #D4A57440' }}
        >
          <span className="text-4xl">🎭</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold" style={{ color: '#F5F5F4' }}>{s.heading}</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
            {s.subtext}
          </p>
        </div>

        <div
          className="rounded-xl p-5 text-left space-y-3"
          style={{ background: '#292524', border: '1px solid #44403C' }}
        >
          {(['⏱', '💡', '🔒', '↩️'] as const).map((icon, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ color: '#F5F5F4' }}>
              <span>{icon}</span>
              <span>{s.items[i]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/onboarding/vfile/questions')}
          className="w-full h-12 text-base rounded-xl font-medium transition-opacity"
          style={{
            background: '#D4A574',
            color: '#1C1917',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {s.btnStart}
        </button>

        <p className="text-[10px] leading-relaxed px-2" style={{ color: '#57534E' }}>
          {s.disclaimer.split('\n').map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && ' '}</span>)}
        </p>
      </div>
      </div>
    </div>
  );
}
