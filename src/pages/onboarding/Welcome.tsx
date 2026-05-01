import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import type { SupportedLanguage } from '@/i18n/types';

const LANG_OPTIONS: { value: SupportedLanguage; label: string; native: string }[] = [
  { value: 'ko', label: '한국어', native: 'KO' },
  { value: 'en', label: 'English', native: 'EN' },
];

// 온보딩 텍스트는 선택된 언어에 따라 직접 분기 (useTranslation 대신)
const TEXT = {
  ko: {
    subtitle: '관계의 가면을 발견하는 여정',
    step1: '엠버와의 첫 대화',
    step1Desc: '지금 관계에서 느끼는 것을 자유롭게 털어놓으세요.',
    step2: '핵심 질문 4가지',
    step2Desc: '나의 관계 방식과 감정 스타일을 파악합니다.',
    step3: 'V-File 진단',
    step3Desc: '12가지 관계 가면 중 당신의 패턴을 발견합니다.',
    amberhello: '안녕하세요. 저는 엠버예요.',
    amberdesc: '모든 관계에는 보이지 않는 패턴이 있어요. 당신만의 패턴을 함께 찾아볼까요?',
    question: '요즘 관계에서 가장 마음에 걸리는 게 있다면, 한 줄로 말해줄 수 있어요?',
    questionHint: '건너뛰어도 괜찮아요',
    placeholder: '예: 가까워지면 왜 자꾸 밀어내게 되는지 모르겠어요',
    startWithAnswer: '이 마음을 가지고 시작하기',
    start: '시작하기',
    skipToVfile: '바로 V-File 진단으로 →',
    disclaimer: 'VEILOR은 자기탐색 도구이며, 전문 심리상담 또는 치료를 대체하지 않습니다.',
    langLabel: '언어',
  },
  en: {
    subtitle: 'Discover your relationship language',
    step1: 'First chat with Amber',
    step1Desc: 'Share what you\'re feeling in your relationships right now.',
    step2: '4 core questions',
    step2Desc: 'We\'ll understand your relationship style and emotional patterns.',
    step3: 'V-File diagnosis',
    step3Desc: 'Discover your pattern among 12 relationship masks.',
    amberhello: 'Hi, I\'m Amber.',
    amberdesc: 'Every relationship has invisible patterns. Let\'s discover yours together.',
    question: 'Is there anything on your mind about relationships lately? Share in one line.',
    questionHint: 'You can skip this',
    placeholder: 'e.g. I don\'t know why I push people away when I get close',
    startWithAnswer: 'Start with this in mind',
    start: 'Get started',
    skipToVfile: 'Go straight to V-File →',
    disclaimer: 'VEILOR is a self-exploration tool and does not replace professional counseling or therapy.',
    langLabel: 'Language',
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { setOnboardingStep } = useAuth();
  const { language, setLanguage } = useLanguageContext();
  const [phase, setPhase] = useState<'greeting' | 'question' | 'ready'>('greeting');
  const [answer, setAnswer] = useState('');

  const t = TEXT[language] ?? TEXT.ko;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('question'), 2000);
    return () => clearTimeout(t1);
  }, []);

  const handleStart = async () => {
    await setOnboardingStep('cq');
    navigate('/onboarding/cq');
  };

  const handleSkipToDiagnosis = async () => {
    await setOnboardingStep('priper');
    navigate('/onboarding/vfile/start');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <h1 className="text-4xl font-bold tracking-widest mb-3" style={{ color: '#D4A574', letterSpacing: '0.2em' }}>VEILOR</h1>
          <p className="text-base font-light" style={{ color: '#A8A29E' }}>{t.subtitle}</p>
        </div>
        <div className="space-y-6">
          {[
            { step: '01', title: t.step1, desc: t.step1Desc },
            { step: '02', title: t.step2, desc: t.step2Desc },
            { step: '03', title: t.step3, desc: t.step3Desc },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="text-xs font-light flex-shrink-0 mt-1 w-6" style={{ color: '#D4A57466' }}>{item.step}</div>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: '#E7E5E4' }}>{item.title}</p>
                <p className="text-xs font-light leading-relaxed" style={{ color: '#78716C' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: '#44403C' }}>© 2026 VEILOR</p>
      </div>

      {/* 우측 콘텐츠 영역 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[480px] items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full flex-1 flex flex-col">

          {/* 언어 선택 — 상단 우측 */}
          <div className="flex justify-end mb-4">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#292524', border: '1px solid #44403C' }}>
              {LANG_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: language === opt.value ? 600 : 400,
                    background: language === opt.value ? '#D4A574' : 'transparent',
                    color: language === opt.value ? '#1C1917' : '#78716C',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {opt.native}
                </button>
              ))}
            </div>
          </div>

          {/* 로고 — 모바일에서만 */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#F5F5F4' }}>VEILOR</h1>
            <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>{t.subtitle}</p>
          </div>

          {/* AI 대화형 진입 */}
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {/* AI 인사 */}
            <div className={`transition-all duration-700 ${phase !== 'greeting' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: '#D4A57415', border: '1px solid #D4A57444', color: '#D4A574' }}
                >
                  A
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
                  style={{ background: '#292524', border: '1px solid #44403C' }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: '#F5F5F4' }}>
                    {t.amberhello}
                  </p>
                  <p className="text-sm leading-relaxed mt-2" style={{ color: '#A8A29E' }}>
                    {t.amberdesc}
                  </p>
                </div>
              </div>
            </div>

            {/* 질문 */}
            {(phase === 'question' || phase === 'ready') && (
              <div className="transition-all duration-700 opacity-100 translate-y-0 space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: '#D4A57415', border: '1px solid #D4A57444', color: '#D4A574' }}
                  >
                    A
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
                    style={{ background: '#292524', border: '1px solid #44403C' }}
                  >
                    <p className="text-sm leading-relaxed font-medium" style={{ color: '#F5F5F4' }}>
                      {t.question}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>
                      {t.questionHint}
                    </p>
                  </div>
                </div>

                {/* 사용자 응답 */}
                <div className="pl-11">
                  <textarea
                    value={answer}
                    onChange={e => {
                      setAnswer(e.target.value);
                      if (e.target.value.trim()) setPhase('ready');
                    }}
                    placeholder={t.placeholder}
                    className="w-full rounded-xl p-3 text-sm resize-none h-20 outline-none transition-colors"
                    style={{
                      background: '#292524',
                      border: '1px solid #44403C',
                      color: '#F5F5F4',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    maxLength={200}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="space-y-3 mt-8">
            <button
              onClick={handleStart}
              className="w-full h-12 text-base rounded-xl font-medium transition-opacity"
              style={{
                background: '#D4A574',
                color: '#1C1917',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {answer.trim() ? t.startWithAnswer : t.start}
            </button>
            <button
              onClick={handleSkipToDiagnosis}
              className="w-full text-xs py-2 transition-colors"
              style={{ color: '#A8A29E' }}
            >
              {t.skipToVfile}
            </button>
            <p className="text-[10px] leading-relaxed text-center" style={{ color: '#57534E' }}>
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
