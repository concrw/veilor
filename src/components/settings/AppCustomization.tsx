// #66 유형별 앱 커스터마이징 + #72 푸시 알림/리텐션 + S024 언어 다중선택
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import { useLanguageContext } from '@/context/LanguageContext';
import { useVeilorSubscription } from '@/hooks/useVeilorSubscription';
import UpgradeModal from '@/components/premium/UpgradeModal';

const AVAILABLE_LANGS = ['ko', 'en'] as const;
const MAX_LANGS = 2;

const S = {
  ko: {
    themeTitle: '앱 테마',
    recommendedFmt: (name: string, theme: string) => `"${name}" 유형에 추천: ${theme}`,
    reminderTitle: '리마인더 설정',
    reminderTime: '알림 시간',
    reminderDays: '알림 요일',
    reminderDesc: (time: string) => `선택한 요일 ${time}에 "오늘의 감정은 어떤가요?" 알림을 보내드려요`,
    themes: {
      default: '기본',
      calm: '차분한',
      warm: '따뜻한',
      nature: '자연',
      ocean: '바다',
    } as Record<string, string>,
    days: ['월', '화', '수', '목', '금', '토', '일'],
    langTitle: '언어 설정',
    langKo: '한국어',
    langEn: 'English',
    autoTranslateLabel: '자동번역',
    autoTranslateOff: '직접 언어별로 입력',
    autoTranslateOn: '자동번역 사용 중 (크레딧 차감)',
    creditsBalance: (n: number) => `크레딧 잔액: ${n}`,
    proOnly: 'Pro 전용',
  },
  en: {
    themeTitle: 'App Theme',
    recommendedFmt: (name: string, theme: string) => `Recommended for "${name}": ${theme}`,
    reminderTitle: 'Reminder Settings',
    reminderTime: 'Notification time',
    reminderDays: 'Notification days',
    reminderDesc: (time: string) => `We'll send "How are you feeling today?" at ${time} on selected days`,
    themes: {
      default: 'Default',
      calm: 'Calm',
      warm: 'Warm',
      nature: 'Nature',
      ocean: 'Ocean',
    } as Record<string, string>,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    langTitle: 'Language Settings',
    langKo: '한국어',
    langEn: 'English',
    autoTranslateLabel: 'Auto-translate',
    autoTranslateOff: 'Enter each language manually',
    autoTranslateOn: 'Auto-translate enabled (credits deducted)',
    creditsBalance: (n: number) => `Credits: ${n}`,
    proOnly: 'Pro only',
  },
};

const THEME_PRESETS: Record<string, { accent: string; bg: string }> = {
  default: { accent: '#D4A574', bg: '#0C0A09' },
  calm: { accent: '#6366f1', bg: '#0f0f23' },
  warm: { accent: '#f59e0b', bg: '#1a0f00' },
  nature: { accent: '#10b981', bg: '#0a1a0f' },
  ocean: { accent: '#3b82f6', bg: '#0a0f1a' },
};

const LANG_LABELS: Record<string, { ko: string; en: string }> = {
  ko: { ko: '한국어', en: '한국어' },
  en: { ko: 'English', en: 'English' },
};

