import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_POSTS, getInsightTease, getAmberResponse } from '@/components/landing/guestLandingData';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    subtitle: '관계의 가면을 발견하는 여정',
    amberGreet: '안녕하세요. 저는 엠버예요. 관계 패턴을 함께 탐색하는 AI입니다.',
    amberQuestion: '요즘 관계에서 가장 마음에 걸리는 게 있다면, 한 줄로 말해줄 수 있어요?',
    inputPlaceholder: '예: 가까워지면 왜 자꾸 밀어내게 되는지 모르겠어요',
    sendBtn: '엠버에게 보내기',
    skipBtn: '건너뛰기',
    chat2Placeholder: '자유롭게 답해주세요',
    chat2SendBtn: '보내기',
    postsTitle: '지금 이런 이야기들이 오가고 있어요',
    postUpvotesLabel: '공감',
    joinBtn: '가입하고 참여하기',
    insightLabel: '엠버의 초기 감지',
    insightSub: '전체 패턴과 이름을 알려면 V-File 진단이 필요해요',
    insightCta: '가입하고 내 패턴 전체 보기',
    vfileSuffix: '\n\n전체 패턴을 보려면 V-File 진단이 필요해요. 4분이면 돼요.',
    hasAccount: '이미 계정이 있어요',
    gateTitle: '당신의 관계 패턴,\n이름이 있어요.',
    gateDesc: 'V-File 진단으로 4분 만에\n나만의 관계 언어를 발견하세요.',
    startFree: '시작하기 — 무료',
    rightPanelTitle: '당신의 관계 패턴,\n이름이 있어요.',
    rightPanelDesc: 'V-File 진단으로 4분 만에 나만의 관계 언어를 발견하세요.',
  },
  en: {
    subtitle: 'Discover your relationship language',
    amberGreet: "Hi, I'm Amber. I'm an AI that explores relationship patterns with you.",
    amberQuestion: "Is there anything on your mind about relationships lately? Share it in one line.",
    inputPlaceholder: "e.g. I don't know why I push people away when I get close",
    sendBtn: 'Send to Amber',
    skipBtn: 'Skip',
    chat2Placeholder: 'Feel free to answer',
    chat2SendBtn: 'Send',
    postsTitle: 'Here are some conversations happening right now',
    postUpvotesLabel: 'Relate',
    joinBtn: 'Sign up and join',
    insightLabel: "Amber's initial detection",
    insightSub: 'You need the V-File diagnosis to see your full pattern and its name',
    insightCta: 'Sign up to see my full pattern',
    vfileSuffix: "\n\nTo see the full pattern, you'll need the V-File diagnosis. It takes 4 minutes.",
    hasAccount: 'I already have an account',
    gateTitle: 'Your relationship pattern\nhas a name.',
    gateDesc: 'Discover your own relationship language\nin just 4 minutes with V-File diagnosis.',
    startFree: 'Get started — Free',
    rightPanelTitle: 'Your relationship pattern\nhas a name.',
    rightPanelDesc: 'Discover your own relationship language in just 4 minutes with V-File diagnosis.',
  },
};

type Phase = 'landing' | 'chat1' | 'chat2' | 'insight' | 'gate';
interface Message { role: 'amber' | 'user'; text: string }

const AMBER_AVATAR = (
  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
    style={{ background: '#D4A57415', border: '1px solid #D4A57444', color: '#D4A574' }}>A</div>
);

