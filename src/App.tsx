import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./context/AuthContext";
import type { OnboardingStep } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ModeProvider, useMode } from "./context/ModeContext";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { OfflineBanner } from "./components/OfflineBanner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// ── Auth ─────────────────────────────────────────────────────────
const Login    = lazy(() => import("./pages/auth/Login"));
const Signup   = lazy(() => import("./pages/auth/Signup"));

// ── Onboarding ───────────────────────────────────────────────────
const Welcome        = lazy(() => import("./pages/onboarding/Welcome"));
const CoreQuestions  = lazy(() => import("./pages/onboarding/CoreQuestions"));
const VFileStart     = lazy(() => import("./pages/onboarding/vfile/Start"));
const VFileQuestions = lazy(() => import("./pages/onboarding/vfile/Questions"));
const VFileResult    = lazy(() => import("./pages/onboarding/vfile/Result"));

// ── 모드 선택 ─────────────────────────────────────────────────────
const ModeSelect = lazy(() => import("./pages/onboarding/ModeSelect"));

// ── Persona ───────────────────────────────────────────────────────
const Personas              = lazy(() => import("./pages/Personas"));
const PersonaRelationships  = lazy(() => import("./pages/PersonaRelationships"));

// ── Admin ────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// ── B2B ──────────────────────────────────────────────────────────
const B2BOrgOnboarding = lazy(() => import("./pages/b2b/OrgOnboarding"));
const B2BMemberInvite  = lazy(() => import("./pages/b2b/MemberInvite"));
const B2BOrgDashboard  = lazy(() => import("./pages/b2b/OrgDashboard"));
const B2BCheckin          = lazy(() => import("./pages/b2b/Checkin"));
const B2BTraineeCheckin   = lazy(() => import("./pages/b2b/TraineeCheckin"));
const B2BCoachMatch       = lazy(() => import("./pages/b2b/CoachMatch"));
const B2BGuardianApp      = lazy(() => import("./pages/b2b/GuardianApp"));
const B2BCoachList        = lazy(() => import("./pages/b2b/CoachList"));
const B2BCoachProfile     = lazy(() => import("./pages/b2b/CoachProfile"));
const B2BCoachPortal      = lazy(() => import("./pages/b2b/CoachPortal"));

// ── Main ─────────────────────────────────────────────────────────
const HomeLayout  = lazy(() => import("./layouts/HomeLayout"));
const VentPage    = lazy(() => import("./pages/home/VentPage"));
const DigPage     = lazy(() => import("./pages/home/DigPage"));
const GetPage     = lazy(() => import("./pages/home/GetPage"));
const SetPage     = lazy(() => import("./pages/home/SetPage"));
const MePage      = lazy(() => import("./pages/home/MePage"));
const DmPage      = lazy(() => import("./pages/home/DmPage"));
const SexSelfQuestions  = lazy(() => import("./pages/home/sexself/Questions"));
const SexSelfResult     = lazy(() => import("./pages/home/sexself/Result"));
const NeedAssessment    = lazy(() => import("./pages/home/sexself/NeedAssessment"));
const CommunityPage   = lazy(() => import("./pages/home/CommunityPage"));
const UserProfilePage = lazy(() => import("./pages/users/UserProfilePage"));
const NotFound    = lazy(() => import("./pages/NotFound"));

import { toast as sonnerToast } from "sonner";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { growthbook } from "./lib/growthbook";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const msg = error instanceof Error ? error.message : '데이터를 불러오지 못했습니다';
      sonnerToast.error('연결 오류', { description: msg, duration: 4000 });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const msg = error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다';
      sonnerToast.error('저장 오류', { description: msg, duration: 4000 });
    },
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: true, // 탭/기기 전환 후 복귀 시 자동 갱신
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const SUPERADMIN_EMAILS = ['concrecrw@gmail.com', 'elizabethcho1012@gmail.com'];

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (!SUPERADMIN_EMAILS.includes(user.email ?? '')) return <Navigate to="/home" replace />;
  return children;
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location }} />;
  return children;
};

const RequireOnboarding = ({ children }: { children: JSX.Element }) => {
  const { onboardingStep, loading } = useAuth();
  if (loading) return <PageLoader />;
  const stepPath: Record<OnboardingStep, string> = {
    welcome: '/onboarding/welcome', cq: '/onboarding/cq',
    priper: '/onboarding/vfile/start', completed: '/home',
  };
  if (onboardingStep !== 'completed') return <Navigate to={stepPath[onboardingStep]} replace />;
  return children;
};

const OnboardingGuard = ({ children }: { children: JSX.Element }) => {
  const { onboardingStep, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (onboardingStep === 'completed') return <Navigate to="/home" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loading, onboardingStep } = useAuth();
  const { isFirstVisit, isReady } = useMode();
  if (loading || !isReady) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;
  // 온보딩 완료 후 최초 진입 시 → 모드 선택 화면
  if (onboardingStep === 'completed' && isFirstVisit) {
    return <Navigate to="/onboarding/mode-select" replace />;
  }
  const stepPath: Record<OnboardingStep, string> = {
    welcome: '/onboarding/welcome', cq: '/onboarding/cq',
    priper: '/onboarding/vfile/start', completed: '/home',
  };
  return <Navigate to={stepPath[onboardingStep]} replace />;
};

