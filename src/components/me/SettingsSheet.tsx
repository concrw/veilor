import { useState, useEffect } from 'react';
import { C } from '@/lib/colors';
import { supabase, veilorDb } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import type { SupportedLanguage } from '@/i18n/types';
import ZoneToggle from './ZoneToggle';
import AppCustomization from '@/components/settings/AppCustomization';
import { useMode, type UXMode, DOMAIN_MODES } from '@/context/ModeContext';
import { useDomain, type Domain } from '@/context/DomainContext';

export interface AiSettings {
  name: string;
  tone: 'friend' | 'warm' | 'calm' | 'expert';
  personality: 'empathetic' | 'direct' | 'curious' | 'playful';
  frequency: 'low' | 'normal' | 'high';
}

const TONE_OPTIONS: { value: AiSettings['tone']; label: string; labelEn: string; desc: string; descEn: string }[] = [
  { value: 'friend', label: '친구', labelEn: 'Casual', desc: '편하게 반말로', descEn: 'Relaxed, informal tone' },
  { value: 'warm', label: '따뜻한', labelEn: 'Warm', desc: '부드럽고 수용적으로', descEn: 'Gentle and accepting' },
  { value: 'calm', label: '차분한', labelEn: 'Calm', desc: '침착하고 안정적으로', descEn: 'Composed and steady' },
  { value: 'expert', label: '전문가', labelEn: 'Expert', desc: '분석적이고 명확하게', descEn: 'Analytical and precise' },
];

const PERSONALITY_OPTIONS: { value: AiSettings['personality']; label: string; labelEn: string }[] = [
  { value: 'empathetic', label: '공감형', labelEn: 'Empathetic' },
  { value: 'direct', label: '직설형', labelEn: 'Direct' },
  { value: 'curious', label: '탐구형', labelEn: 'Curious' },
  { value: 'playful', label: '유쾌형', labelEn: 'Playful' },
];

const FREQ_OPTIONS: { value: AiSettings['frequency']; label: string; labelEn: string }[] = [
  { value: 'low', label: '가끔', labelEn: 'Rarely' },
  { value: 'normal', label: '보통', labelEn: 'Normal' },
  { value: 'high', label: '자주', labelEn: 'Often' },
];

const DEFAULT_AI_SETTINGS: AiSettings = { name: '엠버', tone: 'warm', personality: 'empathetic', frequency: 'normal' };

const LANG_OPTIONS: { value: SupportedLanguage; label: string; code: string }[] = [
  { value: 'ko', label: '한국어', code: 'KO' },
  { value: 'en', label: 'English', code: 'EN' },
];

