import { useState } from 'react';
import { useMeTranslations } from '@/hooks/useTranslation';
import { AmberBtn, FrostBtn } from '@/layouts/HomeLayout';
import { useAmberAttention } from '@/hooks/useAmberAttention';
import { useAuth } from '@/context/AuthContext';
import { useUserMeData } from '@/hooks/useUserMeData';
import { usePremiumTrigger } from '@/hooks/usePremiumTrigger';
import { useMePageState } from '@/hooks/useMePageState';
import { useQuery } from '@tanstack/react-query';
import { veilorDb } from '@/integrations/supabase/client';
import UpgradeModal from '@/components/premium/UpgradeModal';
import { C } from '@/lib/colors';
import { useMode } from '@/context/ModeContext';
import { useDomain } from '@/context/DomainContext';
import AISheet from '@/components/me/AISheet';
import SettingsSheet from '@/components/me/SettingsSheet';
import RenameSheet from '@/components/me/RenameSheet';
import PeopleSection from '@/components/me/PeopleSection';
import ClearMeView from '@/components/me/ClearMeView';
import GrowthTab from '@/components/me/GrowthTab';
import ZoneTab from '@/components/me/ZoneTab';
import ImpactTab from '@/components/me/ImpactTab';
import NeedSummaryCard from '@/components/me/NeedSummaryCard';
import CommunityInlineEmbed from '@/components/community/CommunityInlineEmbed';

type Tab = 'growth' | 'people' | 'zone' | 'impact';

export default function MePage() {
  const { user } = useAuth();
  const { mode } = useMode();
  const { domain } = useDomain();
  const me = useMeTranslations();
  const meData = useUserMeData();
  const { modalOpen, activeTrigger, closeModal } = usePremiumTrigger();
  const amberFlash = useAmberAttention();
  const { zoneState, toggleZone, pct, closedCount, seedTitle, stageStatus } = useMePageState(meData?.stats);

  const { data: patternSummary } = useQuery({
    queryKey: ['pattern-summary-me', user?.id],
    queryFn: async () => {
      const { data } = await veilorDb.rpc('get_user_pattern_summary', { p_user_id: user!.id });
      return data as { vent_count: number } | null;
    },
    enabled: !!user,
  });
  const ventCount = patternSummary?.vent_count ?? 0;

  const [tab, setTab] = useState<Tab>('growth');
  const [aiSheet, setAiSheet] = useState<'amber' | 'frost' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<'amber' | 'frost' | null>(null);
  const [amberName, setAmberName] = useState<string | null>(null);
  const [frostName, setFrostName] = useState<string | null>(null);
  const displayAmberName = amberName ?? me.amberDefaultName;
  const displayFrostName = frostName ?? me.frostDefaultName;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', maxWidth: 860, width: '100%', margin: '0 auto' }}>
      <div style={{ padding: '10px 20px 9px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border2}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 22, color: C.text, lineHeight: 1 }}>ME</span>
          <span style={{ fontSize: 10, fontWeight: 300, color: C.text4, letterSpacing: '.02em' }}>{me.subtitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setSettingsOpen(true)} aria-label={me.settings} style={{ width: 28, height: 28, borderRadius: '50%', background: C.border2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
          {(() => {
            const tabAccentColor =
              domain === 'work'     ? '#38BDF8' :
              domain === 'relation' ? '#FB7185' :
              domain === 'social'   ? '#7FB89A' :
              C.amberGold;

            const tabList: { id: Tab; label: string }[] = [
              { id: 'growth', label: me.tabs.growth },
              { id: 'people', label: me.tabs.people },
              { id: 'zone',   label: me.tabs.zone },
              ...(domain === 'social' ? [{ id: 'impact' as Tab, label: me.tabs.impact }] : []),
            ];

            return (
              <>
                <div style={{ display: 'flex', borderBottom: `1px solid ${C.border2}`, padding: '0 20px', flexShrink: 0 }}>
                  {tabList.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      style={{ fontSize: 11, fontWeight: tab === t.id ? 400 : 300, color: tab === t.id ? tabAccentColor : C.text4, padding: '10px 0', marginRight: 20, background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t.id ? tabAccentColor : 'transparent'}`, cursor: 'pointer', transition: 'all .2s' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {tab === 'growth' && user && (
                  <>
                    <GrowthTab meData={meData} pct={pct} closedCount={closedCount} seedTitle={seedTitle} stageStatus={stageStatus} userId={user.id} ventCount={ventCount} />
                    <NeedSummaryCard />
                  </>
                )}
                {tab === 'people' && (
                  <PeopleSection people={meData.people} peopleLoading={meData.peopleLoading} />
                )}
                {tab === 'zone' && (
                  <>
                    <ZoneTab pct={pct} closedCount={closedCount} zoneState={zoneState} toggleZone={toggleZone} />
                    <div style={{ padding: '0 20px 16px' }}>
                      <CommunityInlineEmbed tab="me" accent={C.amberGold} />
                    </div>
                  </>
                )}
                {tab === 'impact' && (
                  <ImpactTab />
                )}
              </>
            );
          })()}
        </>
      )}

      <AISheet open={aiSheet === 'amber'} type="amber" aiName={displayAmberName} onClose={() => setAiSheet(null)} />
      <AISheet open={aiSheet === 'frost'} type="frost" aiName={displayFrostName} onClose={() => setAiSheet(null)} />
      <SettingsSheet
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        amberName={displayAmberName} frostName={displayFrostName}
        onRenameAmber={() => { setSettingsOpen(false); setTimeout(() => setRenameTarget('amber'), 350); }}
        onRenameFrost={() => { setSettingsOpen(false); setTimeout(() => setRenameTarget('frost'), 350); }}
      />
      <RenameSheet
        open={renameTarget !== null} onClose={() => setRenameTarget(null)}
        title={renameTarget === 'amber' ? me.rename.amber : me.rename.frost}
        currentName={renameTarget === 'amber' ? displayAmberName : displayFrostName}
        onApply={(n) => { if (renameTarget === 'amber') setAmberName(n); else setFrostName(n); setRenameTarget(null); }}
      />
      <UpgradeModal open={modalOpen} onClose={closeModal} trigger={activeTrigger} />
    </div>
  );
}
