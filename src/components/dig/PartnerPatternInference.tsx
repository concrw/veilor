/**
 * Partner Pattern Inference — 단방향 입력에서 관계 상대방 패턴 추론
 * 사용자가 상대방의 행동/말을 묘사하면 M43 가면 패턴을 추론하여 표시
 * #9 기능
 */
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { invokeHeldChat } from '@/lib/heldChatClient';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    triggerTitle: '상대방 패턴도 탐색할까요?',
    triggerDesc: '상대의 행동을 묘사하면 패턴을 추론해 드려요',
    panelTitle: '상대방 패턴 탐색',
    close: '닫기',
    behaviorLabel: '상대가 자주 하는 행동이나 말을 묘사해보세요',
    behaviorPlaceholder: '예: 화가 나면 말을 끊어버려요. 내가 틀렸다고 느끼게 만들어요.',
    patternSelectLabel: '해당하는 패턴을 선택하세요 (복수 가능)',
    inferButton: '패턴 추론하기',
    inferring: '추론 중...',
    inferredMaskLabel: '추론된 가면',
    includeButton: '이 내용을 Dig 탐색에 포함하기',
    partnerBehaviorPrefix: '상대방 행동',
    inferredPatternPrefix: '추론된 상대 패턴',
    patternInsightPrefix: '패턴 해석',
    signals: {
      control:     { label: '통제/지시적',   patterns: ['항상 자기 방식대로', '내 의견을 무시해', '결정권을 안 줘', '화를 내면 맞춰주게 돼'] },
      avoid:       { label: '회피/거리두기', patterns: ['감정 이야기를 안 해', '바빠서 연락을 못 해', '갑자기 차가워져', '혼자만의 공간이 필요하다고 해'] },
      dependent:   { label: '의존/집착',     patterns: ['항상 내 옆에 있으려 해', '나 없으면 안 된다고 해', '혼자 있는 걸 무서워해', '내 일거수일투족을 물어봐'] },
      caretaker:   { label: '돌봄/희생',     patterns: ['항상 내 걱정을 해줘', '자기 필요는 말을 안 해', '모든 걸 챙겨주려 해', '힘들어도 괜찮다고 해'] },
      narcissistic:{ label: '자기중심적',    patterns: ['자기 얘기만 해', '나의 감정엔 관심 없어', '대화가 항상 자기 위주야', '칭찬을 엄청 필요로 해'] },
    },
    masks: {
      control:     { name: '통제자',  desc: '불안과 무력감에서 비롯된 과도한 통제 패턴이 보여요. 상대는 예측 불가능한 상황을 두려워할 수 있어요.' },
      avoid:       { name: '현자',    desc: '감정 노출을 피하는 회피 패턴이 보여요. 친밀감이 위협으로 느껴질 수 있어요.' },
      dependent:   { name: '희생자', desc: '버려짐에 대한 두려움에서 오는 의존 패턴이 보여요. 혼자가 되는 것을 두려워할 수 있어요.' },
      caretaker:   { name: '돌봄자', desc: '자신을 지워야 사랑받는다는 믿음에서 오는 패턴이에요. 거절이나 부담을 매우 두려워해요.' },
      narcissistic:{ name: '공허자', desc: '내면의 공허를 채우기 위한 인정 추구 패턴이에요. 깊은 곳에 자기 가치에 대한 의심이 있을 수 있어요.' },
    },
    aiPrompt: (partnerText: string, signalLabels: string) =>
      `관계 상대방 분석을 부탁해요.\n\n상대방 행동 묘사:\n${partnerText}\n\n선택된 패턴 신호: ${signalLabels}\n\n이 사람의 행동 패턴에서 보이는 심리적 구조를 2~3문장으로 설명해주세요.\n"이 사람은 ~한 패턴을 가졌다"가 아니라, "이런 행동 뒤에는 ~한 두려움/필요가 있을 수 있어요"처럼 공감적으로 해석해주세요.\n마지막에 "나는 이 관계에서 어떻게 반응하고 있는지" 한 문장으로 연결해주세요.`,
  },
  en: {
    triggerTitle: 'Want to explore your partner\'s patterns?',
    triggerDesc: 'Describe their behavior and we\'ll infer the pattern',
    panelTitle: 'Partner Pattern Exploration',
    close: 'Close',
    behaviorLabel: 'Describe what your partner frequently says or does',
    behaviorPlaceholder: 'e.g. When they\'re angry, they shut down. They make me feel like I\'m always wrong.',
    patternSelectLabel: 'Select applicable patterns (multiple allowed)',
    inferButton: 'Infer pattern',
    inferring: 'Inferring...',
    inferredMaskLabel: 'Inferred mask',
    includeButton: 'Include this in Dig exploration',
    partnerBehaviorPrefix: 'Partner behavior',
    inferredPatternPrefix: 'Inferred partner pattern',
    patternInsightPrefix: 'Pattern interpretation',
    signals: {
      control:     { label: 'Controlling / Directive', patterns: ['Always their way', 'Dismisses my opinion', 'Won\'t give me a say', 'I give in when they get angry'] },
      avoid:       { label: 'Avoidant / Distancing',   patterns: ['Won\'t talk about feelings', 'Too busy to reach out', 'Suddenly turns cold', 'Says they need space alone'] },
      dependent:   { label: 'Dependent / Clingy',      patterns: ['Always wants to be by my side', 'Says they can\'t live without me', 'Afraid of being alone', 'Asks about my every move'] },
      caretaker:   { label: 'Caretaker / Self-sacrificing', patterns: ['Always worries about me', 'Never mentions own needs', 'Tries to take care of everything', 'Says they\'re fine even when struggling'] },
      narcissistic:{ label: 'Self-centered',           patterns: ['Only talks about themselves', 'Uninterested in my feelings', 'Conversations are always about them', 'Constantly needs praise'] },
    },
    masks: {
      control:     { name: 'Controller', desc: 'Excessive control stemming from anxiety and helplessness. They may fear unpredictable situations.' },
      avoid:       { name: 'Sage',       desc: 'An avoidant pattern of hiding emotions. Intimacy may feel threatening.' },
      dependent:   { name: 'Victim',     desc: 'A dependent pattern rooted in fear of abandonment. Being alone may feel unbearable.' },
      caretaker:   { name: 'Caregiver',  desc: 'A pattern rooted in the belief that one must erase themselves to be loved. They deeply fear rejection or being a burden.' },
      narcissistic:{ name: 'The Hollow', desc: 'Seeking validation to fill an inner void. Deep down, there may be doubt about their own worth.' },
    },
    aiPrompt: (partnerText: string, signalLabels: string) =>
      `Please analyze my relationship partner.\n\nDescription of partner's behavior:\n${partnerText}\n\nSelected pattern signals: ${signalLabels}\n\nIn 2–3 sentences, explain the psychological structure visible in this person's behavior patterns.\nInstead of "This person has a ~ pattern," use an empathetic framing like "Behind this behavior, there may be a ~ fear or need."\nFinally, connect with one sentence about how I am responding in this relationship.`,
  },
} as const;

