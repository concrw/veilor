/**
 * Partner Pattern Inference — 단방향 입력에서 관계 상대방 패턴 추론
 * 사용자가 상대방의 행동/말을 묘사하면 M43 가면 패턴을 추론하여 표시
 * #9 기능
 */
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { invokeHeldChat } from '@/lib/heldChatClient';

const PARTNER_SIGNALS: Record<string, { label: string; patterns: string[] }> = {
  control: {
    label: '통제/지시적',
    patterns: ['항상 자기 방식대로', '내 의견을 무시해', '결정권을 안 줘', '화를 내면 맞춰주게 돼'],
  },
  avoid: {
    label: '회피/거리두기',
    patterns: ['감정 이야기를 안 해', '바빠서 연락을 못 해', '갑자기 차가워져', '혼자만의 공간이 필요하다고 해'],
  },
  dependent: {
    label: '의존/집착',
    patterns: ['항상 내 옆에 있으려 해', '나 없으면 안 된다고 해', '혼자 있는 걸 무서워해', '내 일거수일투족을 물어봐'],
  },
  caretaker: {
    label: '돌봄/희생',
    patterns: ['항상 내 걱정을 해줘', '자기 필요는 말을 안 해', '모든 걸 챙겨주려 해', '힘들어도 괜찮다고 해'],
  },
  narcissistic: {
    label: '자기중심적',
    patterns: ['자기 얘기만 해', '나의 감정엔 관심 없어', '대화가 항상 자기 위주야', '칭찬을 엄청 필요로 해'],
  },
};

const MASK_INFERENCE_MAP: Record<string, { msk: string; name: string; desc: string }> = {
  control:     { msk: 'PWR', name: '통제자', desc: '불안과 무력감에서 비롯된 과도한 통제 패턴이 보여요. 상대는 예측 불가능한 상황을 두려워할 수 있어요.' },
  avoid:       { msk: 'AVD', name: '현자', desc: '감정 노출을 피하는 회피 패턴이 보여요. 친밀감이 위협으로 느껴질 수 있어요.' },
  dependent:   { msk: 'DEP', name: '희생자', desc: '버려짐에 대한 두려움에서 오는 의존 패턴이 보여요. 혼자가 되는 것을 두려워할 수 있어요.' },
  caretaker:   { msk: 'GVR', name: '돌봄자', desc: '자신을 지워야 사랑받는다는 믿음에서 오는 패턴이에요. 거절이나 부담을 매우 두려워해요.' },
  narcissistic:{ msk: 'NRC', name: '공허자', desc: '내면의 공허를 채우기 위한 인정 추구 패턴이에요. 깊은 곳에 자기 가치에 대한 의심이 있을 수 있어요.' },
};

interface Props {
  onIntegrate?: (text: string) => void;
}

export default function PartnerPatternInference({ onIntegrate }: Props) {
  const [open, setOpen] = useState(false);
  const [partnerText, setPartnerText] = useState('');
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [inferredPattern, setInferredPattern] = useState<typeof MASK_INFERENCE_MAP[string] | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSignal = (key: string) => {
    setSelectedSignals(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const infer = async () => {
    if (!partnerText.trim() && selectedSignals.length === 0) return;
    setLoading(true);
    setAiInsight('');

    // 로컬 추론: 선택된 신호 중 가장 많이 선택된 패턴
    const top = selectedSignals[0] ?? null;
    const local = top ? MASK_INFERENCE_MAP[top] ?? null : null;
    setInferredPattern(local);

    // AI 심층 분석
    try {
      const prompt = `관계 상대방 분석을 부탁해요.

상대방 행동 묘사:
${partnerText}

선택된 패턴 신호: ${selectedSignals.map(s => PARTNER_SIGNALS[s]?.label).join(', ')}

이 사람의 행동 패턴에서 보이는 심리적 구조를 2~3문장으로 설명해주세요.
"이 사람은 ~한 패턴을 가졌다"가 아니라, "이런 행동 뒤에는 ~한 두려움/필요가 있을 수 있어요"처럼 공감적으로 해석해주세요.
마지막에 "나는 이 관계에서 어떻게 반응하고 있는지" 한 문장으로 연결해주세요.`;

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
    if (partnerText.trim()) parts.push(`상대방 행동: ${partnerText}`);
    if (inferredPattern) parts.push(`추론된 상대 패턴: ${inferredPattern.name}(${inferredPattern.msk})`);
    if (aiInsight) parts.push(`패턴 해석: ${aiInsight}`);
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
          <p className="text-xs font-medium text-foreground">상대방 패턴도 탐색할까요?</p>
          <p className="text-[10px] text-muted-foreground">상대의 행동을 묘사하면 패턴을 추론해 드려요</p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">상대방 패턴 탐색</p>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground">닫기</button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">상대가 자주 하는 행동이나 말을 묘사해보세요</p>
        <Textarea
          placeholder="예: 화가 나면 말을 끊어버려요. 내가 틀렸다고 느끼게 만들어요."
          value={partnerText}
          onChange={e => setPartnerText(e.target.value)}
          className="h-20 resize-none text-sm"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">해당하는 패턴을 선택하세요 (복수 가능)</p>
        <div className="space-y-1.5">
          {Object.entries(PARTNER_SIGNALS).map(([key, val]) => (
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
          ))}
        </div>
      </div>

      <Button
        onClick={infer}
        disabled={loading || (!partnerText.trim() && selectedSignals.length === 0)}
        className="w-full h-10"
      >
        {loading ? '추론 중...' : '패턴 추론하기'}
      </Button>

      {inferredPattern && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">{inferredPattern.name} ({inferredPattern.msk})</span>
            <span className="text-[10px] text-muted-foreground">추론된 가면</span>
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
              이 내용을 Dig 탐색에 포함하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
