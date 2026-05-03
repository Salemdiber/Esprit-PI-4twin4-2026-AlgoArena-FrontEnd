/**
 * userStatsService – fetches rank & XP stats for the front-office challenges page.
 *
 * Endpoint: GET /api/user/me/rank-stats
 * Auth:     Bearer JWT (retrieved automatically by apiClient)
 */
import { apiClient } from './apiClient';

/**
 * @typedef {Object} RankStats
 * @property {string|null} rank               - Current rank (BRONZE…DIAMOND) or null if unranked
 * @property {number}      xp                 - Total XP earned
 * @property {number}      nextRankXp         - XP threshold of the next rank
 * @property {number}      progressPercentage - Progress within current rank band (0–100)
 * @property {number}      streak             - Daily activity streak in days
 * @property {boolean}     isMaxRank          - True when at DIAMOND rank
 */

/**
 * Fetch the authenticated user's rank/XP gamification stats.
 * Returns null (never throws) on auth failure or network error,
 * so the UI can degrade gracefully.
 *
 * @returns {Promise<RankStats|null>}
 */
export async function fetchRankStats() {
    try {
        const data = await apiClient('/user/me/rank-stats', { method: 'GET' });
        if (!data || typeof data.xp !== 'number') return null;
        return {
            rank: data.rank ?? null,
            rankDetails: data.rankDetails ?? data.rank ?? null,
            nextRank: data.nextRank ?? null,
            totalXP: Number(data.totalXP ?? data.xp ?? 0),
            xpInCurrentRank: Number(data.xpInCurrentRank ?? 0),
            xpNeededForNextRank: Number(data.xpNeededForNextRank ?? 0),
            xp: Number(data.xp ?? 0),
            nextRankXp: Number(data.nextRankXp ?? 500),
            progressPercentage: Number(data.progressPercentage ?? data.progressPercent ?? 0),
            progressPercent: Number(data.progressPercent ?? data.progressPercentage ?? 0),
            streak: Number(data.streak ?? 0),
            isMaxRank: Boolean(data.isMaxRank),
        };
    } catch {
        return null;
    }
}

export async function fetchUserStreak() {
    try {
        const data = await apiClient('/user/me/streak', { method: 'GET' });
        return {
            currentStreak: Number(data?.currentStreak ?? 0),
            longestStreak: Number(data?.longestStreak ?? 0),
            lastLoginDate: data?.lastLoginDate ?? null,
            streakMessage: data?.streakMessage ?? '',
            recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity.map(Boolean) : [false, false, false, false, false, false, false],
        };
    } catch {
        return null;
    }
}

export async function fetchUserAttempts() {
    try {
        const data = await apiClient('/user/attempts', { method: 'GET' });
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}
