import { useNavigate } from 'react-router-dom';

export default function PriperStart() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-sm w-full space-y-8">
        {/* 가면 아이콘 */}
        <div
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
          style={{ background: '#D4A57415', border: '1px solid #D4A57440' }}
        >
          <span className="text-4xl">🎭</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold" style={{ color: '#F5F5F4' }}>당신의 V-File을 찾습니다</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
            12가지 관계 가면 중 당신에게 가장 가까운 패턴을 발견합니다
          </p>
        </div>

        <div
          className="rounded-xl p-5 text-left space-y-3"
          style={{ background: '#292524', border: '1px solid #44403C' }}
        >
          {[
            { icon: '⏱', text: '40개 질문 · 약 8분' },
            { icon: '💡', text: '솔직한 답변일수록 정확합니다' },
            { icon: '🔒', text: '결과는 오직 당신에게만 보입니다' },
            { icon: '↩️', text: '중단 후 이어서 진행 가능합니다' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ color: '#F5F5F4' }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
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
          분석 시작
        </button>

        <p className="text-[10px] leading-relaxed px-2" style={{ color: '#57534E' }}>
          V-File은 자기탐색 도구이며, 전문 심리상담 또는 의료 진단을 대체하지 않습니다.
          결과는 탐색적 참고 자료로 활용해 주세요.
          정신건강 관련 어려움이 있으시면 전문가 상담을 권장합니다.
        </p>
      </div>
    </div>
  );
}
