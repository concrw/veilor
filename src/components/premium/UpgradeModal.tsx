import { useState, useEffect } from 'react';
import { supabase, veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { C } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';

export type TriggerType =
  | 'codetalk_ai_limit'
  | 'multi_persona_analysis'
  | 'ikigai_design'
  | 'brand_identity'
  | 'monthly_report_detail'
  | 'priper_result'
  | 'onboarding_complete'
  | 'partner_analysis'
  | 'auto_translate';

interface TriggerConfig {
  icon: string;
  title: string;
  description: string;
  benefit: string;
  ctaText: string;
  accentColor: string;
}

type TriggerConfigMap = Record<TriggerType, Omit<TriggerConfig, 'accentColor'>>;

const KO_CONFIGS: TriggerConfigMap = {
  priper_result: { icon: '🔓', title: '패턴의 전체를 보세요', description: '지금 보신 건 빙산의 일각이에요. 숨겨진 패턴과 변화 가능성이 더 있습니다.', benefit: 'Premium에서는 AI가 당신의 관계 패턴을 심층 분석하고, 실제 변화를 위한 맞춤 인사이트를 매주 제공해요.', ctaText: 'Premium으로 전체 분석 보기' },
  onboarding_complete: { icon: '✨', title: '베일러와 함께 더 깊이 탐색하세요', description: 'V-File 완료를 축하해요. 이제 진짜 여정이 시작됩니다.', benefit: 'Premium에서는 AI 상담, 파트너 교차 분석, 관계 변화 타임라인을 무제한으로 이용할 수 있어요.', ctaText: 'Premium 시작하기' },
  partner_analysis: { icon: '💫', title: '우리의 패턴 — 전체 분석', description: '파트너와의 관계 역학을 표면적 유형 비교 너머로 분석해요.', benefit: 'Premium에서는 두 사람의 충돌 지점, 성장 방향, 관계 변화 가능성을 AI가 깊이 분석해 드려요.', ctaText: 'Premium으로 파트너 분석 보기' },
  codetalk_ai_limit: { icon: '🧠', title: 'AI 조언이 더 필요하신가요?', description: '무료 플랜에서는 AI 인사이트를 하루 3회까지 받을 수 있어요.', benefit: 'Pro 플랜에서는 무제한 AI 조언과 깊은 패턴 분석을 이용할 수 있어요.', ctaText: 'Pro로 업그레이드' },
  multi_persona_analysis: { icon: '🎭', title: '멀티페르소나 분석', description: '여러 페르소나 간의 충돌 패턴과 자원 배분을 시각화해요.', benefit: '각 페르소나의 시간축 변화, 억압 패턴, 역할 간 긴장 관계를 볼 수 있어요.', ctaText: 'Pro로 잠금 해제' },
  ikigai_design: { icon: '🌀', title: 'Ikigai 설계', description: '사랑, 재능, 소명, 천직의 교차점에서 삶의 방향을 설계해요.', benefit: 'AI가 당신의 패턴을 분석해 개인화된 Ikigai 인사이트를 제공해요.', ctaText: 'Pro로 설계 시작' },
  brand_identity: { icon: '💎', title: '브랜드 정체성 설계', description: '나만의 언어와 방향성으로 개인 브랜드를 구축해요.', benefit: 'AI가 당신의 Why, Ikigai를 기반으로 브랜드 전략을 설계해 줘요.', ctaText: 'Pro로 브랜드 설계' },
  monthly_report_detail: { icon: '📊', title: '상세 월간 리포트', description: '무료 플랜에서는 요약만 확인할 수 있어요.', benefit: '감정 흐름, 패턴 변화, 성장 추이를 상세하게 분석한 풀 리포트를 받아보세요.', ctaText: 'Pro로 전체 리포트 보기' },
  auto_translate: { icon: '🌐', title: '자동번역 기능', description: '콘텐츠를 하나만 입력하면 나머지 언어로 자동 번역해 드려요.', benefit: 'Pro 플랜에서 자동번역을 무제한으로 사용할 수 있어요. 번역 1건당 1 크레딧이 차감돼요.', ctaText: 'Pro로 자동번역 사용하기' },
};

const EN_CONFIGS: TriggerConfigMap = {
  priper_result: { icon: '🔓', title: 'See the full picture', description: "What you've seen is just the tip of the iceberg. There are hidden patterns and more possibilities for change.", benefit: 'With Premium, AI deeply analyzes your relationship patterns and delivers personalized insights every week.', ctaText: 'See full analysis with Premium' },
  onboarding_complete: { icon: '✨', title: 'Explore deeper with VEILOR', description: 'Congratulations on completing your V-File. Now the real journey begins.', benefit: 'With Premium, enjoy unlimited AI counseling, partner cross-analysis, and relationship change timelines.', ctaText: 'Start Premium' },
  partner_analysis: { icon: '💫', title: 'Our patterns — full analysis', description: 'Analyze relationship dynamics with your partner beyond surface-level type comparisons.', benefit: "With Premium, AI deeply analyzes both people's clash points, growth directions, and relationship change potential.", ctaText: 'See partner analysis with Premium' },
  codetalk_ai_limit: { icon: '🧠', title: 'Need more AI advice?', description: 'The free plan includes up to 3 AI insights per day.', benefit: 'With the Pro plan, enjoy unlimited AI advice and deep pattern analysis.', ctaText: 'Upgrade to Pro' },
  multi_persona_analysis: { icon: '🎭', title: 'Multi-persona analysis', description: 'Visualize collision patterns and resource allocation across multiple personas.', benefit: "See each persona's timeline changes, suppression patterns, and role tensions.", ctaText: 'Unlock with Pro' },
  ikigai_design: { icon: '🌀', title: 'Ikigai Design', description: 'Design your life direction at the intersection of love, talent, calling, and vocation.', benefit: 'AI analyzes your patterns to deliver personalized Ikigai insights.', ctaText: 'Start designing with Pro' },
  brand_identity: { icon: '💎', title: 'Brand identity design', description: 'Build your personal brand with your own language and direction.', benefit: 'AI designs your brand strategy based on your Why and Ikigai.', ctaText: 'Design your brand with Pro' },
  monthly_report_detail: { icon: '📊', title: 'Detailed monthly report', description: 'The free plan only shows a summary.', benefit: 'Receive a full report with detailed analysis of emotional flow, pattern changes, and growth trends.', ctaText: 'See full report with Pro' },
  auto_translate: { icon: '🌐', title: 'Auto-translation', description: 'Enter content in one language and it will be automatically translated into others.', benefit: 'With the Pro plan, use auto-translation unlimited. 1 credit per translation.', ctaText: 'Use auto-translate with Pro' },
};

const ACCENT_COLORS: Record<TriggerType, string> = {
  priper_result: C.amberGold,
  onboarding_complete: C.amber,
  partner_analysis: C.frost,
  codetalk_ai_limit: C.frost,
  multi_persona_analysis: C.amber,
  ikigai_design: C.amberGold,
  brand_identity: C.amberGold,
  monthly_report_detail: C.frost,
  auto_translate: C.frost,
};

const S = {
  ko: {
    features: ['무제한 AI 조언', '멀티페르소나', 'Ikigai 설계', '브랜드 전략', '상세 리포트'],
    errorRetry: '잠시 후 다시 시도해 주세요.',
    errorCheckout: '결제 페이지를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
    interestDoneTitle: '관심 등록 완료',
    interestDoneDesc: 'Premium 출시 시 가장 먼저 알려드릴게요.',
    processing: '처리 중...',
    notifyMe: '출시 알림 받기',
    dismiss: '나중에 할게요',
  },
  en: {
    features: ['Unlimited AI', 'Multi-persona', 'Ikigai Design', 'Brand Strategy', 'Full Reports'],
    errorRetry: 'Please try again in a moment.',
    errorCheckout: "Couldn't load the payment page. Please try again in a moment.",
    interestDoneTitle: 'Interest registered',
    interestDoneDesc: "We'll let you know first when Premium launches.",
    processing: 'Processing...',
    notifyMe: 'Notify me at launch',
    dismiss: 'Maybe later',
  },
};

const PRO_TIER = 'pro';
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRO_PRICE_ID ?? '';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger: TriggerType;
}

