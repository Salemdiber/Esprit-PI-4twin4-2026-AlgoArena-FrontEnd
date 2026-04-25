const prefetchedRoutes = new Set();

const routePrefetchers = [
    { match: (path) => path === '/', load: () => import('../pages/LandingPage/LandingPage') },
    { match: (path) => path === '/signin', load: () => import('../pages/Frontoffice/SignIn') },
    { match: (path) => path === '/signup', load: () => import('../pages/Frontoffice/SignUp') },
    { match: (path) => path === '/forgot-password', load: () => import('../pages/Frontoffice/auth/pages/ForgotPasswordPage') },
    { match: (path) => path === '/challenges', load: () => import('../pages/Frontoffice/challenges/pages/ChallengesListPage') },
    // NOTE: Challenge play is heavy (Monaco editor). Avoid prefetching the play
    // page here to prevent Monaco and its workers from being downloaded during
    // initial idle prefetch. The regular route lazy-loading will load it when
    // the user actually navigates to a specific challenge.
    { match: (path) => path === '/battles', load: () => import('../pages/Frontoffice/battles/pages/BattleListPage') },
    { match: (path) => path.startsWith('/battles/'), load: () => import('../pages/Frontoffice/battles/pages/ActiveBattlePage') },
    { match: (path) => path === '/leaderboard', load: () => import('../pages/Frontoffice/leaderboard/pages/LeaderboardPage') },
    { match: (path) => path === '/community', load: () => import('../pages/Frontoffice/community/pages/CommunityPage') },
    { match: (path) => path === '/community/dashboard', load: () => import('../pages/Frontoffice/community/pages/CommunityDashboardPage') },
    { match: (path) => path === '/profile', load: () => import('../pages/Frontoffice/profile/pages/ProfilePage') },
    { match: (path) => path === '/speed-challenge', load: () => import('../pages/Frontoffice/speedchallenge/SpeedChallengePage') },
    { match: (path) => path === '/admin', load: () => import('../pages/Backoffice/Dashboard') },
    { match: (path) => path === '/admin/users', load: () => import('../pages/Backoffice/Users') },
    { match: (path) => path === '/admin/battles', load: () => import('../pages/Backoffice/Battles') },
    { match: (path) => path === '/admin/challenges', load: () => import('../pages/Backoffice/Challenges') },
    { match: (path) => path === '/admin/analytics', load: () => import('../pages/Backoffice/Analytics') },
];

const normalizePath = (path) => {
    if (!path) return '/';
    const [cleanPath] = String(path).split(/[?#]/);
    return cleanPath || '/';
};

export const prefetchRoute = (path) => {
    const routePath = normalizePath(path);
    if (prefetchedRoutes.has(routePath)) return;

    const prefetcher = routePrefetchers.find(({ match }) => match(routePath));
    if (!prefetcher) return;

    prefetchedRoutes.add(routePath);
    prefetcher.load().catch(() => {
        prefetchedRoutes.delete(routePath);
    });
};

export const prefetchLikelyRoutes = (isAdmin = false) => {
    const preload = () => {
        prefetchRoute('/challenges');
        prefetchRoute('/leaderboard');
        prefetchRoute('/battles');
        if (isAdmin) {
            prefetchRoute('/admin');
            prefetchRoute('/admin/analytics');
        }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(preload, { timeout: 2500 });
        return;
    }

    window.setTimeout(preload, 1500);
};