export default function AppCustomization() {
  const { user, primaryMask } = useAuth();
  const { language } = useLanguageContext();
  const { isPro } = useVeilorSubscription();
  const s = S[language] ?? S.ko;

  const [theme, setTheme] = useState('default');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [reminderDays, setReminderDays] = useState([1, 3, 5]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['ko']);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  const recommendedTheme = profile?.category === 'predatory' ? 'calm' : 'warm';
  const showAutoTranslate = selectedLangs.length >= 2;

  useEffect(() => {
    if (!user) return;
    veilorDb.from('user_profiles')
      .select('app_theme, push_enabled, reminder_time, languages, auto_translate')
      .eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.app_theme) setTheme(data.app_theme);
        if (data?.push_enabled !== undefined) setPushEnabled(data.push_enabled);
        if (data?.reminder_time) setReminderTime(data.reminder_time);
        if (Array.isArray(data?.languages) && data.languages.length > 0) setSelectedLangs(data.languages);
        if (data?.auto_translate !== undefined && data.auto_translate !== null) setAutoTranslate(data.auto_translate);
      });
    veilorDb.from('user_credits')
      .select('balance')
      .eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.balance !== undefined) setCreditBalance(data.balance);
      });
  }, [user]);

  const saveTheme = async (newTheme: string) => {
    setTheme(newTheme);
    if (user) {
      await veilorDb.from('user_profiles').update({
        app_theme: newTheme, updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    }
  };

  const togglePush = async () => {
    const next = !pushEnabled;
    setPushEnabled(next);
    if (user) {
      await veilorDb.from('user_profiles').update({
        push_enabled: next, updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    }
  };

  const toggleLang = async (lang: string) => {
    let next: string[];
    if (selectedLangs.includes(lang)) {
      if (selectedLangs.length <= 1) return;
      next = selectedLangs.filter(l => l !== lang);
    } else {
      if (selectedLangs.length >= MAX_LANGS) return;
      next = [...selectedLangs, lang];
    }
    setSelectedLangs(next);
    // 언어가 1개로 줄면 자동번역 강제 off
    const nextAutoTranslate = next.length >= 2 ? autoTranslate : false;
    if (nextAutoTranslate !== autoTranslate) setAutoTranslate(nextAutoTranslate);
    if (user) {
      await veilorDb.from('user_profiles').update({
        languages: next,
        auto_translate: nextAutoTranslate,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    }
  };

  const toggleAutoTranslate = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    const next = !autoTranslate;
    setAutoTranslate(next);
    if (user) {
      await veilorDb.from('user_profiles').update({
        auto_translate: next, updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* 언어 설정 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">{s.langTitle}</p>
        <div className="flex gap-2">
          {AVAILABLE_LANGS.map(lang => (
            <button
              key={lang}
              onClick={() => toggleLang(lang)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs transition-all ${
                selectedLangs.includes(lang)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted text-muted-foreground'
              }`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                selectedLangs.includes(lang) ? 'border-primary bg-primary text-white' : 'border-muted'
              }`}>
                {selectedLangs.includes(lang) ? '✓' : ''}
              </span>
              {LANG_LABELS[lang][language === 'en' ? 'en' : 'ko']}
            </button>
          ))}
        </div>

        {showAutoTranslate && (
          <div className="pt-2 border-t border-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{s.autoTranslateLabel}</p>
                {!isPro && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {s.proOnly}
                  </span>
                )}
              </div>
              <button
                onClick={toggleAutoTranslate}
                className={`w-10 h-5 rounded-full transition-colors relative ${autoTranslate && isPro ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform absolute top-0.5 ${autoTranslate && isPro ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {autoTranslate && isPro ? s.autoTranslateOn : s.autoTranslateOff}
            </p>
            {autoTranslate && isPro && creditBalance !== null && (
              <p className="text-[10px] text-primary">{s.creditsBalance(creditBalance)}</p>
            )}
          </div>
        )}
      </div>

      {/* 앱 테마 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">{s.themeTitle}</p>
        {profile && (
          <p className="text-xs text-muted-foreground">
            {s.recommendedFmt(profile.nameKo, s.themes[recommendedTheme] ?? recommendedTheme)}
          </p>
        )}
        <div className="flex gap-2">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button key={key} onClick={() => saveTheme(key)}
              className={`flex-1 rounded-xl p-2.5 text-center transition-all ${
                theme === key ? 'ring-2 ring-primary' : 'border border-transparent'
              }`}
              style={{ backgroundColor: preset.bg + '80' }}>
              <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ backgroundColor: preset.accent }} />
              <p className="text-[10px]">{s.themes[key] ?? key}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 리마인더 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{s.reminderTitle}</p>
          <button onClick={togglePush}
            className={`w-10 h-5 rounded-full transition-colors ${pushEnabled ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${pushEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {pushEnabled && (
          <>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">{s.reminderTime}</p>
              <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                className="bg-background border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">{s.reminderDays}</p>
              <div className="flex gap-1">
                {s.days.map((day, i) => (
                  <button key={i} onClick={() => setReminderDays(d =>
                    d.includes(i) ? d.filter(x => x !== i) : [...d, i]
                  )}
                    className={`w-8 h-8 rounded-full text-[10px] transition-colors ${
                      reminderDays.includes(i) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {s.reminderDesc(reminderTime)}
            </p>
          </>
        )}
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="auto_translate"
      />
    </div>
  );
}