function AmberBubble({ text, typing = false }: { text: string; typing?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {AMBER_AVATAR}
      <div className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]" style={{ background: '#292524', border: '1px solid #44403C' }}>
        {typing ? (
          <div className="flex gap-1 items-center h-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#A8A29E', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: '#F5F5F4', whiteSpace: 'pre-line' }}>{text}</p>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-tr-sm p-4 max-w-[80%]" style={{ background: '#D4A57415', border: '1px solid #D4A57430' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#F5F5F4' }}>{text}</p>
      </div>
    </div>
  );
}

export default function GuestLanding() {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const lang = language === 'en' ? 'en' : 'ko';

  const [phase, setPhase] = useState<Phase>('landing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [firstAnswer, setFirstAnswer] = useState('');
  const [secondAnswer, setSecondAnswer] = useState('');
  const [showAmberGreet, setShowAmberGreet] = useState(false);
  const [showAmberQ, setShowAmberQ] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'landing') {
      const t1 = setTimeout(() => setShowAmberGreet(true), 600);
      const t2 = setTimeout(() => setShowAmberQ(true), 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [phase]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing, phase]);

  const sendFirstAnswer = async () => {
    const ans = input.trim();
    if (!ans) return;
    setFirstAnswer(ans);
    setInput('');
    setPhase('chat1');
    setMessages([{ role: 'user', text: ans }]);
    setTyping(true);
    const response = getAmberResponse(ans);
    await new Promise(r => setTimeout(r, 1400));
    setTyping(false);
    setMessages(prev => [...prev, { role: 'amber', text: response.reply[lang] }]);
    await new Promise(r => setTimeout(r, 800));
    setTyping(true);
    await new Promise(r => setTimeout(r, 1200));
    setTyping(false);
    setMessages(prev => [...prev, { role: 'amber', text: response.followUp[lang] }]);
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
    setMessages(prev => [...prev, { role: 'amber', text: `${tease[lang]}${s.vfileSuffix}` }]);
    await new Promise(r => setTimeout(r, 600));
    setPhase('insight');
  };

  const handleSkip = () => setPhase('gate');

  // PC 우측 고정 패널
  const RightPanel = () => (
    <aside className="hidden lg:flex flex-col gap-8 flex-shrink-0 px-10 py-14 overflow-y-auto"
      style={{ width: 360, borderLeft: '1px solid #2A2624' }}>
      <div>
        <p className="text-xs mb-1" style={{ color: '#57534E', letterSpacing: '0.06em' }}>VEILOR</p>
        <p className="text-2xl font-light leading-snug mb-2" style={{ color: '#F5F5F4', whiteSpace: 'pre-line' }}>{s.rightPanelTitle}</p>
        <p className="text-sm font-light leading-relaxed" style={{ color: '#A8A29E' }}>{s.rightPanelDesc}</p>
      </div>
      <div className="space-y-3">
        <button onClick={() => navigate('/auth/signup')}
          className="w-full py-3.5 rounded-xl text-sm font-medium"
          style={{ background: '#D4A574', color: '#1C1917' }}>
          {s.startFree}
        </button>
        <button onClick={() => navigate('/auth/login')}
          className="w-full py-2.5 rounded-xl text-sm"
          style={{ color: '#A8A29E', border: '1px solid #44403C' }}>
          {s.hasAccount}
        </button>
      </div>
      <div>
        <p className="text-xs mb-3" style={{ color: '#57534E' }}>{s.postsTitle}</p>
        <div className="space-y-3">
          {PUBLIC_POSTS.map(post => (
            <div key={post.id} className="rounded-xl p-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
              <p className="text-xs mb-2" style={{ color: '#A8A29E' }}>{post.mask} · {post.group[lang]}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content[lang]}</p>
              <p className="text-xs mt-2" style={{ color: '#57534E' }}>{s.postUpvotesLabel} {post.upvotes}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>
      {/* 좌측: 채팅 영역 */}
      <div className="flex-1 flex flex-col">
      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col px-6 py-10">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#F5F5F4' }}>VEILOR</h1>
          <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>{s.subtitle}</p>
        </div>

        {phase === 'landing' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="transition-all duration-700" style={{ opacity: showAmberGreet ? 1 : 0, transform: showAmberGreet ? 'translateY(0)' : 'translateY(8px)' }}>
                <AmberBubble text={s.amberGreet} />
              </div>
              <div className="transition-all duration-700" style={{ opacity: showAmberQ ? 1 : 0, transform: showAmberQ ? 'translateY(0)' : 'translateY(8px)' }}>
                <AmberBubble text={s.amberQuestion} />
              </div>
              {showAmberQ && (
                <div className="transition-all duration-500 pl-11" style={{ opacity: showAmberQ ? 1 : 0 }}>
                  <textarea
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFirstAnswer(); } }}
                    placeholder={s.inputPlaceholder}
                    maxLength={200} rows={3}
                    className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                    style={{ background: '#292524', border: '1px solid #44403C', color: '#F5F5F4', fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={sendFirstAnswer} disabled={!input.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity"
                      style={{ background: '#D4A574', color: '#1C1917', opacity: input.trim() ? 1 : 0.4 }}>
                      {s.sendBtn}
                    </button>
                    <button onClick={handleSkip} className="px-4 py-2.5 rounded-xl text-sm" style={{ color: '#A8A29E', border: '1px solid #44403C' }}>
                      {s.skipBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-12">
              <p className="text-xs mb-4" style={{ color: '#57534E' }}>{s.postsTitle}</p>
              <div className="space-y-3">
                {PUBLIC_POSTS.map(post => (
                  <div key={post.id} className="rounded-xl p-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
                    <p className="text-xs mb-2" style={{ color: '#A8A29E' }}>{post.mask} · {post.group[lang]}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content[lang]}</p>
                    <p className="text-xs mt-2" style={{ color: '#57534E' }}>{s.postUpvotesLabel} {post.upvotes}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleSkip} className="w-full mt-4 py-3 rounded-xl text-sm" style={{ border: '1px solid #44403C', color: '#A8A29E' }}>
                {s.joinBtn}
              </button>
            </div>
          </div>
        )}

        {(phase === 'chat1' || phase === 'chat2' || phase === 'insight') && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto pb-4">
              <AmberBubble text={s.amberGreet} />
              <AmberBubble text={s.amberQuestion} />
              {messages.map((m, i) => m.role === 'user' ? <UserBubble key={i} text={m.text} /> : <AmberBubble key={i} text={m.text} />)}
              {typing && <AmberBubble text="" typing />}
              <div ref={bottomRef} />
            </div>

            {phase === 'chat2' && (
              <div className="pt-4 border-t" style={{ borderColor: '#292524' }}>
                <textarea
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendSecondAnswer(); } }}
                  placeholder={s.chat2Placeholder} maxLength={200} rows={2}
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none mb-2"
                  style={{ background: '#292524', border: '1px solid #44403C', color: '#F5F5F4', fontFamily: "'DM Sans', sans-serif" }}
                />
                <div className="flex gap-2">
                  <button onClick={sendSecondAnswer} disabled={!input.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: '#D4A574', color: '#1C1917', opacity: input.trim() ? 1 : 0.4 }}>
                    {s.chat2SendBtn}
                  </button>
                  <button onClick={() => setPhase('insight')} className="px-4 py-2.5 rounded-xl text-sm" style={{ color: '#A8A29E', border: '1px solid #44403C' }}>
                    {s.skipBtn}
                  </button>
                </div>
              </div>
            )}

            {phase === 'insight' && (
              <div className="pt-6 space-y-3">
                <div className="rounded-xl p-4 text-center" style={{ background: '#D4A57410', border: '1px solid #D4A57430' }}>
                  <p className="text-xs mb-1" style={{ color: '#A8A29E' }}>{s.insightLabel}</p>
                  <p className="text-sm font-medium" style={{ color: '#D4A574' }}>{getInsightTease(firstAnswer + ' ' + secondAnswer)[language === 'en' ? 'en' : 'ko']}</p>
                  <p className="text-xs mt-2" style={{ color: '#78716C' }}>{s.insightSub}</p>
                </div>
                <button onClick={() => navigate('/auth/signup')} className="w-full py-3.5 rounded-xl text-sm font-medium" style={{ background: '#D4A574', color: '#1C1917' }}>
                  {s.insightCta}
                </button>
                <button onClick={() => navigate('/auth/login')} className="w-full py-2.5 rounded-xl text-sm" style={{ color: '#A8A29E', border: '1px solid #44403C' }}>
                  {s.hasAccount}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'gate' && (
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="text-center space-y-3">
              <p className="text-2xl font-semibold leading-snug" style={{ color: '#F5F5F4', whiteSpace: 'pre-line' }}>{s.gateTitle}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#A8A29E', whiteSpace: 'pre-line' }}>{s.gateDesc}</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs" style={{ color: '#57534E' }}>{s.postsTitle}</p>
              {PUBLIC_POSTS.slice(0, 2).map(post => (
                <div key={post.id} className="rounded-xl p-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
                  <p className="text-xs mb-2" style={{ color: '#A8A29E' }}>{post.mask} · {post.group[lang]}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content[lang]}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate('/auth/signup')} className="w-full py-3.5 rounded-xl text-sm font-medium" style={{ background: '#D4A574', color: '#1C1917' }}>
                {s.startFree}
              </button>
              <button onClick={() => navigate('/auth/login')} className="w-full py-2.5 rounded-xl text-sm" style={{ color: '#A8A29E', border: '1px solid #44403C' }}>
                {s.hasAccount}
              </button>
            </div>
          </div>
        )}

      </div>
      </div>
      {/* 우측 패널 — PC 전용 */}
      <RightPanel />
    </div>
  );
}
