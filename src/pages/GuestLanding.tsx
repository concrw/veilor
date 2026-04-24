import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 엠버 응답 패턴 — 키워드 기반 공감 + 인사이트 티저
const AMBER_RESPONSES: Array<{ keywords: string[]; reply: string; followUp: string }> = [
  {
    keywords: ['밀어', '거리', '피해', '도망', '혼자'],
    reply: '가까워질수록 오히려 뒤로 물러나고 싶어지는 느낌... 그게 반복되면 스스로도 이해가 안 되죠.',
    followUp: '그 순간, 어떤 생각이 먼저 드나요? "떠날 것 같다"는 두려움인가요, 아니면 "나 혼자가 더 편해"라는 감각인가요?',
  },
  {
    keywords: ['매달', '불안', '연락', '확인', '집착', '걱정'],
    reply: '연락이 없으면 온갖 생각이 들고, 안심하려면 확인이 필요한 느낌... 그 불안이 얼마나 소진되는지 알아요.',
    followUp: '그 불안이 처음 생긴 게 언제쯤인지 떠오르는 순간이 있나요?',
  },
  {
    keywords: ['말', '표현', '못해', '참아', '숨겨', '억압', '감정'],
    reply: '하고 싶은 말이 있는데 삼키는 연습을 너무 오래 해온 것 같네요.',
    followUp: '그 말을 못 꺼내는 이유가 "상처줄까봐"인가요, "무시당할까봐"인가요?',
  },
  {
    keywords: ['싸움', '갈등', '반복', '패턴', '같은'],
    reply: '다른 관계인데 왜 같은 일이 반복되는 걸까, 라는 의문... 그게 이 서비스를 시작하게 되는 가장 흔한 이유예요.',
    followUp: '그 반복되는 장면에서 주로 어떤 역할을 하게 되나요? 참는 쪽인가요, 폭발하는 쪽인가요?',
  },
  {
    keywords: ['외로', '혼자', '이해', '공감', '모르'],
    reply: '누군가와 함께 있어도 혼자인 것 같은 그 느낌, 가장 지치는 외로움이죠.',
    followUp: '가장 마지막으로 "이 사람은 나를 이해하는구나"라고 느꼈던 게 언제인지 기억나요?',
  },
];

const DEFAULT_RESPONSE = {
  reply: '그 마음을 꺼내줬군요. 쉽지 않은 말인데.',
  followUp: '지금 가장 힘든 관계가 연인인가요, 가족인가요, 아니면 나 자신과의 관계인가요?',
};

// 가상 커뮤니티 글 (공개)
const PUBLIC_POSTS = [
  {
    id: 'p1',
    mask: '나비 가면',
    content: '왜 나는 항상 먼저 연락을 끊을까요. 상대가 나를 떠날 것 같은 느낌이 들면 먼저 거리를 둬버려요.',
    upvotes: 14,
    group: '회피형 애착 극복 모임',
  },
  {
    id: 'p2',
    mask: '유리 가면',
    content: '감정을 표현했더니 "너무 예민하다"는 말을 들었어요. 앞으로 말을 안 하는 게 나을 것 같아서 더 무서워요.',
    upvotes: 31,
    group: '소통 & 갈등 해결',
  },
  {
    id: 'p3',
    mask: '안개 가면',
    content: '상대방이 화가 났을 때 나는 왜 무조건 내 잘못인 것 같을까요. 사과를 먼저 하고 나서야 숨을 쉴 수 있어요.',
    upvotes: 22,
    group: '불안형 애착',
  },
];

// 패턴 티저 — 답변 키워드 기반
function getInsightTease(answer: string): string {
  const a = answer.toLowerCase();
  if (/밀어|거리|피해|혼자|도망/.test(a)) return '"가까워질수록 멀어지는" 패턴이 보여요.';
  if (/매달|불안|확인|집착/.test(a)) return '"연결이 끊길까봐" 두려워하는 패턴이 보여요.';
  if (/말|표현|참아|숨겨/.test(a)) return '"감정을 삼키는" 패턴이 보여요.';
  if (/싸움|갈등|반복/.test(a)) return '"같은 장면이 반복되는" 패턴이 보여요.';
  return '"관계에서 내 패턴"이 보이기 시작하고 있어요.';
}

function getAmberResponse(answer: string) {
  const a = answer.toLowerCase();
  for (const r of AMBER_RESPONSES) {
    if (r.keywords.some(k => a.includes(k))) return r;
  }
  return DEFAULT_RESPONSE;
}

type Phase = 'landing' | 'chat1' | 'chat2' | 'insight' | 'gate';

interface Message {
  role: 'amber' | 'user';
  text: string;
}

