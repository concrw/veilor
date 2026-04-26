import { useState } from 'react';
import { AmberBtn, FrostBtn } from '@/layouts/HomeLayout';
import { useAmberAttention } from '@/hooks/useAmberAttention';
import { useAuth } from '@/context/AuthContext';
import { useUserMeData } from '@/hooks/useUserMeData';
import { usePremiumTrigger } from '@/hooks/usePremiumTrigger';
import { useMePageState } from '@/hooks/useMePageState';
import UpgradeModal from '@/components/premium/UpgradeModal';
import { C } from '@/lib/colors';
import { useMode } from '@/context/ModeContext';
import AISheet from '@/components/me/AISheet';
import SettingsSheet from '@/components/me/SettingsSheet';
import RenameSheet from '@/components/me/RenameSheet';
import PeopleSection from '@/components/me/PeopleSection';
import ClearMeView from '@/components/me/ClearMeView';
import GrowthTab from '@/components/me/GrowthTab';
import ZoneTab from '@/components/me/ZoneTab';

type Tab = 'growth' | 'people' | 'zone';
const TABS: { id: Tab; label: string }[] = [
  { id: 'growth', label: '나의 성장' },
  { id: 'people', label: '내 사람들' },
  { id: 'zone', label: 'Zone' },
];

export default function MePage() {
  const { user } = useAuth();
  const { mode } = useMode();
  const meData = useUserMeData();
  const { modalOpen, activeTrigger, closeModal } = usePremiumTrigger();
  const amberFlash = useAmberAttention();
  const { zoneState, toggleZone, pct, closedCount, seedTitle, stageStatus } = useMePageState(meData?.stats);

  const [tab, setTab] = useState<Tab>('growth');
  const [aiSheet, setAiSheet] = useState<'amber' | 'frost' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<'amber' | 'frost' | null>(null);
  const [amberName, setAmberName] = useState('엠버');
  const [frostName, setFrostName] = useState('프로스트');
  const [lang, setLang] = useState('ko');

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px 9px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border2}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 22, color: C.text, lineHeight: 1 }}>ME</span>
          <span style={{ fontSize: 10, fontWeight: 300, color: C.text4, letterSpacing: '.02em' }}>나를 알아가고 있어요</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setSettingsOpen(true)} aria-label="설정 열기" style={{ width: 28, height: 28, borderRadius: '50%', background: C.border2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke={C.text3} strokeWidth="1.2"/>
              <path d="M13.3 6.7l-.9-.5a5.1 5.1 0 0 0 0-1.4l.9-.5a.5.5 0 0 0 .2-.7l-1-1.7a.5.5 0 0 0-.7-.2l-.9.5a5 5 0 0 0-1.2-.7V1a.5.5 0 0 0-.5-.5H6.8A.5.5 0 0 0 6.3 1v1a5 5 0 0 0-1.2.7l-.9-.5a.5.5 0 0 0-.7.2l-1 1.7a.5.5 0 0 0 .2.7l.9.5a5.1 5.1 0 0 0 0 1.4l-.9.5a.5.5 0 0 0-.2.7l1 1.7a.5.5 0 0 0 .7.2l.9-.5a5 5 0 0 0 1.2.7V15a.5.5 0 0 0 .5.5h2.4a.5.5 0 0 0 .5-.5v-1a5 5 0 0 0 1.2-.7l.9.5a.5.5 0 0 0 .7-.2l1-1.7a.5.5 0 0 0-.2-.7z" stroke={C.text3} strokeWidth="1.2"/>
            </svg>
          </button>
          <AmberBtn onClick={() => setAiSheet('amber')} flash={amberFlash} />
          <FrostBtn onClick={() => setAiSheet('frost')} />
        </div>
      </div>

      {mode === 'clear' && user && <ClearMeView userId={user.id} />}

      {mode !== 'clear' && (
        <>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border2}`, padding: '0 20px', flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ fontSize: 11, fontWeight: tab === t.id ? 400 : 300, color: tab === t.id ? C.amberGold : C.text4, padding: '10px 0', marginRight: 20, background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t.id ? C.amberGold : 'transparent'}`, cursor: 'pointer', transition: 'all .2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'growth' && user && (
            <GrowthTab meData={meData} pct={pct} closedCount={closedCount} seedTitle={seedTitle} stageStatus={stageStatus} userId={user.id} />
          )}
          {tab === 'people' && (
            <PeopleSection people={meData.people} peopleLoading={meData.peopleLoading} />
          )}
          {tab === 'zone' && (
            <ZoneTab pct={pct} closedCount={closedCount} zoneState={zoneState} toggleZone={toggleZone} />
          )}
        </>
      )}

      <AISheet open={aiSheet === 'amber'} type="amber" aiName={amberName} onClose={() => setAiSheet(null)} />
      <AISheet open={aiSheet === 'frost'} type="frost" aiName={frostName} onClose={() => setAiSheet(null)} />
      <SettingsSheet
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        amberName={amberName} frostName={frostName}
        onRenameAmber={() => { setSettingsOpen(false); setTimeout(() => setRenameTarget('amber'), 350); }}
        onRenameFrost={() => { setSettingsOpen(false); setTimeout(() => setRenameTarget('frost'), 350); }}
        lang={lang} onChangeLang={setLang}
      />
      <RenameSheet
        open={renameTarget !== null} onClose={() => setRenameTarget(null)}
        title={renameTarget === 'amber' ? '엠버 이름 변경' : '프로스트 이름 변경'}
        currentName={renameTarget === 'amber' ? amberName : frostName}
        onApply={(n) => { if (renameTarget === 'amber') setAmberName(n); else setFrostName(n); setRenameTarget(null); }}
      />
      <UpgradeModal open={modalOpen} onClose={closeModal} trigger={activeTrigger} />
    </div>
  );
}
