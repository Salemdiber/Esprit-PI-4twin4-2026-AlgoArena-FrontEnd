import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';

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
import { AuthProvider, useAuth, hasCompletedSpeedChallenge } from './pages/Frontoffice/auth/context/AuthContext';
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
        minH="calc(100vh - 4rem)"
        px={{ base: 3, sm: 4, md: 6 }}
        pt={{ base: 20, md: 24 }}
        pb={{ base: 6, md: 10 }}
        bg="var(--color-bg-primary)"
        bgImage="radial-gradient(circle at 14% 18%, rgba(34, 211, 238, 0.16), transparent 24%), radial-gradient(circle at 88% 14%, rgba(59, 130, 246, 0.16), transparent 22%), radial-gradient(circle at 80% 82%, rgba(14, 165, 233, 0.16), transparent 26%), linear-gradient(180deg, rgba(2, 6, 23, 0.02), rgba(2, 6, 23, 0.12))"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset="0"
          bg="linear-gradient(135deg, rgba(2, 6, 23, 0.14), transparent 50%, rgba(2, 6, 23, 0.2))"
          pointerEvents="none"
        />
        <Box
          position="relative"
          maxW="7xl"
          w="100%"
          mx="auto"
          minH={{ base: 'calc(100vh - 8rem)', md: 'calc(100vh - 10rem)' }}
          display="grid"
          gridTemplateColumns={{ base: '1fr', xl: '0.98fr 1.02fr' }}
          gap={{ base: 4, md: 6 }}
          alignItems="center"
        >
          <VStack
            align="stretch"
            spacing={6}
            p={{ base: 4, sm: 5, md: 8 }}
            borderRadius={{ base: '20px', md: '28px' }}
            border="1px solid var(--color-border)"
            bg="rgba(15, 23, 42, 0.68)"
            backdropFilter="blur(18px)"
            boxShadow="0 30px 70px rgba(2, 6, 23, 0.4)"
            animation="fadeIn 0.3s ease"
          >
            <Box display="flex" alignItems="center" gap="12px" flexWrap="wrap">
              <Box
                w={{ base: '48px', md: '58px' }}
                h={{ base: '48px', md: '58px' }}
                borderRadius="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(14, 165, 233, 0.16))"
                border="1px solid rgba(34, 211, 238, 0.25)"
                color="cyan.200"
              >
                <LockIcon boxSize={7} />
              </Box>
              <Box>
                <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="cyan.200" fontWeight="700">
                  Locked Training Zone
                </Text>
                <Text color="var(--color-text-secondary)" fontSize="sm">
                  Sign in to unlock algorithm drills, timed practice, and challenge history.
                </Text>
              </Box>
            </Box>

            <Box>
                <Text
                  fontFamily="heading"
                  fontSize={{ base: '2xl', sm: '3xl', md: '5xl' }}
                  lineHeight="1.02"
                fontWeight="800"
                color="var(--color-text-heading)"
                maxW="12ch"
              >
                Step into the challenge lab.
              </Text>
              <Text mt={4} color="var(--color-text-secondary)" fontSize={{ base: 'md', md: 'lg' }} maxW="xl">
                Access the full challenge flow only after authentication: curated problems, submission tracking, progress stats, and your training streak.
              </Text>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
              gap={3}
            >
              {[
                { label: 'Practice pool', value: '120+' },
                { label: 'Time attack', value: 'On' },
                { label: 'Rank flow', value: 'Synced' },
              ].map((item) => (
                <Box
                  key={item.label}
                  p={4}
                  borderRadius="20px"
                  border="1px solid rgba(148, 163, 184, 0.16)"
                  bg="rgba(15, 23, 42, 0.52)"
                >
                  <Text color="cyan.200" fontWeight="800" fontSize="2xl" lineHeight="1">
                    {item.value}
                  </Text>
                  <Text mt={1} color="var(--color-text-secondary)" fontSize="sm">
                    {item.label}
                  </Text>
                </Box>
              ))}
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
              gap={3}
            >
              {[
                'Solve ranked challenges',
                'Compare runtime and XP',
                'Review your progress',
              ].map((item) => (
                <Box
                  key={item}
                  p={3.5}
                  borderRadius="16px"
                  bg="rgba(34, 211, 238, 0.07)"
                  border="1px solid rgba(34, 211, 238, 0.18)"
                  color="var(--color-text-secondary)"
                  fontSize="sm"
                >
                  {item}
                </Box>
              ))}
            </Box>

            <VStack spacing={3} align="stretch">
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

          <Box
            p={{ base: 4, sm: 5, md: 6 }}
            borderRadius={{ base: '20px', md: '28px' }}
            border="1px solid rgba(148, 163, 184, 0.18)"
            bg="rgba(2, 6, 23, 0.45)"
            boxShadow="0 24px 60px rgba(2, 6, 23, 0.3)"
            backdropFilter="blur(16px)"
          >
            <Box
              mb={4}
              p={4}
              borderRadius="22px"
              bg="linear-gradient(135deg, rgba(34, 211, 238, 0.16), rgba(15, 23, 42, 0.72))"
              border="1px solid rgba(34, 211, 238, 0.2)"
            >
              <Text fontSize="sm" color="cyan.200" fontWeight="700" letterSpacing="0.14em" textTransform="uppercase">
                Access preview
              </Text>
              <Text mt={2} fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="white">
                Your problem set is waiting
              </Text>
              <Text mt={2} color="rgba(226, 232, 240, 0.82)">
                Authentication unlocks the full challenge workspace, including timer-driven sessions and submission history.
              </Text>
            </Box>

            <Box display="grid" gridTemplateColumns="1fr" gap={3}>
              {[
                { title: 'Timed drills', detail: 'Practice under pressure with structured timers', tone: 'rgba(59, 130, 246, 0.14)' },
                { title: 'Submission review', detail: 'Inspect your attempts and iteration history', tone: 'rgba(14, 165, 233, 0.14)' },
                { title: 'Skill progress', detail: 'Keep your rank and XP progression in sync', tone: 'rgba(34, 211, 238, 0.14)' },
              ].map((card) => (
                <Box
                  key={card.title}
                  p={4}
                  borderRadius="20px"
                  bg={card.tone}
                  border="1px solid rgba(148, 163, 184, 0.16)"
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                    <Text color="white" fontWeight="700">
                      {card.title}
                    </Text>
                    <Box w="10px" h="10px" borderRadius="999px" bg="cyan.300" />
                  </Box>
                  <Text mt={1.5} color="rgba(226, 232, 240, 0.82)" fontSize="sm">
                    {card.detail}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return children;
};

const BattlesAuthGuard = ({ children }) => {
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
        minH="calc(100vh - 4rem)"
        px={{ base: 3, sm: 4, md: 6 }}
        pt={{ base: 20, md: 24 }}
        pb={{ base: 6, md: 10 }}
        bg="var(--color-bg-primary)"
        bgImage="radial-gradient(circle at 12% 18%, rgba(34, 211, 238, 0.18), transparent 24%), radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.16), transparent 22%), radial-gradient(circle at 78% 82%, rgba(14, 165, 233, 0.18), transparent 26%), linear-gradient(180deg, rgba(2, 6, 23, 0.02), rgba(2, 6, 23, 0.12))"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset="0"
          bg="linear-gradient(135deg, rgba(2, 6, 23, 0.14), transparent 50%, rgba(2, 6, 23, 0.2))"
          pointerEvents="none"
        />
        <Box
          position="relative"
          maxW="7xl"
          w="100%"
          mx="auto"
          minH={{ base: 'calc(100vh - 8rem)', md: 'calc(100vh - 10rem)' }}
          display="grid"
          gridTemplateColumns={{ base: '1fr', xl: '1.05fr 0.95fr' }}
          gap={{ base: 4, md: 6 }}
          alignItems="center"
        >
          <VStack
            align="stretch"
            spacing={6}
            p={{ base: 4, sm: 5, md: 8 }}
            borderRadius={{ base: '20px', md: '28px' }}
            border="1px solid var(--color-border)"
            bg="rgba(15, 23, 42, 0.68)"
            backdropFilter="blur(18px)"
            boxShadow="0 30px 70px rgba(2, 6, 23, 0.4)"
            animation="fadeIn 0.3s ease"
          >
            <Box display="flex" alignItems="center" gap="12px" flexWrap="wrap">
              <Box
                w={{ base: '48px', md: '58px' }}
                h={{ base: '48px', md: '58px' }}
                borderRadius="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(14, 165, 233, 0.16))"
                border="1px solid rgba(34, 211, 238, 0.25)"
                color="cyan.200"
              >
                <LockIcon boxSize={7} />
              </Box>
              <Box>
                <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="cyan.200" fontWeight="700">
                  Restricted Arena
                </Text>
                <Text color="var(--color-text-secondary)" fontSize="sm">
                  Sign in to join live battles, ranked runs, and post-match analytics.
                </Text>
              </Box>
            </Box>

            <Box>
                <Text
                  fontFamily="heading"
                  fontSize={{ base: '2xl', sm: '3xl', md: '5xl' }}
                  lineHeight="1.02"
                fontWeight="800"
                color="var(--color-text-heading)"
                maxW="12ch"
              >
                Enter the battle arena.
              </Text>
              <Text mt={4} color="var(--color-text-secondary)" fontSize={{ base: 'md', md: 'lg' }} maxW="xl">
                Unlock live matchups, strategic rounds, and your personal performance dashboard. The arena stays locked until your account is authenticated.
              </Text>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
              gap={3}
            >
              {[
                { label: 'Live battles', value: '24/7' },
                { label: 'Ranked flow', value: 'Enabled' },
                { label: 'XP tracking', value: 'Synced' },
              ].map((item) => (
                <Box
                  key={item.label}
                  p={4}
                  borderRadius="20px"
                  border="1px solid rgba(148, 163, 184, 0.16)"
                  bg="rgba(15, 23, 42, 0.52)"
                >
                  <Text color="cyan.200" fontWeight="800" fontSize="2xl" lineHeight="1">
                    {item.value}
                  </Text>
                  <Text mt={1} color="var(--color-text-secondary)" fontSize="sm">
                    {item.label}
                  </Text>
                </Box>
              ))}
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
              gap={3}
            >
              {[
                'Join the ranked ladder',
                'Track your win streaks',
                'Review battle replays',
              ].map((item) => (
                <Box
                  key={item}
                  p={3.5}
                  borderRadius="16px"
                  bg="rgba(34, 211, 238, 0.07)"
                  border="1px solid rgba(34, 211, 238, 0.18)"
                  color="var(--color-text-secondary)"
                  fontSize="sm"
                >
                  {item}
                </Box>
              ))}
            </Box>

            <VStack spacing={3} align="stretch">
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

          <Box
            p={{ base: 4, sm: 5, md: 6 }}
            borderRadius={{ base: '20px', md: '28px' }}
            border="1px solid rgba(148, 163, 184, 0.18)"
            bg="rgba(2, 6, 23, 0.45)"
            boxShadow="0 24px 60px rgba(2, 6, 23, 0.3)"
            backdropFilter="blur(16px)"
          >
            <Box
              mb={4}
              p={4}
              borderRadius="22px"
              bg="linear-gradient(135deg, rgba(34, 211, 238, 0.16), rgba(15, 23, 42, 0.72))"
              border="1px solid rgba(34, 211, 238, 0.2)"
            >
              <Text fontSize="sm" color="cyan.200" fontWeight="700" letterSpacing="0.14em" textTransform="uppercase">
                Access preview
              </Text>
              <Text mt={2} fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="white">
                Your battle cockpit awaits
              </Text>
              <Text mt={2} color="rgba(226, 232, 240, 0.82)">
                Authentication unlocks the full competition flow, including matchmaking, battle details, and summary screens.
              </Text>
            </Box>

            <Box display="grid" gridTemplateColumns="1fr" gap={3}>
              {[
                { title: 'Matchmaking', detail: 'Queue against AI or upcoming opponents', tone: 'rgba(59, 130, 246, 0.14)' },
                { title: 'Battle insight', detail: 'See rounds, scores, and timing breakdowns', tone: 'rgba(14, 165, 233, 0.14)' },
                { title: 'Progress feed', detail: 'Keep your rank and XP in sync', tone: 'rgba(34, 211, 238, 0.14)' },
              ].map((card) => (
                <Box
                  key={card.title}
                  p={4}
                  borderRadius="20px"
                  bg={card.tone}
                  border="1px solid rgba(148, 163, 184, 0.16)"
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                    <Text color="white" fontWeight="700">
                      {card.title}
                    </Text>
                    <Box w="10px" h="10px" borderRadius="999px" bg="cyan.300" />
                  </Box>
                  <Text mt={1.5} color="rgba(226, 232, 240, 0.82)" fontSize="sm">
                    {card.detail}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
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
  const [speedChallengesDisabled, setSpeedChallengesDisabled] = useState(false);

  const userIdentifier = currentUser?.userId ?? currentUser?._id ?? currentUser?.id ?? null;

  // Check platform setting once on mount (unconditional hook)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await settingsService.getSettings();
        if (!cancelled && s && s.disableSpeedChallenges) setSpeedChallengesDisabled(true);
      } catch (e) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
    if (p === '/admin') return location.pathname.startsWith(p);
    if (p === '/profile/2fa-setup') return location.pathname === p || location.pathname.startsWith(p);
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
      const userIdentifier = currentUser?.userId ?? currentUser?._id ?? currentUser?.id ?? null;
      return !!data?.pending && data?.userId === userIdentifier;
    } catch {
      return false;
    }
  })();

  // Check if we just completed speed challenge (grace period to avoid redirect bouncing)
  const justCompletedStr = localStorage.getItem('speedChallengeJustCompleted');
  const justCompleted = justCompletedStr ? (() => {
    try {
      const data = JSON.parse(justCompletedStr);
      const ageMs = Date.now() - data.completedAt;
      // Grace period = 3 seconds to prevent bouncing
      return ageMs < 3000 && data.userId === userIdentifier;
    } catch {
      return false;
    }
  })() : false;

  // Check if trying to access /speed-challenge
  const isSpeedChallengePath = location.pathname === '/speed-challenge' || location.pathname.startsWith('/speed-challenge');
  
  // If user has completed, don't allow access to /speed-challenge
  if (completedSpeedChallenge && isSpeedChallengePath && !resultPending) {
    try {
      localStorage.removeItem('speedChallengeJustCompleted');
    } catch (_) { }
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
                            <Route path="/battles" element={<BattlesAuthGuard><BattleListPage /></BattlesAuthGuard>} />
                            <Route path="/battles/:id" element={<BattlesAuthGuard><ActiveBattlePage /></BattlesAuthGuard>} />
                            <Route path="/battles/:id/summary" element={<BattlesAuthGuard><BattleSummaryPage /></BattlesAuthGuard>} />
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
