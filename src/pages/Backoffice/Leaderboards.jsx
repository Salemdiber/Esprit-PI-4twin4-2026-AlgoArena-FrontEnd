import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { userService } from '../../services/userService';
import { useAuth } from '../Frontoffice/auth/context/AuthContext';

const RANK_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
const RANK_THRESHOLDS = {
    BRONZE: 500,
    SILVER: 1500,
    GOLD: 3000,
    PLATINUM: 5000,
    DIAMOND: 10000,
};

const LEAGUE_STYLES = {
    BRONZE: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    SILVER: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    GOLD: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    PLATINUM: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    DIAMOND: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
};

const normalizeString = (value) => String(value || '').trim().toLowerCase();
const toNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const isAdminUser = (user) => normalizeString(user?.role) === 'admin';

const getAvatarUrl = (user) => {
    if (user?.avatar) {
        if (String(user.avatar).startsWith('http')) return user.avatar;
        if (String(user.avatar).startsWith('/')) return user.avatar;
        return `/${String(user.avatar).replace(/^\//, '')}`;
    }

    const label = encodeURIComponent(user?.username || 'Player');
    return `https://ui-avatars.com/api/?name=${label}&background=0f172a&color=22d3ee&bold=true`;
};

const getTierFromXp = (xp) => {
    let tier = 'BRONZE';
    const numericXp = toNumber(xp);

    RANK_ORDER.forEach((rank) => {
        if (numericXp >= RANK_THRESHOLDS[rank]) {
            tier = rank;
        }
    });

    return tier;
};

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const daysAgo = (date, days) => {
    if (!date) return false;
    return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;
};

const getChallengeProgress = (user) => (Array.isArray(user?.challengeProgress) ? user.challengeProgress : []);
const countSolved = (user) => getChallengeProgress(user).filter((entry) => normalizeString(entry?.status) === 'solved').length;
const countAttempts = (user) => getChallengeProgress(user).length;

const getRecentActivityDate = (user) => {
    const candidates = [
        toDate(user?.lastLoginDate),
        toDate(user?.streakUpdatedAt),
        ...getChallengeProgress(user).map((entry) => toDate(entry?.solvedAt)).filter(Boolean),
    ].filter(Boolean);

    if (!candidates.length) return null;
    return candidates.reduce((latest, current) => (current > latest ? current : latest));
};

