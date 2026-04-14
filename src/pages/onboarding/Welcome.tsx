import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { setOnboardingStep } = useAuth();
  const [phase, setPhase] = useState<'greeting' | 'question' | 'ready'>('greeting');
  const [answer, setAnswer] = useState('');

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
      className="min-h-screen flex flex-col px-6 py-12"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#F5F5F4' }}>VEILOR</h1>
          <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>관계의 가면을 발견하는 여정</p>
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
                  안녕하세요. 저는 엠버예요.
                </p>
                <p className="text-sm leading-relaxed mt-2" style={{ color: '#A8A29E' }}>
                  모든 관계에는 보이지 않는 패턴이 있어요.
                  당신만의 패턴을 함께 찾아볼까요?
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
                    요즘 관계에서 가장 마음에 걸리는 게 있다면, 한 줄로 말해줄 수 있어요?
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>
                    건너뛰어도 괜찮아요
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
                  placeholder="예: 가까워지면 왜 자꾸 밀어내게 되는지 모르겠어요"
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
            {answer.trim() ? '이 마음을 가지고 시작하기' : '시작하기'}
          </button>
          <button
            onClick={handleSkipToDiagnosis}
            className="w-full text-xs py-2 transition-colors"
            style={{ color: '#A8A29E' }}
          >
            바로 V-File 진단으로 →
          </button>
          <p className="text-[10px] leading-relaxed text-center" style={{ color: '#57534E' }}>
            VEILOR은 자기탐색 도구이며, 전문 심리상담 또는 치료를 대체하지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
