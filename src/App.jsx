import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { LazyMotion } from 'framer-motion';

// Accessibility
import AccessibilityProvider from './accessibility/context/AccessibilityContext';
import useAccessibility from './accessibility/hooks/useAccessibility';
import GlobalAccessibilityUI from './accessibility/components/GlobalAccessibilityUI';

// Loading System
import { LoadingProvider } from './shared/context/LoadingContext';
import RouteLoader from './shared/components/RouteLoader';
import NavigationProgress from './shared/components/NavigationProgress';
import ErrorBoundary from './components/ErrorBoundary';

// Public layout is always loaded; admin stays behind its protected route.
import PublicLayout from './layout/PublicLayout';

// ─── Lazy-loaded pages (code-split per route) ───

// Public
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'));
const AdminLayout = lazy(() => import('./layout/AdminLayout'));

// Frontoffice Auth
const SignIn = lazy(() => import('./pages/Frontoffice/SignIn'));
const SignUp = lazy(() => import('./pages/Frontoffice/SignUp'));
const OAuthCallbackPage = lazy(() => import('./pages/Frontoffice/auth/pages/OAuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Frontoffice/auth/pages/ForgotPasswordPage'));
const EmailSentPage = lazy(() => import('./pages/Frontoffice/auth/pages/EmailSentPage'));
const ResetPasswordPage = lazy(() => import('./pages/Frontoffice/auth/pages/ResetPasswordPage'));
const ResetSuccessPage = lazy(() => import('./pages/Frontoffice/auth/pages/ResetSuccessPage'));
const ResetExpiredPage = lazy(() => import('./pages/Frontoffice/auth/pages/ResetExpiredPage'));

// Frontoffice Battle Pages
const BattleListPage = lazy(() => import('./pages/Frontoffice/battles/pages/BattleListPage'));
const ActiveBattlePage = lazy(() => import('./pages/Frontoffice/battles/pages/ActiveBattlePage'));
const BattleSummaryPage = lazy(() => import('./pages/Frontoffice/battles/pages/BattleSummaryPage'));

// Battle, Challenge & Profile Providers (light, load eagerly)
import { BattleProvider } from './pages/Frontoffice/battles/hooks/useBattleState';
import { ChallengeProvider } from './pages/Frontoffice/challenges/context/ChallengeContext';
import { ProfileProvider } from './pages/Frontoffice/profile/context/ProfileContext';
import { AuthProvider, useAuth, hasCompletedSpeedChallenge } from './pages/Frontoffice/auth/context/AuthContext';
import { settingsService } from './services/settingsService';
import { getToken } from './services/cookieUtils';
import { ChatProvider, useChat } from './features/chat/ChatProvider';
import { SupportProvider } from './features/support/SupportProvider';
import { prefetchLikelyRoutes } from './routes/prefetchRoutes';

const ChatPanel = lazy(() => import('./features/chat/ChatPanel'));

// Frontoffice Challenge Pages
const ChallengesListPage = lazy(() => import('./pages/Frontoffice/challenges/pages/ChallengesListPage'));
const ChallengePlayPage = lazy(() => import('./pages/Frontoffice/challenges/pages/ChallengePlayPage'));
const ChallengesSignInGate = lazy(() => import('./pages/Frontoffice/challenges/components/ChallengesSignInGate'));
const BattlesSignInGate = lazy(() => import('./pages/Frontoffice/battles/components/BattlesSignInGate'));

// Frontoffice Speed Challenge
const SpeedChallengePage = lazy(() => import('./pages/Frontoffice/speedchallenge/SpeedChallengePage'));

// Frontoffice Leaderboard
const LeaderboardPage = lazy(() => import('./pages/Frontoffice/leaderboard/pages/LeaderboardPage'));
const CommunityPage = lazy(() => import('./pages/Frontoffice/community/pages/CommunityPage'));
const CommunityPageLegacy = lazy(() => import('./pages/Frontoffice/community/pages/CommunityPageLegacy'));
const CommunityDashboardPage = lazy(() => import('./pages/Frontoffice/community/pages/CommunityDashboardPage'));
const PostDetailPage = lazy(() => import('./pages/Frontoffice/community/pages/PostDetailPage'));