type SignalKey = 'control' | 'avoid' | 'dependent' | 'caretaker' | 'narcissistic';

const MASK_CODES: Record<SignalKey, string> = {
  control: 'PWR',
  avoid: 'AVD',
  dependent: 'DEP',
  caretaker: 'GVR',
  narcissistic: 'NRC',
};

interface Props {
  onIntegrate?: (text: string) => void;
}

export default function PartnerPatternInference({ onIntegrate }: Props) {
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [open, setOpen] = useState(false);
  const [partnerText, setPartnerText] = useState('');
  const [selectedSignals, setSelectedSignals] = useState<SignalKey[]>([]);
  const [inferredPattern, setInferredPattern] = useState<{ msk: string; name: string; desc: string } | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSignal = (key: SignalKey) => {
    setSelectedSignals(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const infer = async () => {
    if (!partnerText.trim() && selectedSignals.length === 0) return;
    setLoading(true);
    setAiInsight('');

    // 로컬 추론: 선택된 신호 중 첫 번째 패턴
    const top = selectedSignals[0] ?? null;
    if (top) {
      const maskInfo = s.masks[top];
      setInferredPattern({ msk: MASK_CODES[top], name: maskInfo.name, desc: maskInfo.desc });
    } else {
      setInferredPattern(null);
    }

    // AI 심층 분석
    try {
      const signalLabels = selectedSignals.map(k => s.signals[k]?.label).join(', ');
      const prompt = s.aiPrompt(partnerText, signalLabels);

      const data = await invokeHeldChat({
        emotion: '',
        text: prompt,
        history: [],
        tab: 'dig',
      });
      setAiInsight(data?.response ?? '');
    } catch {
      // AI 분석 실패해도 로컬 추론 결과는 표시
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrate = () => {
    if (!onIntegrate) return;
    const parts: string[] = [];
    if (partnerText.trim()) parts.push(`${s.partnerBehaviorPrefix}: ${partnerText}`);
    if (inferredPattern) parts.push(`${s.inferredPatternPrefix}: ${inferredPattern.name}(${inferredPattern.msk})`);
    if (aiInsight) parts.push(`${s.patternInsightPrefix}: ${aiInsight}`);
    onIntegrate(parts.join('\n\n'));
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:border-primary/30 transition-colors text-left"
      >
        <span className="text-base">🪞</span>
        <div>
          <p className="text-xs font-medium text-foreground">{s.triggerTitle}</p>
          <p className="text-[10px] text-muted-foreground">{s.triggerDesc}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{s.panelTitle}</p>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground">{s.close}</button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{s.behaviorLabel}</p>
        <Textarea
          placeholder={s.behaviorPlaceholder}
          value={partnerText}
          onChange={e => setPartnerText(e.target.value)}
          className="h-20 resize-none text-sm"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{s.patternSelectLabel}</p>
        <div className="space-y-1.5">
          {(Object.keys(s.signals) as SignalKey[]).map(key => {
            const val = s.signals[key];
            return (
              <button
                key={key}
                onClick={() => toggleSignal(key)}
                className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors ${
                  selectedSignals.includes(key)
                    ? 'border-primary/40 bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <span className="font-medium">{val.label}</span>
                <span className="text-[10px] ml-2 text-muted-foreground">{val.patterns[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={infer}
        disabled={loading || (!partnerText.trim() && selectedSignals.length === 0)}
        className="w-full h-10"
      >
        {loading ? s.inferring : s.inferButton}
      </Button>

      {inferredPattern && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">{inferredPattern.name} ({inferredPattern.msk})</span>
            <span className="text-[10px] text-muted-foreground">{s.inferredMaskLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{inferredPattern.desc}</p>
          {aiInsight && (
            <p className="text-xs leading-relaxed text-foreground pt-2 border-t border-border/50">{aiInsight}</p>
          )}
          {onIntegrate && (
            <button
              onClick={handleIntegrate}
              className="w-full h-8 mt-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium"
            >
              {s.includeButton}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
