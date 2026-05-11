import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useLongPress } from '@/hooks/useLongPress';
import HoldCircle from '@/components/ai/HoldCircle';
import AILeadOverlay from '@/components/ai/AILeadOverlay';
import UpgradeModal from '@/components/premium/UpgradeModal';
import { useAuth } from '@/context/AuthContext';
import { useMode } from '@/context/ModeContext';
import { useDomain, type Domain } from '@/context/DomainContext';
import { useT } from '@/i18n/useT';

const RoutineHome        = lazy(() => import('@/pages/home/RoutineHome'));
const ClearHome          = lazy(() => import('@/pages/home/ClearHome'));
const WorkFocusHome      = lazy(() => import('@/pages/home/WorkFocusHome'));
const WorkSprintHome     = lazy(() => import('@/pages/home/WorkSprintHome'));
const RelationConnectHome = lazy(() => import('@/pages/home/RelationConnectHome'));
const RelationMirrorHome  = lazy(() => import('@/pages/home/RelationMirrorHome'));


// 탭별 포인트 컬러 (인계문서 §2 기준)
interface TabDef { to: string; label: string; color: string; badge?: boolean }

// 도메인별 포인트 팔레트 — self=amber, work=sky, relation=rose, social=sage
const DOMAIN_PALETTE: Record<Domain, readonly [string, string, string, string, string]> = {
  self:     ['#E0B48A', '#B8956A', '#8C7060', '#D4B46A', '#EDD08E'],
  work:     ['#38BDF8', '#0EA5E9', '#0284C7', '#7DD3FC', '#BAE6FD'],
  relation: ['#FB7185', '#F43F5E', '#E11D48', '#FDA4AF', '#FECDD3'],
  social:   ['#7FB89A', '#5E9E7F', '#4A8067', '#A8D4B8', '#C5E8D0'],
};

const TAB_PATHS = ['/home/vent', '/home/dig', '/home/get', '/home/set', '/home/me'] as const;
const TAB_LABELS = ['Vent', 'Dig', 'Get', 'Set', 'Me'] as const;

function buildTabs(domain: Domain): TabDef[] {
  const palette = DOMAIN_PALETTE[domain];
  return TAB_PATHS.map((to, i) => ({ to, label: TAB_LABELS[i], color: palette[i] }));
}

const ALL_TABS: TabDef[] = buildTabs('self');

// Amber 버튼 공통
export function AmberBtn({ onClick, flash }: { onClick: () => void; flash?: boolean }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      aria-label={t.homeLayout.amberAriaLabel}
      className={`relative w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${flash ? 'amber-flash' : ''}`}
      style={{ background: '#E0B48A15', border: '1px solid #E0B48A44' }}
    >
      <span
        className="absolute inset-[-3px] rounded-full"
        style={{ border: '1px solid #E0B48A18', animation: 'ai-pulse 3s ease-in-out infinite' }}
      />
      <span className="w-[19px] h-[19px] rounded-full block" style={{ background: '#E0B48A' }} />
    </button>
  );
}

// Frost 버튼 공통
export function FrostBtn({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      aria-label={t.homeLayout.frostAriaLabel}
      className="relative w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
      style={{ background: '#95BDD615', border: '1px solid #95BDD644' }}
    >
      <span
        className="absolute inset-[-3px] rounded-full"
        style={{ border: '1px solid #95BDD618', animation: 'ai-pulse 3.4s ease-in-out infinite .4s' }}
      />
      <span className="w-[19px] h-[19px] rounded-full block" style={{ background: '#95BDD6' }} />
    </button>
  );
}