export default function UpgradeModal({ open, onClose, trigger }: UpgradeModalProps) {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;
  const configs = language === 'en' ? EN_CONFIGS : KO_CONFIGS;
  const configBase = configs[trigger];
  const config: TriggerConfig = { ...configBase, accentColor: ACCENT_COLORS[trigger] };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interestDone, setInterestDone] = useState(false);

  const isStripeReady = !!STRIPE_PRICE_ID;

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const logEvent = (action: string) => {
    if (!user) return;
    veilorDb.from('paywall_events').insert({
      user_id: user.id,
      trigger_type: trigger,
      action: action as 'shown' | 'dismissed' | 'interest_registered' | 'checkout_started' | 'converted',
    }).then(() => {});
  };

  const handleInterestRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await veilorDb.from('interest_registrations').insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        tier: 'premium',
        trigger_type: trigger,
      });
      logEvent('interest_registered');
      setInterestDone(true);
    } catch {
      setError(s.errorRetry);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    if (!isStripeReady) {
      await handleInterestRegister();
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: STRIPE_PRICE_ID, tier: PRO_TIER },
      });

      if (fnError) throw fnError;
      logEvent('checkout_started');

      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setError(s.errorCheckout);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    logEvent('dismissed');
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={handleDismiss}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 50, opacity: 1, transition: 'opacity .3s' }}
      />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: C.bg, borderRadius: '22px 22px 0 0',
        border: `1px solid ${C.border}`, borderBottom: 'none',
        zIndex: 51, maxHeight: '70vh',
        display: 'flex', flexDirection: 'column',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ width: 32, height: 3, borderRadius: 99, background: C.border, margin: '10px auto 0', flexShrink: 0 }} />

        <div style={{
          padding: '16px 20px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${C.border2}`, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{config.icon}</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 18, color: C.text }}>
              {config.title}
            </span>
          </div>
          <button
            onClick={handleDismiss}
            style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.text4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            x
          </button>
        </div>

        <div style={{ padding: '20px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.7 }}>{config.description}</p>

          <div style={{ background: `${config.accentColor}08`, border: `1px solid ${config.accentColor}33`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: config.accentColor, marginTop: 6, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{config.benefit}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {s.features.map((f) => (
              <span key={f} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, border: `1px solid ${C.amberGold}33`, color: C.amberGold, background: `${C.amberGold}08` }}>
                {f}
              </span>
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#E57373', textAlign: 'center' }}>{error}</p>
          )}

          {interestDone ? (
            <div style={{ background: `${C.amberGold}10`, border: `1px solid ${C.amberGold}33`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.amberGold, fontWeight: 500, marginBottom: 4 }}>{s.interestDoneTitle}</p>
              <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>{s.interestDoneDesc}</p>
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: loading ? `${C.amberGold}66` : `linear-gradient(135deg, ${C.amberGold}, ${C.amber})`,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: C.bg,
                cursor: loading ? 'default' : 'pointer', transition: 'opacity .2s',
              }}
            >
              {loading ? s.processing : isStripeReady ? config.ctaText : s.notifyMe}
            </button>
          )}

          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', fontSize: 12, color: C.text4, cursor: 'pointer', textAlign: 'center', padding: '4px 0' }}
          >
            {s.dismiss}
          </button>
        </div>
      </div>
    </>
  );
}