// Frontoffice Profile
const ProfilePage = lazy(() => import('./pages/Frontoffice/profile/pages/ProfilePage'));
const BillingHistoryPage = lazy(() => import('./pages/Frontoffice/profile/pages/BillingHistoryPage'));
const BillingReturnPage = lazy(() => import('./pages/Frontoffice/profile/pages/BillingReturnPage'));
const TwoFactorSetupPage = lazy(() => import('./pages/Frontoffice/profile/pages/TwoFactorSetupPage'));

// Backoffice Pages
const Dashboard = lazy(() => import('./pages/Backoffice/Dashboard'));
const Users = lazy(() => import('./pages/Backoffice/Users'));
const Battles = lazy(() => import('./pages/Backoffice/Battles'));
const Challenges = lazy(() => import('./pages/Backoffice/Challenges'));
const AILogs = lazy(() => import('./pages/Backoffice/AILogs'));
const AIAgents = lazy(() => import('./pages/Backoffice/AIAgents'));
const Leaderboards = lazy(() => import('./pages/Backoffice/Leaderboards'));
const Analytics = lazy(() => import('./pages/Backoffice/Analytics'));
const CommunityAnalytics = lazy(() => import('./pages/Backoffice/CommunityAnalytics'));
const SystemHealth = lazy(() => import('./pages/Backoffice/SystemHealth'));
const Settings = lazy(() => import('./pages/Backoffice/Settings'));
const Billing = lazy(() => import('./pages/Backoffice/Billing'));
const Profile = lazy(() => import('./pages/Backoffice/Profile'));
const AddAdmin = lazy(() => import('./pages/Backoffice/AddAdmin'));
const Sessions = lazy(() => import('./pages/Backoffice/Sessions'));
const ActivityLogs = lazy(() => import('./pages/Backoffice/ActivityLogs'));
const PlaceholderPage = lazy(() => import('./pages/Backoffice/PlaceholderPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

const AUTH_ROUTE_PATHS = ['/signin', '/signup', '/login', '/auth/callback', '/forgot-password', '/email-sent', '/reset-password', '/reset-success', '/reset-expired'];

const isPathOrChildPath = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

const isAuthRoute = (pathname) => AUTH_ROUTE_PATHS.some((path) => isPathOrChildPath(pathname, path));

const LoggedInMaintenanceGate = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  useEffect(() => {
    let cancelled = false;

    settingsService.getSettings()
      .then((data) => {
        if (cancelled) return;
        setMaintenanceMode(!!data?.maintenanceMode);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true); // on error, let app through
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Always allow auth routes
  if (isAuthRoute(location.pathname)) return children;

  if (!checked) return <RouteLoader />; // wait for settings check only for authenticated users

  const role = String(currentUser?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN';

  // Admin bypasses maintenance
  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return children;
};



// Protected Route Component - uses AuthContext
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const location = useLocation();

  // Check if user is logged in and has admin/organizer role
  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const role = String(currentUser.role || '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'ORGANIZER') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function ChallengesAuthGuard({ children }) {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const hasToken = Boolean(getToken());

  // Only block if a token exists and auth is still loading (token validation in-flight)
  if (hasToken && isAuthLoading) {
    return <RouteLoader />;
  }

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <ChallengesSignInGate />
      </Suspense>
    );
  }

  return children;
}

function BattlesAuthGuard({ children }) {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const hasToken = Boolean(getToken());

  // Only block if a token exists and auth is still loading (token validation in-flight)
  if (hasToken && isAuthLoading) {
    return <RouteLoader />;
  }

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <BattlesSignInGate />
      </Suspense>
    );
  }

  return children;
}

// Maintenance Gate - only applies AFTER login
// Admin → bypass, Player → show maintenance page, Not logged in → let through (auth routes handle themselves)
const MaintenanceGate = ({ children }) => {
  const { isLoggedIn } = useAuth();

  // Not logged in → let through (they'll hit signin anyway)
  if (!isLoggedIn) return children;

  return <LoggedInMaintenanceGate>{children}</LoggedInMaintenanceGate>;
};

// Speed Challenge Gate - enforces onboarding requirement for new users
// Redirects users who haven't completed speed challenge to the test
const SpeedChallengeGate = ({ children }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const location = useLocation();
  const [speedChallengesDisabled, setSpeedChallengesDisabled] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const userIdentifier = currentUser?.userId ?? currentUser?._id ?? currentUser?.id ?? null;
  const justCompletedStr = localStorage.getItem('speedChallengeJustCompleted');

  // Check platform setting once on mount (unconditional hook)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await settingsService.getSettings();
        if (!cancelled && s && s.disableSpeedChallenges) setSpeedChallengesDisabled(true);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (!justCompletedStr) {
        setJustCompleted(false);
        return;
      }

      try {
        const data = JSON.parse(justCompletedStr);
        const ageMs = Date.now() - data.completedAt;
        // Grace period = 3 seconds to prevent bouncing
        setJustCompleted(ageMs < 3000 && data.userId === userIdentifier);
      } catch {
        setJustCompleted(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [justCompletedStr, userIdentifier]);

  // Paths where speed challenge is NOT required
  const exemptPaths = [
    '/',                        // landing page
    '/admin',                   // admin routes
    '/login',
    '/signin',
    '/signup',
    '/auth/callback',
    '/forgot-password',
    '/email-sent',
    '/reset-password',
    '/reset-success',
    '/reset-expired',
    '/notfound',
    '/profile/2fa-setup'        // 2FA setup page
    // NOTE: /speed-challenge is NOT exempt — it's only accessible to users who haven't completed it
  ];

  const isExemptPath = exemptPaths.some((p) => {
    if (p === '/admin' || p === '/profile/2fa-setup') return isPathOrChildPath(location.pathname, p);
    return location.pathname === p;
  });

  // If not logged in or path is exempt, allow through
  if (!isLoggedIn || isExemptPath) return children;

  // If platform-wide flag disables speed challenges, bypass the gate entirely
  if (speedChallengesDisabled) return children;

  const completedSpeedChallenge = hasCompletedSpeedChallenge(currentUser);
  const resultPending = (() => {
    try {
      const raw = localStorage.getItem('speedChallengeResultPending');
      if (!raw) return false;
      const data = JSON.parse(raw);
      return !!data?.pending && data?.userId === userIdentifier;
    } catch {
      return false;
    }
  })();

  // Check if trying to access /speed-challenge
  const isSpeedChallengePath = location.pathname === '/speed-challenge' || location.pathname.startsWith('/speed-challenge');
  
  // If user has completed, don't allow access to /speed-challenge
  if (completedSpeedChallenge && isSpeedChallengePath && !resultPending) {
    try {
      localStorage.removeItem('speedChallengeJustCompleted');
    } catch {
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has completed speed challenge
  if (currentUser && !completedSpeedChallenge) {
    // Redirect to speed challenge if not completed
    // BUT: allow grace period after just completing
    if (!isSpeedChallengePath && !justCompleted) {
      return <Navigate to="/speed-challenge" state={{ from: location }} replace />;
    }
  }

  return children;
};

// Registers React Router navigate for voice commands
const NavigateRegistrar = () => {
  const navigate = useNavigate();
  const { registerNavigate } = useAccessibility();
  useEffect(() => {
    registerNavigate(navigate);
  }, [navigate, registerNavigate]);
  return null;
};

const IdleRoutePrefetcher = () => {
  const { currentUser, isLoggedIn } = useAuth();

  useEffect(() => {
    const role = String(currentUser?.role || '').toUpperCase();
    prefetchLikelyRoutes(isLoggedIn && (role === 'ADMIN' || role === 'ORGANIZER'));
  }, [currentUser?.role, isLoggedIn]);

  return null;
};

const FeatureScopedProviders = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const { pathname } = useLocation();

  if (!isLoggedIn) return children;

  const needsChallengeState =
    pathname.startsWith('/challenges') || pathname.startsWith('/speed-challenge');
  const needsBattleState = pathname.startsWith('/battles');
  const needsProfileState =
    pathname.startsWith('/profile') || pathname === '/admin/profile';

  if (!needsChallengeState && !needsBattleState && !needsProfileState) {
    return children;
  }

  if (needsBattleState) {
    return (
      <BattleProvider>
        <ChallengeProvider>{children}</ChallengeProvider>
      </BattleProvider>
    );
  }

  return (
    <>
      {needsChallengeState ? (
        <ChallengeProvider>{children}</ChallengeProvider>
      ) : needsBattleState ? (
        <ChallengeProvider>
          <BattleProvider>{children}</BattleProvider>
        </ChallengeProvider>
      ) : (
        <ProfileProvider>{children}</ProfileProvider>
      )}
    </>
  );
};

const ChatPanelMount = () => {
  const { isLoggedIn } = useAuth();
  const { isChatOpen } = useChat();

  if (!isLoggedIn || !isChatOpen) return null;

  return (
    <Suspense fallback={null}>
      <ChatPanel />
    </Suspense>
  );
};

const DeferredGlobalUi = () => {
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    const mount = () => setIsMounted(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(mount, { timeout: 4000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(mount, 2500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NavigationProgress />
      <GlobalAccessibilityUI />
      <IdleRoutePrefetcher />
    </>
  );
};

function App() {
  const loadMotionFeatures = React.useCallback(
    () => import('./motionFeatures').then((res) => res.default),
    [],
  );

  return (
    <ErrorBoundary>
      <LazyMotion features={loadMotionFeatures} strict>
        <AccessibilityProvider>
          <LoadingProvider>
            <Router>
            <NavigateRegistrar />
            <AuthProvider>
              <DeferredGlobalUi />
              <ChatProvider>
                <SupportProvider>
                  <FeatureScopedProviders>
                        <Suspense fallback={<RouteLoader />}>
                          <MaintenanceGate>
                            <SpeedChallengeGate>
                              <Routes>
                          {/* Public Routes with global header+footer */}
                          <Route element={<PublicLayout />}>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/battles" element={<BattlesAuthGuard><BattleListPage /></BattlesAuthGuard>} />
                            <Route path="/battles/:id" element={<BattlesAuthGuard><ActiveBattlePage /></BattlesAuthGuard>} />
                            <Route path="/battles/:id/summary" element={<BattlesAuthGuard><BattleSummaryPage /></BattlesAuthGuard>} />
                            <Route path="/challenges" element={<ChallengesAuthGuard><ChallengesListPage /></ChallengesAuthGuard>} />
                            <Route path="/leaderboard" element={<LeaderboardPage />} />
                            <Route path="/community" element={<CommunityPage />} />
                            <Route path="/community/legacy" element={<CommunityPageLegacy />} />
                            <Route path="/community/post/:id" element={<PostDetailPage />} />
                            <Route path="/community/dashboard" element={<CommunityDashboardPage />} />
                            <Route path="/discussion" element={<Navigate to="/community" replace />} />
                            <Route path="/discussion/dashboard" element={<Navigate to="/community/dashboard" replace />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/profile/billing" element={<BillingHistoryPage />} />
                            <Route path="/profile/billing/return" element={<BillingReturnPage />} />
                            <Route path="/speed-challenge" element={<SpeedChallengePage />} />
                            <Route path="/profile/2fa-setup" element={<TwoFactorSetupPage />} />
                          </Route>

                          {/* Challenge play page – full-screen, no global header/footer */}
                          <Route path="/challenges/:id" element={<ChallengesAuthGuard><ChallengePlayPage /></ChallengesAuthGuard>} />
                          <Route path="/login" element={<Navigate to="/signin" replace />} />
                          <Route path="/signin" element={<SignIn />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
                          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="/email-sent" element={<EmailSentPage />} />
                          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                          <Route path="/reset-success" element={<ResetSuccessPage />} />
                          <Route path="/reset-expired" element={<ResetExpiredPage />} />
                          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="users" element={<Users />} />
                            <Route path="battles" element={<Battles />} />
                            <Route path="challenges" element={<Challenges />} />
                            <Route path="ai-logs" element={<AILogs />} />
                            <Route path="ai-agents" element={<AIAgents />} />
                            <Route path="leaderboards" element={<Leaderboards />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="community-analytics" element={<CommunityAnalytics />} />
                            <Route path="system-health" element={<SystemHealth />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="billing" element={<Billing />} />
                            <Route path="sessions" element={<Sessions />} />
                            <Route path="activity-logs" element={<ActivityLogs />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="add-admin" element={<AddAdmin />} />
                            <Route path="*" element={<Navigate to="/notfound" replace />} />
                          </Route>
                          <Route path="/notfound" element={<NotFoundPage />} />
                          <Route path="*" element={<Navigate to="/notfound" replace />} />
                              </Routes>
                            </SpeedChallengeGate>
                          </MaintenanceGate>
                        </Suspense>
                  </FeatureScopedProviders>
                </SupportProvider>
                <ChatPanelMount />
              </ChatProvider>
            </AuthProvider>
            </Router>
          </LoadingProvider>
        </AccessibilityProvider>
      </LazyMotion>
    </ErrorBoundary>
  );
}

export default App;
