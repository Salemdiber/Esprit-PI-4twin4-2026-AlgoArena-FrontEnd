import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Text, VStack } from '@chakra-ui/react';

// Accessibility
import AccessibilityProvider from './accessibility/context/AccessibilityContext';
import useAccessibility from './accessibility/hooks/useAccessibility';
import GlobalAccessibilityUI from './accessibility/components/GlobalAccessibilityUI';

// Loading System
import { LoadingProvider } from './shared/context/LoadingContext';
import RouteLoader from './shared/components/RouteLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts (always loaded – they wrap everything)
import PublicLayout from './layout/PublicLayout';
import AdminLayout from './layout/AdminLayout';

// ─── Lazy-loaded pages (code-split per route) ───

// Public
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'));

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
import { BattleProvider } from './pages/Frontoffice/battles';
import { ChallengeProvider } from './pages/Frontoffice/challenges';
import { ProfileProvider } from './pages/Frontoffice/profile';
import { AuthProvider, useAuth } from './pages/Frontoffice/auth/context/AuthContext';
import { settingsService } from './services/settingsService';
import { getToken } from './services/cookieUtils';

// Frontoffice Challenge Pages
const ChallengesListPage = lazy(() => import('./pages/Frontoffice/challenges/pages/ChallengesListPage'));
const ChallengePlayPage = lazy(() => import('./pages/Frontoffice/challenges/pages/ChallengePlayPage'));

// Frontoffice Speed Challenge
const SpeedChallengePage = lazy(() => import('./pages/Frontoffice/speedchallenge/SpeedChallengePage'));

// Frontoffice Leaderboard
const LeaderboardPage = lazy(() => import('./pages/Frontoffice/leaderboard/pages/LeaderboardPage'));

// Frontoffice Profile
const ProfilePage = lazy(() => import('./pages/Frontoffice/profile/pages/ProfilePage'));
const TwoFactorSetupPage = lazy(() => import('./pages/Frontoffice/profile/pages/TwoFactorSetupPage'));

// Backoffice Pages
const Dashboard = lazy(() => import('./pages/Backoffice/Dashboard'));
const Users = lazy(() => import('./pages/Backoffice/Users'));
const Battles = lazy(() => import('./pages/Backoffice/Battles'));
const Challenges = lazy(() => import('./pages/Backoffice/Challenges'));
const AILogs = lazy(() => import('./pages/Backoffice/AILogs'));
const Leaderboards = lazy(() => import('./pages/Backoffice/Leaderboards'));
const Analytics = lazy(() => import('./pages/Backoffice/Analytics'));
const SystemHealth = lazy(() => import('./pages/Backoffice/SystemHealth'));
const Settings = lazy(() => import('./pages/Backoffice/Settings'));
const Profile = lazy(() => import('./pages/Backoffice/Profile'));
const AddAdmin = lazy(() => import('./pages/Backoffice/AddAdmin'));
const Sessions = lazy(() => import('./pages/Backoffice/Sessions'));
const ActivityLogs = lazy(() => import('./pages/Backoffice/ActivityLogs'));
const PlaceholderPage = lazy(() => import('./pages/Backoffice/PlaceholderPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));



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

const ChallengesAuthGuard = ({ children }) => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasToken = Boolean(getToken());

  if (isAuthLoading || (hasToken && !isLoggedIn)) {
    return <RouteLoader />;
  }

  if (!isLoggedIn) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, md: 6 }}
        py={{ base: 24, md: 28 }}
        bg="var(--color-bg-primary)"
        bgImage="radial-gradient(circle at 20% 10%, rgba(34, 211, 238, 0.14), transparent 42%), radial-gradient(circle at 80% 90%, rgba(14, 165, 233, 0.13), transparent 46%)"
      >
        <VStack
          spacing={5}
          textAlign="center"
          maxW="lg"
          w="100%"
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          border="1px solid var(--color-border)"
          bg="var(--color-bg-card)"
          boxShadow="0 28px 64px rgba(2, 6, 23, 0.35)"
          animation="fadeIn 0.3s ease"
        >
          <Box
            w="62px"
            h="62px"
            borderRadius="18px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(34, 211, 238, 0.12)"
            border="1px solid rgba(34, 211, 238, 0.25)"
            color="cyan.300"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V8a5 5 0 0 1 10 0v3" />
            </svg>
          </Box>
          <Text fontFamily="heading" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="var(--color-text-heading)">
            Access Restricted
          </Text>
          <Text color="var(--color-text-secondary)" maxW="md">
            You must sign in or create an account to solve challenges.
          </Text>
          <VStack spacing={3} w="100%" pt={1}>
            <Button
              w="100%"
              colorScheme="cyan"
              size="lg"
              onClick={() => navigate('/signin', { state: { from: location } })}
              boxShadow="0 14px 30px rgba(34, 211, 238, 0.22)"
              _hover={{ transform: 'translateY(-1px)', boxShadow: '0 18px 34px rgba(34, 211, 238, 0.26)' }}
              transition="all 0.2s ease"
            >
              Sign In
            </Button>
            <Button
              w="100%"
              variant="outline"
              size="lg"
              onClick={() => navigate('/signup')}
              borderColor="rgba(34, 211, 238, 0.28)"
              _hover={{ bg: 'rgba(34, 211, 238, 0.08)', transform: 'translateY(-1px)' }}
              transition="all 0.2s ease"
            >
              Create Account
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return children;
};

