// Held — 감정이 올라와 있고, 일단 말하고 싶다
// 기능: 감정 선택 → 자유 입력 → AI 비판단 수용 응답
// 현재: UI 뼈대 (Claude API Edge Function 연동 예정)

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { invokeHeldChat } from '@/lib/heldChatClient';
import { detectCrisisLevel } from '@/lib/crisisDetect';
import { useStateSnapshot } from '@/hooks/useStateSnapshot';
import { decideMode } from '@/lib/modeDecider';
import { useDynamicMaskSignal } from '@/hooks/useDynamicMaskSignal';
import CrisisBanner from '@/components/CrisisBanner';
import SessionClosingProtocol from '@/components/ai/SessionClosingProtocol';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const EMOTIONS = [
  { emoji: '😔', label: '무기력' },
  { emoji: '😤', label: '답답' },
  { emoji: '😰', label: '불안' },
  { emoji: '😌', label: '평온' },
  { emoji: '🥹', label: '벅참' },
  { emoji: '😑', label: '공허' },
  { emoji: '😡', label: '분노' },
  { emoji: '😢', label: '슬픔' },
];

export default function HeldPage() {
  const { user, primaryMask, axisScores } = useAuth();
  const { saveSnapshot } = useStateSnapshot(user?.id);
  const { recordSignal } = useDynamicMaskSignal(user?.id, primaryMask);
  const [emotion, setEmotion] = useState('');
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisLevel, setCrisisLevel] = useState<'critical' | 'high' | 'medium' | 'none'>('none');
  const [messageCount, setMessageCount] = useState(0);
  const [showClosing, setShowClosing] = useState(false);
  // #5 실시간 패턴 연결 알림
  const [patternAlert, setPatternAlert] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim() && !emotion) return;
    setLoading(true);
    setResponse('');

    // 1차 위기 감지 (UI 레벨)
    const detected = detectCrisisLevel(text);
    setCrisisLevel(detected);

    // Mode 결정
    const { mode } = decideMode('vent', messageCount, detected === 'medium' ? 'none' : detected);

    // State Snapshot 저장 (비동기, 응답 차단 안 함)
    saveSnapshot({
      current_mode: mode,
      risk_level: detected === 'medium' ? 'medium' : detected,
      active_pattern: primaryMask ?? undefined,
      session_phase: messageCount < 3 ? 'explore' : messageCount < 8 ? 'deepen' : 'resolve',
    });

    try {
      const data = await invokeHeldChat({
        emotion, text, history: [],
        mask: primaryMask ?? undefined,
        axisScores: axisScores ?? null,
        tab: 'vent',
      });
      setResponse(data?.response ?? '');
      const newCount = messageCount + 1;
      setMessageCount(newCount);

      // #7 동적 진단 재보정 신호 기록
      const { shouldAlert, suggestedMask } = await recordSignal(emotion, text);

      // #5 실시간 패턴 연결 알림: 동적 신호 또는 정기 트리거
      const alertMask = shouldAlert && suggestedMask ? suggestedMask : (primaryMask && newCount >= 3 && newCount % 4 === 3 ? primaryMask : null);
      if (alertMask) {
        setPatternAlert(alertMask);
        setTimeout(() => setPatternAlert(null), 6000);
      }
    } catch (err) {
      console.error('held-chat error:', err);
      setResponse('지금 응답을 받기 어려워요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (response) {
    if (showClosing) {
      return (
        <div className="px-4 py-6 max-w-sm mx-auto">
          <SessionClosingProtocol
            messageCount={messageCount}
            lastEmotion={emotion}
            onClose={() => { setShowClosing(false); setResponse(''); setText(''); setEmotion(''); }}
          />
        </div>
      );
    }

    return (
      <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
        <button onClick={() => setResponse('')} className="text-xs text-muted-foreground">← 돌아가기</button>
        {(crisisLevel === 'critical' || crisisLevel === 'high') && (
          <CrisisBanner severity={crisisLevel} onDismiss={() => setCrisisLevel('none')} />
        )}

        {/* #5 실시간 패턴 연결 알림 */}
        {patternAlert && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">패턴 인지 순간 ✦</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              지금 이 감정 — <span className="text-foreground font-medium">{patternAlert}</span> 가면이 활성화될 때 자주 느끼는 것과 닮아 있어요.
            </p>
          </div>
        )}

        <div className="bg-card border rounded-2xl p-5 space-y-4">
          <p className="text-xs text-muted-foreground">AI 대화 파트너</p>
          <p className="text-sm leading-relaxed">{response}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setResponse(''); }}
            className="flex-1 h-10 rounded-xl border border-border text-sm text-muted-foreground"
          >
            계속 이야기하기
          </button>
          {messageCount >= 3 && (
            <button
              onClick={() => setShowClosing(true)}
              className="flex-1 h-10 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium"
            >
              마무리하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-sm mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Held</h2>
        <p className="text-sm text-muted-foreground mt-1">지금 느끼는 걸 그대로 말해도 괜찮아요.</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">지금 어떤 감정인가요?</p>
        <div className="grid grid-cols-4 gap-2">
          {EMOTIONS.map(e => (
            <button
              key={e.label}
              onClick={() => setEmotion(e.label)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-colors
                ${emotion === e.label ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <span className="text-xl">{e.emoji}</span>
              <span>{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="무슨 일이 있었나요? 편하게 적어보세요."
        value={text}
        onChange={e => setText(e.target.value)}
        className="h-32 resize-none"
      />

      <Button
        className="w-full h-11"
        onClick={handleSubmit}
        disabled={loading || (!emotion && !text.trim())}
      >
        {loading ? '읽고 있어요...' : '말하기'}
      </Button>
    </div>
  );
}
