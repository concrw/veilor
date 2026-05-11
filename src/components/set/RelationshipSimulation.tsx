// #33 관계 시뮬레이션 — AI 역할극 + #34 CodeTalk 연습
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { invokeHeldChat } from '@/lib/heldChatClient';
import { useT } from '@/i18n/useT';
// MASK_PROFILES may be used for scenario personalization in future

export default function RelationshipSimulation() {
  const { user, primaryMask, axisScores } = useAuth();
  const t = useT();
  const s = t.relationshipSimulation;
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
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'MONTHLY_LIMIT_REACHED') {
        window.dispatchEvent(new Event('veilor:ai-limit-reached'));
        setLoading(false);
        return;
      }
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
