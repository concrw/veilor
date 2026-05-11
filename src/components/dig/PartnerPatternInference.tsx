/**
 * Partner Pattern Inference — 단방향 입력에서 관계 상대방 패턴 추론
 * 사용자가 상대방의 행동/말을 묘사하면 M43 가면 패턴을 추론하여 표시
 * #9 기능
 */
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { invokeHeldChat } from '@/lib/heldChatClient';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';


const SIGNALS_DATA: Record<string, { ko: { label: string; patterns: string[] }; en: { label: string; patterns: string[] } }> = {
  control:     { ko: { label: '통제/지시적',   patterns: ['항상 자기 방식대로', '내 의견을 무시해', '결정권을 안 줘', '화를 내면 맞춰주게 돼'] }, en: { label: 'Controlling / Directive', patterns: ['Always their way', "Dismisses my opinion", "Won't give me a say", "I give in when they get angry"] } },
  avoid:       { ko: { label: '회피/거리두기', patterns: ['감정 이야기를 안 해', '바빠서 연락을 못 해', '갑자기 차가워져', '혼자만의 공간이 필요하다고 해'] }, en: { label: 'Avoidant / Distancing', patterns: ["Won't talk about feelings", 'Too busy to reach out', 'Suddenly turns cold', 'Says they need space alone'] } },
  dependent:   { ko: { label: '의존/집착',     patterns: ['항상 내 옆에 있으려 해', '나 없으면 안 된다고 해', '혼자 있는 걸 무서워해', '내 일거수일투족을 물어봐'] }, en: { label: 'Dependent / Clingy', patterns: ['Always wants to be by my side', "Says they can't live without me", 'Afraid of being alone', 'Asks about my every move'] } },
  caretaker:   { ko: { label: '돌봄/희생',     patterns: ['항상 내 걱정을 해줘', '자기 필요는 말을 안 해', '모든 걸 챙겨주려 해', '힘들어도 괜찮다고 해'] }, en: { label: 'Caretaker / Self-sacrificing', patterns: ['Always worries about me', 'Never mentions own needs', 'Tries to take care of everything', "Says they're fine even when struggling"] } },
  narcissistic:{ ko: { label: '자기중심적',    patterns: ['자기 얘기만 해', '나의 감정엔 관심 없어', '대화가 항상 자기 위주야', '칭찬을 엄청 필요로 해'] }, en: { label: 'Self-centered', patterns: ['Only talks about themselves', 'Uninterested in my feelings', 'Conversations are always about them', 'Constantly needs praise'] } },
};

const MASKS_DATA: Record<string, { ko: { name: string; desc: string }; en: { name: string; desc: string } }> = {
  control:     { ko: { name: '통제자',  desc: '불안과 무력감에서 비롯된 과도한 통제 패턴이 보여요. 상대는 예측 불가능한 상황을 두려워할 수 있어요.' }, en: { name: 'Controller', desc: 'Excessive control stemming from anxiety and helplessness. They may fear unpredictable situations.' } },
  avoid:       { ko: { name: '현자',    desc: '감정 노출을 피하는 회피 패턴이 보여요. 친밀감이 위협으로 느껴질 수 있어요.' }, en: { name: 'Sage', desc: 'An avoidant pattern of hiding emotions. Intimacy may feel threatening.' } },
  dependent:   { ko: { name: '희생자', desc: '버려짐에 대한 두려움에서 오는 의존 패턴이 보여요. 혼자가 되는 것을 두려워할 수 있어요.' }, en: { name: 'Victim', desc: 'A dependent pattern rooted in fear of abandonment. Being alone may feel unbearable.' } },
  caretaker:   { ko: { name: '돌봄자', desc: '자신을 지워야 사랑받는다는 믿음에서 오는 패턴이에요. 거절이나 부담을 매우 두려워해요.' }, en: { name: 'Caregiver', desc: 'A pattern rooted in the belief that one must erase themselves to be loved. They deeply fear rejection or being a burden.' } },
  narcissistic:{ ko: { name: '공허자', desc: '내면의 공허를 채우기 위한 인정 추구 패턴이에요. 깊은 곳에 자기 가치에 대한 의심이 있을 수 있어요.' }, en: { name: 'The Hollow', desc: 'Seeking validation to fill an inner void. Deep down, there may be doubt about their own worth.' } },
};

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
  const t = useT();
  const s = t.digExtra.partnerPattern;
  const { language } = useLanguageContext();
  const signals = Object.fromEntries(
    Object.entries(SIGNALS_DATA).map(([k, v]) => [k, v[language as 'ko' | 'en'] ?? v.ko])
  ) as Record<SignalKey, { label: string; patterns: string[] }>;
  const masks = Object.fromEntries(
    Object.entries(MASKS_DATA).map(([k, v]) => [k, v[language as 'ko' | 'en'] ?? v.ko])
  ) as Record<SignalKey, { name: string; desc: string }>;
  const aiPrompt = (partnerText: string, signalLabels: string) => language === 'en'
    ? `Please analyze my relationship partner.

Description of partner's behavior:
${partnerText}

Selected pattern signals: ${signalLabels}

In 2–3 sentences, explain the psychological structure visible in this person's behavior patterns.
Instead of "This person has a ~ pattern," use an empathetic framing like "Behind this behavior, there may be a ~ fear or need."
Finally, connect with one sentence about how I am responding in this relationship.`
    : `관계 상대방 분석을 부탁해요.

상대방 행동 묘사:
${partnerText}

선택된 패턴 신호: ${signalLabels}

이 사람의 행동 패턴에서 보이는 심리적 구조를 2~3문장으로 설명해주세요.
"이 사람은 ~한 패턴을 가졌다"가 아니라, "이런 행동 뒤에는 ~한 두려움/필요가 있을 수 있어요"처럼 공감적으로 해석해주세요.
마지막에 "나는 이 관계에서 어떻게 반응하고 있는지" 한 문장으로 연결해주세요.`;

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
      const maskInfo = masks[top];
      setInferredPattern({ msk: MASK_CODES[top], name: maskInfo.name, desc: maskInfo.desc });
    } else {
      setInferredPattern(null);
    }

    // AI 심층 분석
    try {
      const signalLabels = selectedSignals.map(k => signals[k]?.label).join(', ');
      const prompt = aiPrompt(partnerText, signalLabels);

      const data = await invokeHeldChat({
        emotion: '',
        text: prompt,
        history: [],
        tab: 'dig',
      });
      setAiInsight(data?.response ?? '');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'MONTHLY_LIMIT_REACHED') {
        window.dispatchEvent(new Event('veilor:ai-limit-reached'));
      }
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
          {(Object.keys(signals) as SignalKey[]).map(key => {
            const val = signals[key];
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