const AMBER_AVATAR = (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
    style={{ background: '#D4A57415', border: '1px solid #D4A57444', color: '#D4A574' }}
  >
    A
  </div>
);

function AmberBubble({ text, typing = false }: { text: string; typing?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {AMBER_AVATAR}
      <div
        className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
        style={{ background: '#292524', border: '1px solid #44403C' }}
      >
        {typing ? (
          <div className="flex gap-1 items-center h-5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: '#A8A29E', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: '#F5F5F4' }}>{text}</p>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="rounded-2xl rounded-tr-sm p-4 max-w-[80%]"
        style={{ background: '#D4A57415', border: '1px solid #D4A57430' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: '#F5F5F4' }}>{text}</p>
      </div>
    </div>
  );
}

export default function GuestLanding() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [firstAnswer, setFirstAnswer] = useState('');
  const [secondAnswer, setSecondAnswer] = useState('');
  const [showAmberGreet, setShowAmberGreet] = useState(false);
  const [showAmberQ, setShowAmberQ] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 랜딩 진입 시 엠버 등장 애니메이션
  useEffect(() => {
    if (phase === 'landing') {
      const t1 = setTimeout(() => setShowAmberGreet(true), 600);
      const t2 = setTimeout(() => setShowAmberQ(true), 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [phase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, phase]);

  const sendFirstAnswer = async () => {
    const ans = input.trim();
    if (!ans) return;
    setFirstAnswer(ans);
    setInput('');
    setPhase('chat1');

    const userMsg: Message = { role: 'user', text: ans };
    setMessages([userMsg]);
    setTyping(true);

    const response = getAmberResponse(ans);
    await new Promise(r => setTimeout(r, 1400));
    setTyping(false);
    setMessages(prev => [...prev, { role: 'amber', text: response.reply }]);

    await new Promise(r => setTimeout(r, 800));
    setTyping(true);
    await new Promise(r => setTimeout(r, 1200));
    setTyping(false);
    setMessages(prev => [...prev, { role: 'amber', text: response.followUp }]);
    setPhase('chat2');
  };

  const sendSecondAnswer = async () => {
    const ans = input.trim();
    if (!ans) return;
    setSecondAnswer(ans);
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: ans }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 1600));
    setTyping(false);

    const tease = getInsightTease(firstAnswer + ' ' + ans);
    setMessages(prev => [...prev, {
      role: 'amber',
      text: `${tease}\n\n전체 패턴을 보려면 V-File 진단이 필요해요. 4분이면 돼요.`,
    }]);

    await new Promise(r => setTimeout(r, 600));
    setPhase('insight');
  };

  const handleSkip = () => setPhase('gate');

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col px-6 py-10">

        {/* 로고 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#F5F5F4' }}>VEILOR</h1>
          <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>관계의 가면을 발견하는 여정</p>
        </div>

        {/* ── 랜딩: 엠버 첫 등장 ── */}
        {(phase === 'landing') && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div
                className="transition-all duration-700"
                style={{ opacity: showAmberGreet ? 1 : 0, transform: showAmberGreet ? 'translateY(0)' : 'translateY(8px)' }}
              >
                <AmberBubble text="안녕하세요. 저는 엠버예요. 관계 패턴을 함께 탐색하는 AI입니다." />
              </div>

              <div
                className="transition-all duration-700"
                style={{ opacity: showAmberQ ? 1 : 0, transform: showAmberQ ? 'translateY(0)' : 'translateY(8px)' }}
              >
                <AmberBubble text="요즘 관계에서 가장 마음에 걸리는 게 있다면, 한 줄로 말해줄 수 있어요?" />
              </div>

              {showAmberQ && (
                <div
                  className="transition-all duration-500 pl-11"
                  style={{ opacity: showAmberQ ? 1 : 0 }}
                >
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFirstAnswer(); } }}
                    placeholder="예: 가까워지면 왜 자꾸 밀어내게 되는지 모르겠어요"
                    maxLength={200}
                    rows={3}
                    className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                    style={{ background: '#292524', border: '1px solid #44403C', color: '#F5F5F4', fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={sendFirstAnswer}
                      disabled={!input.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity"
                      style={{ background: '#D4A574', color: '#1C1917', opacity: input.trim() ? 1 : 0.4 }}
                    >
                      엠버에게 보내기
                    </button>
                    <button
                      onClick={handleSkip}
                      className="px-4 py-2.5 rounded-xl text-sm"
                      style={{ color: '#A8A29E', border: '1px solid #44403C' }}
                    >
                      건너뛰기
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 공개 커뮤니티 */}
            <div className="mt-12">
              <p className="text-xs mb-4" style={{ color: '#57534E' }}>지금 이런 이야기들이 오가고 있어요</p>
              <div className="space-y-3">
                {PUBLIC_POSTS.map(post => (
                  <div
                    key={post.id}
                    className="rounded-xl p-4"
                    style={{ background: '#292524', border: '1px solid #44403C' }}
                  >
                    <p className="text-xs mb-2" style={{ color: '#A8A29E' }}>{post.mask} · {post.group}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content}</p>
                    <p className="text-xs mt-2" style={{ color: '#57534E' }}>공감 {post.upvotes}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSkip}
                className="w-full mt-4 py-3 rounded-xl text-sm"
                style={{ border: '1px solid #44403C', color: '#A8A29E' }}
              >
                가입하고 참여하기
              </button>
            </div>
          </div>
        )}

        {/* ── 채팅 단계 ── */}
        {(phase === 'chat1' || phase === 'chat2' || phase === 'insight') && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto pb-4">
              {/* 초기 엠버 메시지 재표시 */}
              <AmberBubble text="안녕하세요. 저는 엠버예요. 관계 패턴을 함께 탐색하는 AI입니다." />
              <AmberBubble text="요즘 관계에서 가장 마음에 걸리는 게 있다면, 한 줄로 말해줄 수 있어요?" />

              {messages.map((m, i) =>
                m.role === 'user'
                  ? <UserBubble key={i} text={m.text} />
                  : <AmberBubble key={i} text={m.text} />
              )}

              {typing && <AmberBubble text="" typing />}
              <div ref={bottomRef} />
            </div>

            {/* 두 번째 답변 입력 */}
            {phase === 'chat2' && (
              <div className="pt-4 border-t" style={{ borderColor: '#292524' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendSecondAnswer(); } }}
                  placeholder="자유롭게 답해주세요"
                  maxLength={200}
                  rows={2}
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none mb-2"
                  style={{ background: '#292524', border: '1px solid #44403C', color: '#F5F5F4', fontFamily: "'DM Sans', sans-serif" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={sendSecondAnswer}
                    disabled={!input.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: '#D4A574', color: '#1C1917', opacity: input.trim() ? 1 : 0.4 }}
                  >
                    보내기
                  </button>
                  <button
                    onClick={() => setPhase('insight')}
                    className="px-4 py-2.5 rounded-xl text-sm"
                    style={{ color: '#A8A29E', border: '1px solid #44403C' }}
                  >
                    건너뛰기
                  </button>
                </div>
              </div>
            )}

            {/* 인사이트 → 가입 게이트 */}
            {phase === 'insight' && (
              <div className="pt-6 space-y-3">
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: '#D4A57410', border: '1px solid #D4A57430' }}
                >
                  <p className="text-xs mb-1" style={{ color: '#A8A29E' }}>엠버의 초기 감지</p>
                  <p className="text-sm font-medium" style={{ color: '#D4A574' }}>
                    {getInsightTease(firstAnswer + ' ' + secondAnswer)}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#78716C' }}>
                    전체 패턴과 이름을 알려면 V-File 진단이 필요해요
                  </p>
                </div>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="w-full py-3.5 rounded-xl text-sm font-medium"
                  style={{ background: '#D4A574', color: '#1C1917' }}
                >
                  가입하고 내 패턴 전체 보기
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="w-full py-2.5 rounded-xl text-sm"
                  style={{ color: '#A8A29E', border: '1px solid #44403C' }}
                >
                  이미 계정이 있어요
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 가입 게이트 (건너뛰기 경우) ── */}
        {phase === 'gate' && (
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="text-center space-y-3">
              <p className="text-2xl font-semibold leading-snug" style={{ color: '#F5F5F4' }}>
                당신의 관계 패턴,<br />이름이 있어요.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#A8A29E' }}>
                V-File 진단으로 4분 만에<br />나만의 관계 언어를 발견하세요.
              </p>
            </div>

            {/* 공개 커뮤니티 미리보기 */}
            <div className="space-y-3">
              <p className="text-xs" style={{ color: '#57534E' }}>지금 이런 이야기들이 오가고 있어요</p>
              {PUBLIC_POSTS.slice(0, 2).map(post => (
                <div
                  key={post.id}
                  className="rounded-xl p-4"
                  style={{ background: '#292524', border: '1px solid #44403C' }}
                >
                  <p className="text-xs mb-2" style={{ color: '#A8A29E' }}>{post.mask} · {post.group}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth/signup')}
                className="w-full py-3.5 rounded-xl text-sm font-medium"
                style={{ background: '#D4A574', color: '#1C1917' }}
              >
                시작하기 — 무료
              </button>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-2.5 rounded-xl text-sm"
                style={{ color: '#A8A29E', border: '1px solid #44403C' }}
              >
                이미 계정이 있어요
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
