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
            xp: Number(data.xp ?? 0),
            nextRankXp: Number(data.nextRankXp ?? 500),
            progressPercentage: Number(data.progressPercentage ?? 0),
            streak: Number(data.streak ?? 0),
            isMaxRank: Boolean(data.isMaxRank),
        };
    } catch {
        return null;
    }
}
