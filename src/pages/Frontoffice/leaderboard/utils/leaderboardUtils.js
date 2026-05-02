const RANK_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
const RANK_THRESHOLDS = {
    BRONZE: 500,
    SILVER: 1500,
    GOLD: 3000,
    PLATINUM: 5000,
    DIAMOND: 10000,
};

const normalizeString = (value) => String(value || '').trim().toLowerCase();

const getApiOrigin = () => {
    const raw = String(import.meta.env.VITE_API_URL || '').trim();
    if (/^https?:\/\//i.test(raw)) {
        try {
            return new URL(raw).origin;
        } catch {
            return window.location.origin;
        }
    }
    if (raw.startsWith('/')) return window.location.origin;
    return `${window.location.protocol}//${window.location.hostname}:3000`;
};

const resolveMediaUrl = (url) => {
    if (!url) return '';
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    if (String(url).startsWith('/uploads/') || String(url).startsWith('uploads/')) {
        return `${getApiOrigin()}${String(url).startsWith('/') ? url : `/${url}`}`;
    }
    return String(url).startsWith('/') ? url : `/${String(url).replace(/^\//, '')}`;
};

export const isAdminUser = (user) => normalizeString(user?.role) === 'admin';

export const isSameUser = (candidate, currentUser) => {
    if (!candidate || !currentUser) return false;

    const candidateId = String(candidate._id || candidate.id || '').trim();
    const currentId = String(currentUser._id || currentUser.id || currentUser.userId || '').trim();
    if (candidateId && currentId && candidateId === currentId) return true;

    const candidateName = normalizeString(candidate.username);
    const currentName = normalizeString(currentUser.username);
    const candidateEmail = normalizeString(candidate.email);
    const currentEmail = normalizeString(currentUser.email);

    return Boolean(candidateName && currentName && candidateName === currentName)
        || Boolean(candidateEmail && currentEmail && candidateEmail === currentEmail);
};

export const getTierFromXp = (xp) => {
    let tier = 'BRONZE';
    const numericXp = Number(xp || 0);

    RANK_ORDER.forEach((rank) => {
        if (numericXp >= RANK_THRESHOLDS[rank]) {
            tier = rank;
        }
    });

    return tier;
};

const getAvatarUrl = (user) => {
    if (user?.avatar) {
        return resolveMediaUrl(user.avatar);
    }

    const label = encodeURIComponent(user?.username || 'Player');
    return `https://ui-avatars.com/api/?name=${label}&background=0f172a&color=22d3ee&bold=true`;
};

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const daysAgo = (date, days) => {
    if (!date) return false;
    const ms = Date.now() - date.getTime();
    return ms <= days * 24 * 60 * 60 * 1000;
};

const getChallengeProgress = (user) => (Array.isArray(user?.challengeProgress) ? user.challengeProgress : []);

const countSolved = (user) => getChallengeProgress(user)
    .filter((entry) => String(entry?.status || '').toUpperCase() === 'SOLVED').length;

const countAttempts = (user) => getChallengeProgress(user).length;

const getRecentActivityDate = (user) => {
    const candidates = [
        toDate(user?.lastLoginDate),
        toDate(user?.streakUpdatedAt),
        ...getChallengeProgress(user)
            .map((entry) => toDate(entry?.solvedAt))
            .filter(Boolean),
    ].filter(Boolean);

    if (!candidates.length) return null;
    return candidates.reduce((latest, current) => (current > latest ? current : latest));
};

const getTrend = (user) => {
    const recentActivity = getRecentActivityDate(user);
    const streak = Number(user?.currentStreak ?? user?.streak ?? 0);

    if (!recentActivity) return 'STABLE';
    if (daysAgo(recentActivity, 1) && streak >= 3) return 'UP';
    if (daysAgo(recentActivity, 7)) return streak >= 2 ? 'UP' : 'STABLE';
    return 'DOWN';
};

export const buildLeaderboardRow = (user, currentUser) => {
    const xp = Number(user?.xp ?? 0);
    const currentStreak = Number(user?.currentStreak ?? user?.streak ?? 0);
    const longestStreak = Number(user?.longestStreak ?? currentStreak ?? 0);
    const solvedChallenges = countSolved(user);
    const attempts = countAttempts(user);
    const lastActivity = getRecentActivityDate(user);
    const tier = String(user?.rank || user?.level || getTierFromXp(xp)).toUpperCase();
    const wins = solvedChallenges || Number(user?.wins ?? 0);
    const winRate = attempts > 0
        ? Math.round((solvedChallenges / attempts) * 100)
        : Math.min(99, Math.max(40, Math.round((xp / 120) + currentStreak)));
    const score = (xp * 100)
        + (solvedChallenges * 420)
        + (currentStreak * 120)
        + (longestStreak * 24)
        + (lastActivity ? 180 : 0);
    const isCurrentUser = isSameUser(user, currentUser);

    return {
        id: user?._id || user?.id || user?.username,
        username: user?.username || 'Anonymous',
        avatar: getAvatarUrl(user),
        rankPosition: 0,
        tier,
        xp,
        winRate,
        wins,
        streak: currentStreak,
        trend: getTrend(user),
        isCurrentUser,
        tag: isCurrentUser ? 'YOU' : (currentStreak >= 10 ? 'HOT' : null),
        solvedChallenges,
        attempts,
        lastActivity,
        score,
    };
};

export const sortLeaderboardRows = (rows) => rows.slice().sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (right.xp !== left.xp) return right.xp - left.xp;
    if (right.streak !== left.streak) return right.streak - left.streak;
    if (right.wins !== left.wins) return right.wins - left.wins;
    return left.username.localeCompare(right.username);
});

export const buildLeaderboardRows = (users, currentUser) => sortLeaderboardRows(
    users
        .filter((user) => !isAdminUser(user))
        .map((user) => buildLeaderboardRow(user, currentUser)),
).map((row, index) => ({
    ...row,
    rankPosition: index + 1,
}));
