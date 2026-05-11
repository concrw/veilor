import { useState } from 'react';
import { Settings } from 'lucide-react';
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
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border2}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 22, color: C.text, lineHeight: 1 }}>Me</span>
          <span style={{ fontSize: 10, fontWeight: 300, color: C.text4, letterSpacing: '.02em' }}>{me.subtitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setSettingsOpen(true)} aria-label={me.settings} style={{ width: 28, height: 28, borderRadius: '50%', background: C.border2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Settings size={14} color={C.text3} strokeWidth={1.5} />
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
