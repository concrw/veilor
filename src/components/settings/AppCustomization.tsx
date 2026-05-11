// #66 유형별 앱 커스터마이징 + #72 푸시 알림/리텐션 + S024 언어 선택
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';
import { useT } from '@/i18n/useT';
import { useLanguageContext } from '@/context/LanguageContext';
import type { SupportedLanguage } from '@/i18n/types';

const AVAILABLE_LANGS: SupportedLanguage[] = ['ko', 'en'];

const THEME_PRESETS: Record<string, { accent: string; bg: string }> = {
  default: { accent: '#E0B48A', bg: '#0C0A09' },
  calm: { accent: '#6366f1', bg: '#0f0f23' },
  warm: { accent: '#f59e0b', bg: '#1a0f00' },
  nature: { accent: '#10b981', bg: '#0a1a0f' },
  ocean: { accent: '#3b82f6', bg: '#0a0f1a' },
};


export default function AppCustomization() {
  const { user, primaryMask } = useAuth();
  const t = useT();
  const s = t.appCustomization;
  const { language, setLanguage } = useLanguageContext();

  const [theme, setTheme] = useState('default');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [reminderDays, setReminderDays] = useState([1, 3, 5]);

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);
  const maskDisplayName = profile ? (language === 'en' ? profile.nameEn : profile.nameKo) : primaryMask;
  const recommendedTheme = profile?.category === 'predatory' ? 'calm' : 'warm';

  useEffect(() => {
    if (!user) return;
    veilorDb.from('user_profiles')
      .select('app_theme, push_enabled, reminder_time')
      .eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.app_theme) setTheme(data.app_theme);
        if (data?.push_enabled !== undefined) setPushEnabled(data.push_enabled);
        if (data?.reminder_time) setReminderTime(data.reminder_time);
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

  const selectLang = async (lang: SupportedLanguage) => {
    if (lang === language) return;
    setLanguage(lang);
    if (user) {
      await veilorDb.from('user_profiles').update({
        languages: [lang],
        updated_at: new Date().toISOString(),
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
              onClick={() => selectLang(lang)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs transition-all ${
                language === lang
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted text-muted-foreground'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                language === lang ? 'border-primary bg-primary' : 'border-muted'
              }`}>
                {language === lang && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
              {lang === 'ko' ? s.langKo : s.langEn}
            </button>
          ))}
        </div>
      </div>

      {/* 앱 테마 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">{s.themeTitle}</p>
        {profile && (
          <p className="text-xs text-muted-foreground">
            {s.recommendedFmt(maskDisplayName ?? profile.nameKo, s.themes[recommendedTheme] ?? recommendedTheme)}
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

    </div>
  );
}
