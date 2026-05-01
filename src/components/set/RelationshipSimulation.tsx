// #33 관계 시뮬레이션 — AI 역할극 + #34 CodeTalk 연습
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { invokeHeldChat } from '@/lib/heldChatClient';
import { useLanguageContext } from '@/context/LanguageContext';
// MASK_PROFILES may be used for scenario personalization in future

const S = {
  ko: {
    title: '관계 시뮬레이션',
    intro: 'AI와 역할극으로 소통 스킬을 연습해보세요',
    start: '시작',
    end: '종료',
    inputPlaceholder: '대화를 이어가세요...',
    send: '전송',
    aiReady: '준비됐어? 시작할게. 자연스럽게 대화해봐.',
    aiThinking: '상대가 대답하고 있어요...',
    aiError: '연결이 어려워요. 다시 시도해주세요.',
    scenarios: [
      { id: 'boundary', title: '경계 설정 연습', desc: '상대에게 NO라고 말하기', prompt: '사용자가 관계에서 경계를 설정하는 연습을 하고 있어. 상대 역할을 맡아서 자연스러운 대화 상황을 만들어줘. 사용자가 경계를 말하면 현실적으로 반응해.' },
      { id: 'conflict', title: '갈등 해결 연습', desc: '감정적이지 않게 의견 전달', prompt: '사용자가 갈등 상황에서 비폭력적 소통을 연습하고 있어. 약간 화난 상대 역할을 맡아줘. 사용자가 감정 언어를 사용하면 긍정적으로 반응해.' },
      { id: 'needs', title: '욕구 표현 연습', desc: '내가 원하는 것을 말하기', prompt: '사용자가 관계에서 자신의 욕구를 표현하는 연습을 하고 있어. 파트너 역할을 맡아서 들어줘. 사용자가 솔직하게 말하면 공감적으로 반응해.' },
      { id: 'apology', title: '사과하기 연습', desc: '진심 어린 사과와 책임', prompt: '사용자가 사과하는 연습을 하고 있어. 상처받은 상대 역할을 맡아줘. 사용자가 진심 어린 사과를 하면 조금씩 마음을 열어줘.' },
    ],
  },
  en: {
    title: 'Relationship Simulation',
    intro: 'Practice communication skills through role-play with AI',
    start: 'Start',
    end: 'End',
    inputPlaceholder: 'Continue the conversation...',
    send: 'Send',
    aiReady: 'Ready? Let\'s begin. Talk naturally.',
    aiThinking: 'The other person is responding...',
    aiError: 'Connection failed. Please try again.',
    scenarios: [
      { id: 'boundary', title: 'Boundary Setting Practice', desc: 'Say NO to someone', prompt: 'The user is practicing setting boundaries in a relationship. Play the role of the other person and create a natural conversation. React realistically when the user sets a boundary.' },
      { id: 'conflict', title: 'Conflict Resolution Practice', desc: 'Express views without getting emotional', prompt: 'The user is practicing nonviolent communication in a conflict situation. Play a slightly upset counterpart. Respond positively when the user uses emotional language.' },
      { id: 'needs', title: 'Expressing Needs Practice', desc: 'Say what I want', prompt: "The user is practicing expressing their needs in a relationship. Play the role of a partner and listen. Respond empathetically when the user speaks honestly." },
      { id: 'apology', title: 'Apology Practice', desc: 'Sincere apology and accountability', prompt: "The user is practicing making an apology. Play the role of a hurt person. Gradually open up when the user makes a sincere apology." },
    ],
  },
};

export default function RelationshipSimulation() {
  const { user, primaryMask, axisScores } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const [scenario, setScenario] = useState<typeof s.scenarios[0] | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const startScenario = (sc: typeof s.scenarios[0]) => {
    setScenario(sc);
    setMessages([{ role: 'ai', text: s.aiReady }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !scenario || loading) return;
    const userMsg = { role: 'user' as const, text: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await invokeHeldChat({
        text: input.trim(),
        emotion: '',
        mask: primaryMask ?? '',
        axisScores: axisScores ?? undefined,
        history: [...messages, userMsg].slice(-6),
        tab: 'set',
        aiSettings: { name: 'Simulation Partner', tone: 'calm', personality: 'direct' },
      });
      setMessages(m => [...m, { role: 'ai', text: data?.response ?? '...' }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: s.aiError }]);
    }
    setLoading(false);
  };

  if (!scenario) {
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">{s.title}</p>
        <p className="text-xs text-muted-foreground">{s.intro}</p>
        <div className="space-y-2">
          {s.scenarios.map(sc => (
            <button key={sc.id} onClick={() => startScenario(sc)}
              className="w-full flex items-center gap-3 bg-muted/50 rounded-xl p-3 text-left hover:bg-muted transition-colors">
              <div className="flex-1">
                <p className="text-xs font-medium">{sc.title}</p>
                <p className="text-[10px] text-muted-foreground">{sc.desc}</p>
              </div>
              <span className="text-xs text-primary">{s.start}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{scenario.title}</p>
        <button onClick={() => { setScenario(null); setMessages([]); }} className="text-[10px] text-muted-foreground">{s.end}</button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${
            m.role === 'user' ? 'bg-primary/10 ml-auto' : 'bg-muted/50'
          }`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground animate-pulse">{s.aiThinking}</div>}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder={s.inputPlaceholder}
          className="flex-1 bg-background border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={sendMessage} disabled={!input.trim() || loading}
          className="px-4 py-2 bg-primary text-white text-xs rounded-lg disabled:opacity-40">{s.send}</button>
      </div>
    </div>
  );
}