const App = () => {
  useEffect(() => { growthbook.loadFeatures(); }, []);
  return (
  <GrowthBookProvider growthbook={growthbook}>
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
      <ModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded">
              본문으로 건너뛰기
            </a>
            <div aria-live="polite" aria-atomic="true" className="sr-only" id="route-announcer" />
            <OfflineBanner />
            <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />

                {/* Auth */}
                <Route path="/auth/login"  element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />

                {/* 온보딩 */}
                <Route path="/onboarding/welcome" element={
                  <RequireAuth><OnboardingGuard><Welcome /></OnboardingGuard></RequireAuth>
                } />
                <Route path="/onboarding/cq" element={
                  <RequireAuth><OnboardingGuard><CoreQuestions /></OnboardingGuard></RequireAuth>
                } />
                <Route path="/onboarding/vfile/start" element={
                  <RequireAuth><OnboardingGuard><VFileStart /></OnboardingGuard></RequireAuth>
                } />
                <Route path="/onboarding/vfile/questions" element={
                  <RequireAuth><OnboardingGuard><VFileQuestions /></OnboardingGuard></RequireAuth>
                } />
                <Route path="/onboarding/vfile/result" element={
                  <RequireAuth><OnboardingGuard><VFileResult /></OnboardingGuard></RequireAuth>
                } />

                {/* 메인 앱 */}
                <Route path="/home" element={
                  <RequireAuth><RequireOnboarding><HomeLayout /></RequireOnboarding></RequireAuth>
                }>
                  <Route index        element={<Navigate to="/home/vent" replace />} />
                  <Route path="vent"  element={<VentPage />} />
                  <Route path="dig"   element={<DigPage />} />
                  <Route path="get"   element={<GetPage />} />
                  <Route path="set"   element={<SetPage />} />
                  <Route path="me"    element={<MePage />} />
                  <Route path="dm"    element={<DmPage />} />
                  <Route path="dive" element={<Navigate to="/home/dig" replace />} />
                  <Route path="sexself/questions"       element={<SexSelfQuestions />} />
                  <Route path="sexself/result"          element={<SexSelfResult />} />
                  <Route path="sexself/need-assessment" element={<NeedAssessment />} />
                  <Route path="community" element={<CommunityPage />} />
                </Route>

                {/* 유저 프로필 */}
                <Route path="/users/:userId" element={
                  <RequireAuth><RequireOnboarding><UserProfilePage /></RequireOnboarding></RequireAuth>
                } />

                {/* 모드 선택 */}
                <Route path="/onboarding/mode-select" element={
                  <RequireAuth><ModeSelect /></RequireAuth>
                } />

                {/* 페르소나 */}
                <Route path="/personas" element={
                  <RequireAuth><Personas /></RequireAuth>
                } />
                <Route path="/personas/relationships" element={
                  <RequireAuth><PersonaRelationships /></RequireAuth>
                } />

                {/* 관리자 */}
                <Route path="/admin" element={
                  <RequireAdmin><AdminDashboard /></RequireAdmin>
                } />

                {/* B2B */}
                <Route path="/b2b/onboarding" element={
                  <RequireAuth><B2BOrgOnboarding /></RequireAuth>
                } />
                <Route path="/b2b/dashboard/:orgId" element={
                  <RequireAuth><B2BOrgDashboard /></RequireAuth>
                } />
                <Route path="/b2b/checkin/:orgId" element={
                  <RequireAuth><B2BCheckin /></RequireAuth>
                } />
                <Route path="/b2b/invite/:orgId" element={
                  <RequireAuth><B2BMemberInvite /></RequireAuth>
                } />
                <Route path="/b2b/coach-match/:orgId" element={
                  <RequireAuth><B2BCoachMatch /></RequireAuth>
                } />
                <Route path="/b2b/trainee-checkin/:orgId" element={
                  <RequireAuth><B2BTraineeCheckin /></RequireAuth>
                } />
                <Route path="/b2b/guardian/:orgId" element={
                  <RequireAuth><B2BGuardianApp /></RequireAuth>
                } />
                <Route path="/b2b/coaches" element={
                  <RequireAuth><B2BCoachList /></RequireAuth>
                } />
                <Route path="/b2b/coaches/:coachId" element={
                  <RequireAuth><B2BCoachProfile /></RequireAuth>
                } />
                <Route path="/b2b/coach/portal" element={
                  <RequireAuth><B2BCoachPortal /></RequireAuth>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </TooltipProvider>
      </ModeProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
  </GrowthBookProvider>
  );
};

export default App;