// 언어별 설정 시트 텍스트
const S = {
  ko: {
    title: '설정',
    close: '닫기',
    sectionLang: '언어',
    langLabel: '언어 설정',
    langSub: '앱 전체 언어를 변경해요',
    sectionAi: 'AI 캐릭터',
    renameLabel: '이름 변경',
    aiPersonalityLabel: 'AI 성격 설정',
    toneLabel: '어투',
    personalityLabel: '성격',
    freqLabel: '말 거는 빈도',
    sectionNotif: '알림',
    amberNotif: 'Amber 알림',
    amberNotifSub: '패시브 모드 푸시 알림',
    reportNotif: '주간 리포트 알림',
    reportNotifSub: '매주 월요일 오전',
    sectionDomain: '도메인',
    domainSelf: '나', domainSelfSub: '나의 퍼포먼스',
    domainWork: '업무', domainWorkSub: '업무 퍼포먼스',
    domainRelation: '관계', domainRelationSub: '관계 퍼포먼스',
    domainSocial: '사회', domainSocialSub: '사회관리 퍼포먼스',
    domainActive: '✓ 선택됨',
    sectionMode: 'UX 모드',
    modeOriginal: '오리지널', modeOriginalSub: '감성적 · 대화 중심',
    modeClear: '클리어', modeClearSub: '구조적 · 멘탈 대시보드',
    modeRoutine: '루틴', modeRoutineSub: '습관 · 스트릭 · 30초 체크인',
    modeFocus: '포커스', modeFocusSub: '딥워크 · 타이머 · 워크리스트',
    modeSprint: '스프린트', modeSprintSub: 'TBQC · 주간 성과 · 메타인지',
    modeConnect: '커넥트', modeConnectSub: '관계 온도 · 연결',
    modeMirror: '미러', modeMirrorSub: '패턴 인식 · 인사이트',
    modeSocial: '소셜', modeSocialSub: '관심 영역 · 임팩트 · 기여',
    modeActive: '✓ 사용 중',
    sectionApp: '앱 설정',
    sectionSubscription: '구독',
    subscriptionLabel: '구독 관리',
    subscriptionRenewal: '갱신일 2026년 4월 20일',
    sectionPrivacy: '개인정보 & 계정',
    dataPrivacy: '데이터 및 개인정보',
    accountSettings: '계정 설정',
    logout: '로그아웃',
    sectionDanger: '위험 구역',
    deleteAccount: '계정 삭제',
    deleteAccountSub: '모든 데이터가 영구적으로 삭제됩니다',
    deleteConfirmTitle: '정말 계정을 삭제하시겠어요?',
    deleteConfirmDesc: '모든 대화, 분석 결과, 시그널이 영구 삭제되며 복구할 수 없습니다.',
    deleteCancel: '취소',
    deleteConfirmBtn: '영구 삭제',
    deleting: '삭제 중...',
    amberSub: '비서 · F모드',
    frostSub: '닥터 · T모드',
  },
  en: {
    title: 'Settings',
    close: 'Close',
    sectionLang: 'Language',
    langLabel: 'Language',
    langSub: 'Change the app language',
    sectionAi: 'AI Characters',
    renameLabel: 'Rename',
    aiPersonalityLabel: 'AI Personality',
    toneLabel: 'Tone',
    personalityLabel: 'Personality',
    freqLabel: 'Conversation frequency',
    sectionNotif: 'Notifications',
    amberNotif: 'Amber alerts',
    amberNotifSub: 'Push notifications in passive mode',
    reportNotif: 'Weekly report',
    reportNotifSub: 'Every Monday morning',
    sectionDomain: 'Domain',
    domainSelf: 'Self', domainSelfSub: 'My Performance',
    domainWork: 'Work', domainWorkSub: 'Work Performance',
    domainRelation: 'Relation', domainRelationSub: 'Relationship Performance',
    domainSocial: 'Social', domainSocialSub: 'Social Performance',
    domainActive: '✓ Selected',
    sectionMode: 'UX Mode',
    modeOriginal: 'Original', modeOriginalSub: 'Emotional · Conversation-first',
    modeClear: 'Clear', modeClearSub: 'Structured · Mental dashboard',
    modeRoutine: 'Routine', modeRoutineSub: 'Habits · Streaks · 30-sec check-in',
    modeFocus: 'Focus', modeFocusSub: 'Deep work · Timer · Worklist',
    modeSprint: 'Sprint', modeSprintSub: 'TBQC · Weekly performance · Metacognition',
    modeConnect: 'Connect', modeConnectSub: 'Relationship temperature · Connection',
    modeMirror: 'Mirror', modeMirrorSub: 'Pattern recognition · Insights',
    modeSocial: 'Social', modeSocialSub: 'Interest areas · Impact · Contribution',
    modeActive: '✓ Active',
    sectionApp: 'App Settings',
    sectionSubscription: 'Subscription',
    subscriptionLabel: 'Manage subscription',
    subscriptionRenewal: 'Renews April 20, 2026',
    sectionPrivacy: 'Privacy & Account',
    dataPrivacy: 'Data & Privacy',
    accountSettings: 'Account settings',
    logout: 'Log out',
    sectionDanger: 'Danger zone',
    deleteAccount: 'Delete account',
    deleteAccountSub: 'All data will be permanently deleted',
    deleteConfirmTitle: 'Are you sure you want to delete your account?',
    deleteConfirmDesc: 'All conversations, analysis results, and signals will be permanently deleted and cannot be recovered.',
    deleteCancel: 'Cancel',
    deleteConfirmBtn: 'Delete permanently',
    deleting: 'Deleting...',
    amberSub: 'Assistant · F mode',
    frostSub: 'Doctor · T mode',
  },
};