const isSameUser = (candidate, currentUser) => {
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

const getScopeBucket = (user) => {
    const referenceDate = toDate(user?.lastLoginDate) || toDate(user?.createdAt);
    if (!referenceDate) return 'all-time';
    if (daysAgo(referenceDate, 120)) return 'current-season';
    if (daysAgo(referenceDate, 240)) return 'season-1';
    return 'season-2';
};

const buildLeaderboardRow = (user, currentUser) => {
    const xp = toNumber(user?.xp);
    const currentStreak = toNumber(user?.currentStreak ?? user?.streak);
    const longestStreak = toNumber(user?.longestStreak ?? currentStreak);
    const solvedChallenges = countSolved(user);
    const attempts = countAttempts(user);
    const lastActivity = getRecentActivityDate(user);
    const createdAt = toDate(user?.createdAt);
    const league = String(user?.rank || user?.level || getTierFromXp(xp)).toUpperCase();
    const wins = solvedChallenges || toNumber(user?.wins);

    return {
        id: user?._id || user?.id || user?.username,
        username: user?.username || 'Anonymous',
        displayName: user?.username || 'Anonymous',
        avatar: getAvatarUrl(user),
        league,
        xp,
        challenges: solvedChallenges,
        attempts,
        streak: currentStreak,
        longestStreak,
        wins,
        createdAt,
        lastActivity,
        scopeBucket: getScopeBucket(user),
        isCurrentUser: isSameUser(user, currentUser),
    };
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const StreakIcon = (props) => (
    <Icon as={StarIcon} color="yellow.300" filter="drop-shadow(0 0 6px rgba(250, 204, 21, 0.35))" aria-hidden="true" {...props} />
);

const getPodiumClasses = (position) => {
    if (position === 1) {
        return {
            wrapper: 'glass-panel rounded-2xl p-6 shadow-custom transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group border-yellow-500/30',
            overlay: 'absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-(--color-bg-secondary) z-0 opacity-50 group-hover:opacity-100 transition-opacity',
            badge: 'w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)] ring-4 ring-yellow-500/20',
            text: 'text-yellow-400',
            accent: 'text-yellow-500/80',
            xp: 'text-yellow-400',
            ring: 'border-yellow-400',
            label: 'CHAMPION',
        };
    }

    if (position === 2) {
        return {
            wrapper: 'glass-panel rounded-2xl p-6 shadow-custom transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group mt-4 md:mt-8 border-gray-400/30',
            overlay: 'absolute inset-0 bg-gradient-to-br from-gray-400/10 to-(--color-bg-secondary) z-0 opacity-50 group-hover:opacity-100 transition-opacity',
            badge: 'w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(156,163,175,0.3)] ring-4 ring-gray-400/20',
            text: 'text-slate-300',
            accent: 'text-slate-400',
            xp: 'text-[var(--color-text-secondary)]',
            ring: 'border-gray-400',
            label: 'RUNNER-UP',
        };
    }

    return {
        wrapper: 'glass-panel rounded-2xl p-6 shadow-custom transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group mt-4 md:mt-12 border-orange-500/30',
        overlay: 'absolute inset-0 bg-gradient-to-br from-orange-500/10 to-(--color-bg-secondary) z-0 opacity-50 group-hover:opacity-100 transition-opacity',
        badge: 'w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)] ring-4 ring-orange-500/20',
        text: 'text-orange-300',
        accent: 'text-orange-400',
        xp: 'text-orange-400',
        ring: 'border-orange-400',
        label: 'PODIUM',
    };
};

const PodiumCard = ({ entry, position }) => {
    const classes = getPodiumClasses(position);
    const avatarSizeClass = position === 1 ? 'w-20 h-20' : 'w-16 h-16';
    const xpWrapClass = position === 1
        ? 'flex items-center justify-center gap-2 mb-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 max-w-[180px] mx-auto'
        : position === 2
            ? 'flex items-center justify-center gap-2 mb-2 p-2 bg-slate-500/10 rounded-lg border border-slate-500/20 max-w-[180px] mx-auto'
            : 'flex items-center justify-center gap-2 mb-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 max-w-[180px] mx-auto';
    const xpToneClass = position === 1 ? 'text-yellow-400' : position === 2 ? 'text-slate-400' : 'text-orange-400';
    const badgeToneClass = position === 1
        ? 'bg-yellow-500 text-[#0f172a]'
        : position === 2
            ? 'bg-gray-400 text-slate-950'
            : 'bg-orange-500 text-slate-950';

    if (!entry) {
        return (
            <div className={classes.wrapper}>
                <div className={classes.overlay} />
                <div className="relative z-10 text-center py-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className={classes.badge}>
                            <span style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold drop-shadow-md">{position}</span>
                        </div>
                    </div>
                    <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold mb-1">No data</h3>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Waiting for live users</p>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.wrapper}>
            <div className={classes.overlay} />
            <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                    <div className={classes.badge}>
                        <span style={{ color: 'var(--color-text-heading)' }} className="font-heading text-4xl font-bold drop-shadow-md">{position}</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="relative inline-block mb-3">
                        <img src={entry.avatar} alt={entry.displayName} className={`${avatarSizeClass} rounded-full border-4 ${classes.ring} mx-auto`} />
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${badgeToneClass} text-xs font-bold px-2 py-0.5 rounded-full`}>
                            {classes.label}
                        </div>
                    </div>
                    <h3 style={{ color: 'var(--color-text-heading)' }} className={`font-heading ${position === 1 ? 'text-2xl' : 'text-xl'} font-bold mb-1`}>{entry.username}</h3>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mb-3">{entry.displayName}</p>
                    <div className={xpWrapClass}>
                        <svg className={`w-5 h-5 ${xpToneClass}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className={`font-heading ${position === 1 ? 'text-xl' : 'text-lg'} font-bold ${xpToneClass}`}>{formatNumber(entry.xp)}</span>
                    </div>
                    <p className={`text-xs ${classes.accent} font-medium mt-2 inline-flex items-center gap-1`}><StreakIcon boxSize={3} /> {entry.streak} day streak</p>
                </div>
            </div>
        </div>
    );
};

const LeaderboardRow = ({ entry, rank }) => {
    const leagueStyles = LEAGUE_STYLES[entry.league] || LEAGUE_STYLES.BRONZE;

    return (
        <tr className={`table-row-hover border-b transition-colors ${entry.isCurrentUser ? 'bg-cyan-500/5' : ''}`}>
            <td className="px-6 py-4 whitespace-nowrap">
                <span style={{ color: 'var(--color-text-secondary)' }} className="font-heading text-lg font-bold">#{rank}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <img src={entry.avatar} alt={entry.username} className="w-10 h-10 rounded-full border-2 border-cyan-400" />
                    <div>
                        <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm font-medium flex items-center gap-2">
                            {entry.username}
                            {entry.isCurrentUser ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">YOU</span>
                            ) : null}
                        </p>
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">{entry.displayName}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-cyan-400">{formatNumber(entry.xp)}</td>
            <td style={{ color: 'var(--color-text-secondary)' }} className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(entry.challenges)}</td>
            <td style={{ color: 'var(--color-text-secondary)' }} className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="inline-flex items-center gap-1">
                    <StreakIcon boxSize={3.5} color="var(--color-text-secondary)" />
                    {entry.streak} days
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${leagueStyles}`}>
                    {entry.league}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button title="View Profile" className="action-btn action-btn-view" onClick={() => entry.onViewDetails?.(entry)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>
            </td>
        </tr>
    );
};

const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-panel rounded-2xl p-6 w-full max-w-xl shadow-custom animate-fade-in-up" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 min-w-0">
                        <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full border-2 border-cyan-400 object-cover shrink-0" />
                        <div className="min-w-0">
                            <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold truncate">@{user.username}</h2>
                            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm truncate">{user.displayName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-secondary px-3 py-2 text-sm">Close</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-panel rounded-xl p-4">
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-[0.18em] mb-1">XP</p>
                        <p style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold">{formatNumber(user.xp)}</p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-[0.18em] mb-1">Rank</p>
                        <p style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold">{user.league}</p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-[0.18em] mb-1">Challenges</p>
                        <p style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold">{formatNumber(user.challenges)}</p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-[0.18em] mb-1">Streak</p>
                        <p style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold">{user.streak} days</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const extractUsers = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

const Leaderboards = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [loadError, setLoadError] = useState('');
    const [leagueFilter, setLeagueFilter] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        let cancelled = false;

        const loadUsers = async () => {
            setIsLoading(true);
            setLoadError('');

            try {
                const response = await userService.getUsers();
                if (cancelled) return;

                setUsers(extractUsers(response));
            } catch (error) {
                if (cancelled) return;

                setUsers([]);
                setLoadError(error?.message || 'Impossible de charger les données du leaderboard.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadUsers();

        return () => {
            cancelled = true;
        };
    }, []);

    const leaderboardRows = useMemo(() => {
        return users
            .filter((user) => !isAdminUser(user))
            .map((user) => buildLeaderboardRow(user, currentUser))
            .filter((row) => (leagueFilter === 'ALL' ? true : row.league === leagueFilter))
            .sort((left, right) => {
                if (right.xp !== left.xp) return right.xp - left.xp;
                if (right.streak !== left.streak) return right.streak - left.streak;
                if (right.wins !== left.wins) return right.wins - left.wins;
                return left.username.localeCompare(right.username);
            })
            .map((row, index) => ({
                ...row,
                rankPosition: index + 1,
                onViewDetails: setSelectedUser,
            }));
    }, [users, currentUser, leagueFilter]);

    const podium = leaderboardRows.slice(0, 3);
    const contenders = leaderboardRows.slice(3);

    const topXp = leaderboardRows[0]?.xp || 0;
    const totalCompetitors = leaderboardRows.length;
    const averageXp = totalCompetitors > 0
        ? Math.round(leaderboardRows.reduce((sum, user) => sum + user.xp, 0) / totalCompetitors)
        : 0;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold mb-2">Leaderboard Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Manage rankings and competitive standings</p>
            </div>

            <div className="glass-panel rounded-2xl p-4 mb-6 shadow-custom">
                <div className="flex flex-col md:flex-row gap-4">
                    <select value={leagueFilter} onChange={(event) => setLeagueFilter(event.target.value)} className="form-select bg-(--color-bg-input) md:w-48">
                        <option value="ALL">All Ranks</option>
                        {RANK_ORDER.map((rank) => (
                            <option key={rank} value={rank}>{rank.charAt(0) + rank.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                    <div className="flex-1"></div>
                    <button className="btn-primary w-full md:w-auto" onClick={() => window.print()}>Export Rankings</button>
                </div>
            </div>

            {loadError ? (
                <div className="glass-panel rounded-2xl p-4 shadow-custom border border-orange-500/20 bg-orange-500/5">
                    <p style={{ color: 'var(--color-text-heading)' }} className="font-semibold">Live data unavailable</p>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mt-1">{loadError}</p>
                </div>
            ) : null}

            {isLoading ? (
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <p style={{ color: 'var(--color-text-muted)' }}>Loading real leaderboard data...</p>
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <PodiumCard position={1} entry={podium[0]} />
                <PodiumCard position={2} entry={podium[1]} />
                <PodiumCard position={3} entry={podium[2]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="glass-panel rounded-2xl p-4 shadow-custom">
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-[0.18em] mb-2">Competitors</p>
                    <p style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold">{totalCompetitors.toLocaleString()}</p>
                </div>
                <div className="glass-panel rounded-2xl p-4 shadow-custom">
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-[0.18em] mb-2">Top XP</p>
                    <p style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold">{formatNumber(topXp)}</p>
                </div>
                <div className="glass-panel rounded-2xl p-4 shadow-custom">
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs uppercase tracking-[0.18em] mb-2">Average XP</p>
                    <p style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold">{formatNumber(averageXp)}</p>
                </div>
            </div>

            <div className="glass-panel rounded-2xl shadow-custom overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-(--color-bg-sidebar)/50 border-b">
                            <tr>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">XP</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Challenges</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Streak</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {!isLoading && contenders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center">
                                        <p style={{ color: 'var(--color-text-heading)' }} className="font-semibold">No users match the selected filters</p>
                                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm mt-1">Try a broader rank or season scope.</p>
                                    </td>
                                </tr>
                            ) : null}
                            {contenders.map((entry) => (
                                <LeaderboardRow key={entry.id} rank={entry.rankPosition} entry={entry} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
};

export default Leaderboards;