// 데스크톱 사이드바
function DesktopSidebar({ tabs }: { tabs: TabDef[] }) {
  const t = useT();
  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-20"
      style={{
        width: '200px',
        background: '#1C1917',
        borderRight: '1px solid #44403C',
      }}
    >
      {/* 로고 */}
      <div
        className="px-6 py-6 flex items-center"
        style={{ borderBottom: '1px solid #2A2624' }}
      >
        <span
          className="text-lg tracking-[0.12em] font-light"
          style={{ color: '#E0B48A', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.15em' }}
        >
          VEILOR
        </span>
      </div>

      {/* 탭 목록 */}
      <nav aria-label={t.homeLayout.mainNavDesktop} className="flex flex-col gap-1 px-3 py-4 flex-1">
        {tabs.map(({ to, label, color, badge }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 px-3 py-3 rounded-[10px] relative transition-colors"
            style={({ isActive }) => ({
              background: isActive ? `${color}12` : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="w-[6px] h-[6px] rounded-full flex-shrink-0 transition-all"
                  style={{
                    background: isActive ? color : '#3C3835',
                    transform: isActive ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
                <span
                  className="text-[14px] transition-colors"
                  style={{
                    color: isActive ? color : '#9C9590',
                    fontWeight: isActive ? 400 : 300,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {label}
                </span>
                {badge && (
                  <span
                    className="absolute top-2 right-3 w-[6px] h-[6px] rounded-full"
                    style={{ background: color }}
                    aria-label={t.homeLayout.newFeatureBadge}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default function HomeLayout() {
  const [aiLeadOpen, setAiLeadOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [aiLimitOpen, setAiLimitOpen] = useState(false);
  const location = useLocation();
  const { priperCompleted, personaContextsCompleted } = useAuth();
  const { mode } = useMode();
  const { domain } = useDomain();
  const t = useT();

  // vent 탭 진입 시 모드별 홈 분기
  const isVentTab = location.pathname === '/home/vent' || location.pathname === '/home';
  const showModeHome = isVentTab && (
    mode === 'routine' || mode === 'clear' ||
    mode === 'focus' || mode === 'sprint' ||
    mode === 'connect' || mode === 'mirror'
  );

  // Vent 탭 레이블 — 모드에 따라 변경
  const ventLabel =
    mode === 'routine' ? 'Routine' :
    mode === 'clear'   ? 'Clear'   :
    mode === 'focus'   ? 'Focus'   :
    mode === 'sprint'  ? 'Sprint'  :
    mode === 'connect' ? 'Connect' :
    mode === 'mirror'  ? 'Mirror'  : 'Vent';

  // 항상 ALL_TABS 표시 (priperCompleted 조건 제거)
  const tabs = useMemo<TabDef[]>(() => {
    const applyVentLabel = (list: TabDef[]) =>
      list.map(t => t.label === 'Vent' ? { ...t, label: ventLabel } : t);

    const hasMultiPersona = personaContextsCompleted.length >= 2;
    const domainTabs = buildTabs(domain);
    const base = hasMultiPersona
      ? domainTabs.map(t => t.label === 'Set' ? { ...t, badge: true } : t)
      : domainTabs;
    return applyVentLabel(base);
  }, [personaContextsCompleted, ventLabel, domain]);

  // 현재 탭 감지
  const currentTab = location.pathname.split('/').pop() ?? '';

  const openAILead = useCallback(() => {
    setHolding(false);
    setAiLeadOpen(true);
  }, []);

  // 키보드 단축키: Ctrl+Shift+A — 시각장애인/키보드 사용자를 위한 대안
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setAiLeadOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // AI 월 한도 초과 이벤트 — 깊이 중첩된 컴포넌트에서 발행
  useEffect(() => {
    const handler = () => setAiLimitOpen(true);
    window.addEventListener('veilor:ai-limit-reached', handler);
    return () => window.removeEventListener('veilor:ai-limit-reached', handler);
  }, []);

  const longPressHandlers = useLongPress(openAILead, {
    threshold: 600,
    vibrate: true,
    onStart: () => setHolding(true),
    onEnd: () => setHolding(false),
  });

  return (
    <div
      className="flex"
      style={{ minHeight: '100dvh', background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
      {...longPressHandlers}
    >
      {/* 스크린리더 전용: AI 모드 진입 안내 */}
      <button
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded"
        onClick={() => setAiLeadOpen(true)}
      >
        {t.homeLayout.openAiMode}
      </button>

      {/* 롱프레스 홀드 서클 */}
      <HoldCircle active={holding} duration={600} />

      {/* AI 리드 모드 오버레이 */}
      <AILeadOverlay
        open={aiLeadOpen}
        onClose={() => setAiLeadOpen(false)}
        currentTab={currentTab}
      />

      {/* AI 월 한도 초과 모달 — veilor:ai-limit-reached 이벤트로 열림 */}
      <UpgradeModal open={aiLimitOpen} onClose={() => setAiLimitOpen(false)} trigger="codetalk_ai_limit" />

      {/* 데스크톱 사이드바 (lg 이상에서만 표시) */}
      <DesktopSidebar tabs={tabs} />

      {/* 메인 영역 */}
      <div className="flex flex-col flex-1 lg:ml-[200px]">
        {/* 콘텐츠 — 모드별 분기 */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: 'var(--bottom-nav-height, 64px)', paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
        >
          <div className="w-full lg:max-w-none mx-auto">
            {showModeHome ? (
              <Suspense fallback={<div className="min-h-screen bg-[#1C1917]" />}>
                {mode === 'routine'  && <RoutineHome />}
                {mode === 'clear'    && <ClearHome />}
                {mode === 'focus'    && <WorkFocusHome />}
                {mode === 'sprint'   && <WorkSprintHome />}
                {mode === 'connect'  && <RelationConnectHome />}
                {mode === 'mirror'   && <RelationMirrorHome />}
              </Suspense>
            ) : (
              <Outlet />
            )}
          </div>
        </main>

        {/* 하단 탭 nav — lg 미만에서만 표시 */}
        <nav
          aria-label={t.homeLayout.mainNav}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-around"
          style={{
            background: '#1C1917',
            borderTop: '1px solid #2A2624',
            padding: '9px 10px 16px',
          }}
        >
          {tabs.map(({ to, label, color, badge }) => (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 cursor-pointer px-3 py-1 rounded-[9px] border-none bg-transparent relative"
              style={({ isActive }) => ({
                background: isActive ? `${color}0A` : 'transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="text-[13px] font-light transition-colors"
                    style={{
                      color: isActive ? color : '#87817C',
                      fontWeight: isActive ? 400 : 300,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {label}
                  </span>
                  {badge && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full"
                      style={{ background: color }}
                      aria-label={t.homeLayout.newFeatureBadge}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