function SettingsSheet({
  open, onClose, amberName, frostName,
  onRenameAmber, onRenameFrost,
  aiSettings: externalAiSettings, onAiSettingsChange,
}: {
  open: boolean; onClose: () => void;
  amberName: string; frostName: string;
  onRenameAmber: () => void; onRenameFrost: () => void;
  aiSettings?: AiSettings; onAiSettingsChange?: (s: AiSettings) => void;
}) {
  const { user, signOut } = useAuth();
  const { mode, setMode } = useMode();
  const { domain, setDomain } = useDomain();
  const { language, setLanguage } = useLanguageContext();

  const s = S[language] ?? S.ko;

  const [notifAmber, setNotifAmber] = useState(true);
  const [notifReport, setNotifReport] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings>(externalAiSettings ?? DEFAULT_AI_SETTINGS);
  const [aiCustomOpen, setAiCustomOpen] = useState(false);

  // 알림 + AI 설정 DB 로드
  useEffect(() => {
    if (!user) return;
    veilorDb.from('user_profiles').select('notification_amber, notification_report, ai_settings').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          if (data.notification_amber !== undefined) setNotifAmber(data.notification_amber);
          if (data.notification_report !== undefined) setNotifReport(data.notification_report);
          if (data.ai_settings) setAiSettings({ ...DEFAULT_AI_SETTINGS, ...data.ai_settings });
        }
      });
  }, [user]);

  const updateAiSetting = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) => {
    const next = { ...aiSettings, [key]: value };
    setAiSettings(next);
    onAiSettingsChange?.(next);
    if (user) {
      veilorDb.from('user_profiles').update({ ai_settings: next, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    }
  };

  const toggleNotif = async (key: 'notification_amber' | 'notification_report', setter: (v: boolean) => void) => {
    setter((prev: boolean) => {
      const next = !prev;
      if (user) {
        veilorDb.from('user_profiles').update({ [key]: next, updated_at: new Date().toISOString() }).eq('user_id', user.id);
      }
      return next;
    });
  };
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user || !deleteConfirm) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user-data', {
        body: { userId: user.id },
      });
      if (error) throw error;
      await signOut();
    } catch {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const ALL_UX_MODES: Record<UXMode, { label: string; sub: string; color: string }> = {
    original: { label: s.modeOriginal, sub: s.modeOriginalSub, color: C.amberGold },
    clear:    { label: s.modeClear,    sub: s.modeClearSub,    color: '#4AAEFF'   },
    routine:  { label: s.modeRoutine,  sub: s.modeRoutineSub,  color: '#F5C98A'   },
    focus:    { label: s.modeFocus,    sub: s.modeFocusSub,    color: '#38bdf8'   },
    sprint:   { label: s.modeSprint,   sub: s.modeSprintSub,   color: '#60a5fa'   },
    connect:  { label: s.modeConnect,  sub: s.modeConnectSub,  color: '#fb7185'   },
    mirror:   { label: s.modeMirror,   sub: s.modeMirrorSub,   color: '#f43f5e'   },
    social:   { label: s.modeSocial,   sub: s.modeSocialSub,   color: '#7fb89a'   },
  };
  const UX_MODES = DOMAIN_MODES[domain].map(id => ({ id, ...ALL_UX_MODES[id] }));

  const DOMAINS: { id: Domain; label: string; sub: string; color: string }[] = [
    { id: 'self',     label: s.domainSelf,     sub: s.domainSelfSub,     color: C.amberGold },
    { id: 'work',     label: s.domainWork,     sub: s.domainWorkSub,     color: '#38bdf8'   },
    { id: 'relation', label: s.domainRelation, sub: s.domainRelationSub, color: '#fb7185'   },
    { id: 'social',   label: s.domainSocial,   sub: s.domainSocialSub,   color: '#7fb89a'   },
  ];

  const sectionStyle: React.CSSProperties = { fontSize: 9, fontWeight: 400, letterSpacing: '.09em', textTransform: 'uppercase', color: C.text5, padding: '8px 0 4px' };
  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, cursor: 'pointer' };
  const iconBox: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 40, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none', transition: 'opacity .3s' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: C.bg,
        borderRadius: '22px 22px 0 0', border: `1px solid #44403C`, borderBottom: 'none',
        zIndex: 41, display: 'flex', flexDirection: 'column', maxHeight: '85%',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ width: 32, height: 3, borderRadius: 99, background: C.border, margin: '10px auto 0', flexShrink: 0 }} />
        <div style={{ padding: '12px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border2}`, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 18, color: C.text }}>{s.title}</span>
          <button aria-label={s.close} onClick={onClose} style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.text4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* ── 언어 ─────────────────────────────────── */}
          <p style={sectionStyle}>{s.sectionLang}</p>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden' }}>
            {LANG_OPTIONS.map((opt, i) => (
              <div key={opt.value}
                onClick={() => setLanguage(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderBottom: i < LANG_OPTIONS.length - 1 ? `1px solid ${C.border2}` : 'none',
                  cursor: 'pointer',
                  background: language === opt.value ? `${C.amberGold}08` : 'transparent',
                  transition: 'background .15s',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.06em', color: language === opt.value ? C.amberGold : C.text4, fontFamily: "'DM Sans', sans-serif", width: 22 }}>{opt.code}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, flex: 1 }}>{opt.label}</span>
                {language === opt.value && (
                  <span style={{ fontSize: 13, color: C.amberGold, fontWeight: 600 }}>✓</span>
                )}
              </div>
            ))}
          </div>

          {/* ── AI 캐릭터 ─────────────────────────────── */}
          <p style={sectionStyle}>{s.sectionAi}</p>
          {[
            { name: amberName, sub: s.amberSub, color: C.amber, onClick: onRenameAmber },
            { name: frostName, sub: s.frostSub, color: C.frost, onClick: onRenameFrost },
          ].map((ai, i) => (
            <div key={i} onClick={ai.onClick} style={rowStyle}>
              <div style={{ ...iconBox, background: `${ai.color}15`, border: `1px solid ${ai.color}33` }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: ai.color, display: 'block' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, marginBottom: 1 }}>{ai.name}</p>
                <p style={{ fontSize: 10, color: C.text4 }}>{ai.sub}</p>
              </div>
              <span style={{ fontSize: 11, color: C.text3 }}>{s.renameLabel}</span>
              <span style={{ fontSize: 11, color: C.text5 }}>›</span>
            </div>
          ))}

          {/* AI 커스터마이징 */}
          <div onClick={() => setAiCustomOpen(v => !v)} style={rowStyle}>
            <div style={{ ...iconBox, fontSize: 14 }}>🎛️</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, marginBottom: 1 }}>{s.aiPersonalityLabel}</p>
              <p style={{ fontSize: 10, color: C.text4 }}>
                {language === 'en'
                  ? `${TONE_OPTIONS.find(t => t.value === aiSettings.tone)?.labelEn} · ${PERSONALITY_OPTIONS.find(p => p.value === aiSettings.personality)?.labelEn}`
                  : `${TONE_OPTIONS.find(t => t.value === aiSettings.tone)?.label} · ${PERSONALITY_OPTIONS.find(p => p.value === aiSettings.personality)?.label}`
                }
              </p>
            </div>
            <span style={{ fontSize: 11, color: C.text5, transform: aiCustomOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>›</span>
          </div>
          {aiCustomOpen && (
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 11, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 10, color: C.text4, marginBottom: 6 }}>{s.toneLabel}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TONE_OPTIONS.map(t => (
                    <button key={t.value} onClick={() => updateAiSetting('tone', t.value)}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: aiSettings.tone === t.value ? `1px solid ${C.amberGold}` : `1px solid ${C.border}`, background: aiSettings.tone === t.value ? `${C.amberGold}15` : 'transparent', color: aiSettings.tone === t.value ? C.amberGold : C.text3 }}>
                      {language === 'en' ? t.labelEn : t.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 9, color: C.text5, marginTop: 4 }}>
                  {language === 'en'
                    ? TONE_OPTIONS.find(t => t.value === aiSettings.tone)?.descEn
                    : TONE_OPTIONS.find(t => t.value === aiSettings.tone)?.desc
                  }
                </p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: C.text4, marginBottom: 6 }}>{s.personalityLabel}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PERSONALITY_OPTIONS.map(p => (
                    <button key={p.value} onClick={() => updateAiSetting('personality', p.value)}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: aiSettings.personality === p.value ? `1px solid ${C.amberGold}` : `1px solid ${C.border}`, background: aiSettings.personality === p.value ? `${C.amberGold}15` : 'transparent', color: aiSettings.personality === p.value ? C.amberGold : C.text3 }}>
                      {language === 'en' ? p.labelEn : p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, color: C.text4, marginBottom: 6 }}>{s.freqLabel}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {FREQ_OPTIONS.map(f => (
                    <button key={f.value} onClick={() => updateAiSetting('frequency', f.value)}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', flex: 1, border: aiSettings.frequency === f.value ? `1px solid ${C.amberGold}` : `1px solid ${C.border}`, background: aiSettings.frequency === f.value ? `${C.amberGold}15` : 'transparent', color: aiSettings.frequency === f.value ? C.amberGold : C.text3 }}>
                      {language === 'en' ? f.labelEn : f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── 알림 ─────────────────────────────────── */}
          <p style={sectionStyle}>{s.sectionNotif}</p>
          {[
            { label: s.amberNotif, sub: s.amberNotifSub, on: notifAmber, key: 'notification_amber' as const, setter: setNotifAmber },
            { label: s.reportNotif, sub: s.reportNotifSub, on: notifReport, key: 'notification_report' as const, setter: setNotifReport },
          ].map((row, i) => (
            <div key={i} style={{ ...rowStyle, cursor: 'default' }}>
              <div style={{ ...iconBox, fontSize: 14 }}>🔔</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, marginBottom: 1 }}>{row.label}</p>
                <p style={{ fontSize: 10, color: C.text4 }}>{row.sub}</p>
              </div>
              <ZoneToggle on={row.on} onToggle={() => toggleNotif(row.key, row.setter)} />
            </div>
          ))}

          {/* ── 도메인 ────────────────────────────────── */}
          <p style={sectionStyle}>{s.sectionDomain}</p>
          {DOMAINS.map((d) => (
            <div key={d.id} onClick={() => {
              setDomain(d.id);
              // 현재 모드가 새 도메인에서 허용되지 않으면 첫 번째 모드로 리셋
              if (!DOMAIN_MODES[d.id].includes(mode)) {
                setMode(DOMAIN_MODES[d.id][0]);
              }
            }}
              style={{ ...rowStyle, background: domain === d.id ? `${d.color}08` : C.bg2, border: `1px solid ${domain === d.id ? `${d.color}55` : C.border}`, transition: 'border-color .2s, background .2s' }}>
              <div style={{ ...iconBox, background: `${d.color}15` }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: d.color, display: 'block' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, marginBottom: 1 }}>{d.label}</p>
                <p style={{ fontSize: 10, color: C.text4 }}>{d.sub}</p>
              </div>
              {domain === d.id && <span style={{ fontSize: 11, color: d.color }}>{s.domainActive}</span>}
            </div>
          ))}

          {/* ── UX 모드 ───────────────────────────────── */}
          <p style={sectionStyle}>{s.sectionMode}</p>
          {UX_MODES.map((m) => (
            <div key={m.id} onClick={() => { setMode(m.id); onClose(); }}
              style={{ ...rowStyle, background: mode === m.id ? `${m.color}08` : C.bg2, border: `1px solid ${mode === m.id ? `${m.color}55` : C.border}`, transition: 'border-color .2s, background .2s' }}>
              <div style={{ ...iconBox, background: `${m.color}15` }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: m.color, display: 'block' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, marginBottom: 1 }}>{m.label}</p>
                <p style={{ fontSize: 10, color: C.text4 }}>{m.sub}</p>
              </div>
              {mode === m.id && <span style={{ fontSize: 11, color: m.color }}>{s.modeActive}</span>}
            </div>
          ))}

          {/* ── 앱 설정 ───────────────────────────────── */}
          <p style={sectionStyle}>{s.sectionApp}</p>
          <AppCustomization />

          {/* ── 구독 ─────────────────────────────────── */}
          <p style={sectionStyle}>{s.sectionSubscription}</p>
          <div style={rowStyle}>
            <div style={{ ...iconBox, fontSize: 14 }}>⭐</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, marginBottom: 1 }}>{s.subscriptionLabel}</p>
              <p style={{ fontSize: 10, color: C.text4 }}>{s.subscriptionRenewal}</p>
            </div>
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, border: `1px solid ${C.amberGold}44`, color: C.amberGold, background: `${C.amberGold}08` }}>Pro</span>
            <span style={{ fontSize: 11, color: C.text5 }}>›</span>
          </div>

          {/* ── 개인정보 & 계정 ──────────────────────── */}
          <p style={sectionStyle}>{s.sectionPrivacy}</p>
          {[s.dataPrivacy, s.accountSettings].map((label, i) => (
            <div key={i} style={rowStyle}>
              <div style={{ ...iconBox, fontSize: 14 }}>🔒</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.text, marginBottom: 1 }}>{label}</p>
              </div>
              <span style={{ fontSize: 11, color: C.text5 }}>›</span>
            </div>
          ))}
          <div onClick={signOut} style={{ ...rowStyle, border: `1px solid #C0807033` }}>
            <div style={{ ...iconBox }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 11l3-3-3-3M13 8H6M6 3H3.5A1.5 1.5 0 0 0 2 4.5v7A1.5 1.5 0 0 0 3.5 13H6" stroke="#C08070" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: '#C08070' }}>{s.logout}</p>
          </div>

          {/* ── 위험 구역 ─────────────────────────────── */}
          <p style={{ ...sectionStyle, paddingTop: 12 }}>{s.sectionDanger}</p>
          {!deleteConfirm ? (
            <div onClick={() => setDeleteConfirm(true)} style={{ ...rowStyle, border: '1px solid #DC262633' }}>
              <div style={{ ...iconBox, background: '#DC26260A', fontSize: 14 }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: '#DC2626' }}>{s.deleteAccount}</p>
                <p style={{ fontSize: 10, color: C.text4 }}>{s.deleteAccountSub}</p>
              </div>
            </div>
          ) : (
            <div style={{ background: '#DC26260A', border: '1px solid #DC262644', borderRadius: 11, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 500 }}>{s.deleteConfirmTitle}</p>
              <p style={{ fontSize: 10, color: C.text4, lineHeight: 1.5 }}>{s.deleteConfirmDesc}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setDeleteConfirm(false)} disabled={deleting}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text3, fontSize: 12, cursor: 'pointer' }}>
                  {s.deleteCancel}
                </button>
                <button onClick={handleDeleteAccount} disabled={deleting}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontSize: 12, cursor: 'pointer', opacity: deleting ? 0.5 : 1 }}>
                  {deleting ? s.deleting : s.deleteConfirmBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SettingsSheet;
