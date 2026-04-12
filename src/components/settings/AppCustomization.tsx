// #66 유형별 앱 커스터마이징 + #72 푸시 알림/리텐션
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { veilorDb } from '@/integrations/supabase/client';
import { MASK_PROFILES } from '@/lib/vfileAlgorithm';

const THEME_PRESETS: Record<string, { name: string; accent: string; bg: string }> = {
  default: { name: '기본', accent: '#D4A574', bg: '#0C0A09' },
  calm: { name: '차분한', accent: '#6366f1', bg: '#0f0f23' },
  warm: { name: '따뜻한', accent: '#f59e0b', bg: '#1a0f00' },
  nature: { name: '자연', accent: '#10b981', bg: '#0a1a0f' },
  ocean: { name: '바다', accent: '#3b82f6', bg: '#0a0f1a' },
};

export default function AppCustomization() {
  const { user, primaryMask } = useAuth();
  const [theme, setTheme] = useState('default');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('21:00');
  const [reminderDays, setReminderDays] = useState([1, 3, 5]); // 월수금

  const profile = MASK_PROFILES.find(m => m.nameKo === primaryMask || m.mskCode === primaryMask);

  // 유형별 추천 테마
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

  return (
    <div className="space-y-4">
      {/* #66 유형별 앱 커스터마이징 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-xs text-muted-foreground">앱 테마</p>
        {profile && (
          <p className="text-xs text-muted-foreground">
            "{profile.nameKo}" 유형에 추천: <span className="text-primary font-medium">{THEME_PRESETS[recommendedTheme].name}</span>
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
              <p className="text-[10px]">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* #72 푸시 알림/리텐션 */}
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">리마인더 설정</p>
          <button onClick={togglePush}
            className={`w-10 h-5 rounded-full transition-colors ${pushEnabled ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${pushEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {pushEnabled && (
          <>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">알림 시간</p>
              <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                className="bg-background border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">알림 요일</p>
              <div className="flex gap-1">
                {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
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
              선택한 요일 {reminderTime}에 "오늘의 감정은 어떤가요?" 알림을 보내드려요
            </p>
          </>
        )}
      </div>
    </div>
  );
}
