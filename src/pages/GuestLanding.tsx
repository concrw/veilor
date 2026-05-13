import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_POSTS, getInsightTease, getAmberResponse } from '@/components/landing/guestLandingData';
import { useLanguageContext } from '@/context/LanguageContext';
import { useT } from '@/i18n/useT';

type Phase = 'landing' | 'chat1' | 'chat2' | 'insight' | 'gate';
interface Message { role: 'amber' | 'user'; text: string }

const AMBER_AVATAR = (
  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
    style={{ background: '#E0B48A15', border: '1px solid #E0B48A44', color: '#E0B48A' }}>A</div>
);

function AmberBubble({ text, typing = false }: { text: string; typing?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {AMBER_AVATAR}
      <div className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]" style={{ background: '#292524', border: '1px solid #44403C' }}>
        {typing ? (
          <div className="flex gap-1 items-center h-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#B8B3AF', animationDelay: `${i * 0.15}s` }} />
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
      <div className="rounded-2xl rounded-tr-sm p-4 max-w-[80%]" style={{ background: '#E0B48A15', border: '1px solid #E0B48A30' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#F5F5F4' }}>{text}</p>
      </div>
    </div>
  );
}

export default function GuestLanding() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageContext();
  const t = useT();
  const s = t.guestLanding;
  const lang = language === 'en' ? 'en' : 'ko'; // guestLandingData는 ko/en 2개 언어만 지원

  const [phase, setPhase] = useState<Phase>('gate');
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
      setShowAmberGreet(true);
      const t2 = setTimeout(() => setShowAmberQ(true), 800);
      return () => { clearTimeout(t2); };
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
        <p className="text-2xl font-light leading-snug mb-2" style={{ color: '#F5F5F4', whiteSpace: 'pre-line' }}>{s.rightPanelTitle}</p>
        <p className="text-sm font-light leading-relaxed" style={{ color: '#B8B3AF' }}>{s.rightPanelDesc}</p>
      </div>
      <div className="space-y-3">
        <button onClick={() => navigate('/auth/signup')}
          className="w-full py-3.5 rounded-xl text-sm font-medium"
          style={{ background: '#E0B48A', color: '#1C1917' }}>
          {s.startFree}
        </button>
        <button onClick={() => navigate('/auth/login')}
          className="w-full py-2.5 rounded-xl text-sm"
          style={{ color: '#B8B3AF', border: '1px solid #44403C' }}>
          {s.hasAccount}
        </button>
      </div>
      <div>
        <p className="text-xs mb-3" style={{ color: '#87817C' }}>{s.postsTitle}</p>
        <div className="space-y-3">
          {PUBLIC_POSTS.map(post => (
            <div key={post.id} className="rounded-xl p-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
              <p className="text-xs mb-2" style={{ color: '#B8B3AF' }}>{post.mask} · {post.group[lang]}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content[lang]}</p>
              <p className="text-xs mt-2" style={{ color: '#87817C' }}>{s.postUpvotesLabel} {post.upvotes}</p>
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
      <div className="w-full flex-1 flex flex-col px-6 pt-5 pb-10">

        <div className="text-center mb-8">
          <div className="flex justify-end mb-3">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #44403C' }}>
              {(['en', 'ko', 'ja'] as const).map(l => (
                <button key={l} onClick={() => setLanguage(l)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ background: language === l ? '#E0B48A' : 'transparent', color: language === l ? '#1C1917' : '#B8B3AF' }}>
                  {l === 'en' ? 'EN' : l === 'ko' ? '한국어' : '日本語'}
                </button>
              ))}
            </div>
          </div>
          <img src="/icon-192x192.png" alt="VEILOR" className="w-14 h-14 rounded-2xl mx-auto mb-3" />
          <p className="text-xs mt-1" style={{ color: '#B8B3AF' }}>{s.subtitle}</p>
        </div>

        {phase === 'landing' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <AmberBubble text={s.amberGreet} />
              <div className="transition-all duration-500" style={{ opacity: showAmberQ ? 1 : 0, transform: showAmberQ ? 'translateY(0)' : 'translateY(6px)' }}>
                <AmberBubble text={s.amberQuestion} />
              </div>
              {showAmberQ && (
                <div className="transition-all duration-500 pl-11" style={{ opacity: showAmberQ ? 1 : 0 }}>
                  <textarea
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFirstAnswer(); } }}
                    placeholder={s.inputPlaceholder}
                    maxLength={200} rows={3}
                    className="w-full rounded-xl p-3 resize-none outline-none"
                    style={{ background: '#292524', border: '1px solid #44403C', color: '#F5F5F4', fontFamily: "'DM Sans', sans-serif", fontSize: 16 }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={sendFirstAnswer} disabled={!input.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity"
                      style={{ background: '#E0B48A', color: '#1C1917', opacity: input.trim() ? 1 : 0.4 }}>
                      {s.sendBtn}
                    </button>
                    <button onClick={handleSkip} className="px-4 py-2.5 rounded-xl text-sm" style={{ color: '#B8B3AF', border: '1px solid #44403C' }}>
                      {s.skipBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-12">
              <p className="text-xs mb-4" style={{ color: '#87817C' }}>{s.postsTitle}</p>
              <div className="space-y-3">
                {PUBLIC_POSTS.map(post => (
                  <div key={post.id} className="rounded-xl p-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
                    <p className="text-xs mb-2" style={{ color: '#B8B3AF' }}>{post.mask} · {post.group[lang]}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content[lang]}</p>
                    <p className="text-xs mt-2" style={{ color: '#87817C' }}>{s.postUpvotesLabel} {post.upvotes}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleSkip} className="w-full mt-4 py-3 rounded-xl text-sm" style={{ border: '1px solid #44403C', color: '#B8B3AF' }}>
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
                  className="w-full rounded-xl p-3 resize-none outline-none mb-2"
                  style={{ background: '#292524', border: '1px solid #44403C', color: '#F5F5F4', fontFamily: "'DM Sans', sans-serif", fontSize: 16 }}
                />
                <div className="flex gap-2">
                  <button onClick={sendSecondAnswer} disabled={!input.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: '#E0B48A', color: '#1C1917', opacity: input.trim() ? 1 : 0.4 }}>
                    {s.chat2SendBtn}
                  </button>
                  <button onClick={() => setPhase('insight')} className="px-4 py-2.5 rounded-xl text-sm" style={{ color: '#B8B3AF', border: '1px solid #44403C' }}>
                    {s.skipBtn}
                  </button>
                </div>
              </div>
            )}

            {phase === 'insight' && (
              <div className="pt-6 space-y-3">
                <div className="rounded-xl p-4 text-center" style={{ background: '#E0B48A10', border: '1px solid #E0B48A30' }}>
                  <p className="text-xs mb-1" style={{ color: '#B8B3AF' }}>{s.insightLabel}</p>
                  <p className="text-sm font-medium" style={{ color: '#E0B48A' }}>{getInsightTease(firstAnswer + ' ' + secondAnswer)[language === 'en' ? 'en' : 'ko']}</p>
                  <p className="text-xs mt-2" style={{ color: '#9C9590' }}>{s.insightSub}</p>
                </div>
                <button onClick={() => navigate('/auth/signup')} className="w-full py-3.5 rounded-xl text-sm font-medium" style={{ background: '#E0B48A', color: '#1C1917' }}>
                  {s.insightCta}
                </button>
                <button onClick={() => navigate('/auth/login')} className="w-full py-2.5 rounded-xl text-sm" style={{ color: '#B8B3AF', border: '1px solid #44403C' }}>
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
              <p className="text-sm leading-relaxed" style={{ color: '#B8B3AF', whiteSpace: 'pre-line' }}>{s.gateDesc}</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs" style={{ color: '#87817C' }}>{s.postsTitle}</p>
              {PUBLIC_POSTS.slice(0, 2).map(post => (
                <div key={post.id} className="rounded-xl p-4" style={{ background: '#292524', border: '1px solid #44403C' }}>
                  <p className="text-xs mb-2" style={{ color: '#B8B3AF' }}>{post.mask} · {post.group[lang]}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#D4D4D0' }}>{post.content[lang]}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate('/onboarding/vfile/start')} className="w-full py-3.5 rounded-xl text-sm font-medium" style={{ background: '#E0B48A', color: '#1C1917' }}>
                {s.startFree}
              </button>
              <button onClick={() => navigate('/auth/login')} className="w-full py-2.5 rounded-xl text-sm" style={{ color: '#B8B3AF', border: '1px solid #44403C' }}>
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
