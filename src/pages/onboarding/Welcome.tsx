import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { useT } from '@/i18n/useT';
import type { SupportedLanguage } from '@/i18n/types';

const LANG_OPTIONS: { value: SupportedLanguage; label: string; native: string }[] = [
  { value: 'ko', label: 'KO', native: 'KO' },
  { value: 'en', label: 'EN', native: 'EN' },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { setOnboardingStep } = useAuth();
  const { language, setLanguage } = useLanguageContext();
  const [phase, setPhase] = useState<'greeting' | 'question' | 'ready'>('greeting');
  const [answer, setAnswer] = useState('');

  const t = useT().onboarding.welcome;

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
          <div className="flex items-center gap-4 mb-3">
            <img src="/icon-192x192.png" alt="VEILOR" className="w-12 h-12 rounded-xl" />
            <h1 className="text-4xl font-bold tracking-widest" style={{ color: '#E0B48A', letterSpacing: '0.2em' }}>VEILOR</h1>
          </div>
          <p className="text-base font-light" style={{ color: '#B8B3AF' }}>{t.subtitle}</p>
        </div>
        <div className="space-y-6">
          {[
            { step: '01', title: t.step1, desc: t.step1Desc },
            { step: '02', title: t.step2, desc: t.step2Desc },
            { step: '03', title: t.step3, desc: t.step3Desc },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="text-xs font-light flex-shrink-0 mt-1 w-6" style={{ color: '#E0B48A66' }}>{item.step}</div>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: '#E7E5E4' }}>{item.title}</p>
                <p className="text-xs font-light leading-relaxed" style={{ color: '#9C9590' }}>{item.desc}</p>
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
                    background: language === opt.value ? '#E0B48A' : 'transparent',
                    color: language === opt.value ? '#1C1917' : '#9C9590',
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
            <img src="/icon-192x192.png" alt="VEILOR" className="w-14 h-14 rounded-2xl mx-auto mb-2" />
            <p className="text-xs mt-1" style={{ color: '#B8B3AF' }}>{t.subtitle}</p>
          </div>

          {/* AI 대화형 진입 */}
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {/* AI 인사 */}
            <div className={`transition-all duration-700 ${phase !== 'greeting' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-start gap-3">
                <div
                  className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
                  style={{ background: '#292524', border: '1px solid #44403C' }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: '#F5F5F4' }}>
                    {t.amberHello}
                  </p>
                  <p className="text-sm leading-relaxed mt-2" style={{ color: '#B8B3AF' }}>
                    {t.amberDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* 질문 */}
            {(phase === 'question' || phase === 'ready') && (
              <div className="transition-all duration-700 opacity-100 translate-y-0 space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
                    style={{ background: '#292524', border: '1px solid #44403C' }}
                  >
                    <p className="text-sm leading-relaxed font-medium" style={{ color: '#F5F5F4' }}>
                      {t.question}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#B8B3AF' }}>
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
                background: '#E0B48A',
                color: '#1C1917',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {answer.trim() ? t.startWithAnswer : t.start}
            </button>
            <button
              onClick={handleSkipToDiagnosis}
              className="w-full text-xs py-2 transition-colors"
              style={{ color: '#B8B3AF' }}
            >
              {t.skipToVfile}
            </button>
            <p className="text-[10px] leading-relaxed text-center" style={{ color: '#87817C' }}>
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
