import { useState, useEffect } from 'react';
import { veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { C } from '@/lib/colors';
import { useT } from '@/i18n/useT';
import { isNativeApp } from '@/lib/platform';

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
  benefitNative?: string;
  ctaText: string;
  accentColor: string;
}

const TRIGGER_ICONS: Record<TriggerType, string> = {
  priper_result: '🔓',
  onboarding_complete: '✨',
  partner_analysis: '💫',
  codetalk_ai_limit: '🧠',
  multi_persona_analysis: '🎭',
  ikigai_design: '🌀',
  brand_identity: '💎',
  monthly_report_detail: '📊',
  auto_translate: '🌐',
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


const PRO_TIER = 'pro';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger: TriggerType;
}

export default function UpgradeModal({ open, onClose, trigger }: UpgradeModalProps) {
  const { user } = useAuth();
  const t = useT();
  const s = t.upgradeModal;
  const triggerStrings = t.upgrade.triggers[trigger];
  const nativeApp = isNativeApp();
  const resolvedBenefit = nativeApp && triggerStrings.benefitNative ? triggerStrings.benefitNative : triggerStrings.benefit;
  const config: TriggerConfig = {
    icon: TRIGGER_ICONS[trigger],
    title: triggerStrings.title,
    description: triggerStrings.description,
    benefit: resolvedBenefit,
    ctaText: triggerStrings.ctaText,
    accentColor: ACCENT_COLORS[trigger],
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interestDone, setInterestDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !user) return;
    // AI 관심 클릭 기록 (앱에서만)
    if (nativeApp) {
      veilorDb.from('ai_interest_clicks' as never).insert({
        user_id: user.id,
        feature: trigger,
      } as never).then(() => {});
    }
  }, [open, user, trigger, nativeApp]);

  const logEvent = (action: string) => {
    if (!user) return;
    veilorDb.from('paywall_events').insert({
      user_id: user.id,
      trigger_type: trigger,
      action: action as 'shown' | 'dismissed' | 'interest_registered' | 'converted',
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
    await handleInterestRegister();
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
            aria-label={t.common.close}
            style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.text4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
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

          {nativeApp ? (
            // 앱스토어 정책 준수: 결제 링크/CTA 버튼 없음, 안내 텍스트만
            <div style={{ background: `${C.surface}`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{s.appNotice}</p>
            </div>
          ) : interestDone ? (
            <div style={{ background: `${C.amberGold}10`, border: `1px solid ${C.amberGold}33`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.amberGold, fontWeight: 500, marginBottom: 4 }}>{s.interestDoneTitle}</p>
              <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>{s.interestDoneDesc}</p>
            </div>
          ) : (
            <div style={{ background: `${C.surface}`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{s.webOnlyNotice}</p>
            </div>
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