// Maintenance Gate - only applies AFTER login
// Admin → bypass, Player → show maintenance page, Not logged in → let through (auth routes handle themselves)
const MaintenanceGate = ({ children }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  // Auth-related paths that should never be blocked
  const authPaths = ['/signin', '/signup', '/login', '/auth/callback', '/forgot-password', '/email-sent', '/reset-password', '/reset-success', '/reset-expired'];
  const isAuthRoute = authPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));

  useEffect(() => {
    let cancelled = false;
    settingsService.getSettings()
      .then((data) => {
        if (!cancelled) {
          setMaintenanceMode(!!data?.maintenanceMode);
          setChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) setChecked(true); // on error, let app through
      });
    return () => { cancelled = true; };
  }, [isLoggedIn]); // re-check after login/logout

  // Always allow auth routes
  if (isAuthRoute) return children;

  if (!checked) return null; // wait for settings check

  // Not logged in → let through (they'll hit signin anyway)
  if (!isLoggedIn) return children;

  const role = String(currentUser?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN';

  // Admin bypasses maintenance
  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return children;
};

// Speed Challenge Gate - enforces onboarding requirement for new users
// Redirects users who haven't completed speed challenge to the test
const SpeedChallengeGate = ({ children }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Paths where speed challenge is NOT required
  const exemptPaths = [
    '/',                        // landing page
    '/speed-challenge',         // the test itself
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
  ];

  const isExemptPath = exemptPaths.some((p) => {
    if (p === '/speed-challenge') return location.pathname === p || location.pathname.startsWith(p);
    if (p === '/admin') return location.pathname.startsWith(p);
    if (p === '/profile/2fa-setup') return location.pathname === p || location.pathname.startsWith(p);
    return location.pathname === p;
  });

  // If not logged in or path is exempt, allow through
  if (!isLoggedIn || isExemptPath) {
    return children;
  }

  // Check if user has completed speed challenge
  if (currentUser && !currentUser.speedChallengeCompleted) {
    // Redirect to speed challenge if not completed
    if (location.pathname !== '/speed-challenge') {
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

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <LoadingProvider>
          <a href="#main-content" className="skip-to-content">Skip to content</a>
          <Router>
            <NavigateRegistrar />
            <GlobalAccessibilityUI />
            <AuthProvider>
              <BattleProvider>
                <ChallengeProvider>
                  <ProfileProvider>
                    <Suspense fallback={<RouteLoader />}>
                      <MaintenanceGate>
                        <SpeedChallengeGate>
                          <Routes>
                          {/* Public Routes with global header+footer */}
                          <Route element={<PublicLayout />}>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/battles" element={<BattleListPage />} />
                            <Route path="/battles/:id" element={<ActiveBattlePage />} />
                            <Route path="/battles/:id/summary" element={<BattleSummaryPage />} />
                            <Route path="/challenges" element={<ChallengesAuthGuard><ChallengesListPage /></ChallengesAuthGuard>} />
                            <Route path="/leaderboard" element={<LeaderboardPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
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
                            <Route path="leaderboards" element={<Leaderboards />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="system-health" element={<SystemHealth />} />
                            <Route path="settings" element={<Settings />} />
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
                  </ProfileProvider>
                </ChallengeProvider>
              </BattleProvider>
            </AuthProvider>
          </Router>
        </LoadingProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
