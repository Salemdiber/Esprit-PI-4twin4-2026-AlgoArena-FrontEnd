import { buildLeaderboardRows } from '../utils/leaderboardUtils.js';

describe('Leaderboard utils', () => {
    it('sorts leaderboard rows by score descending', () => {
        const users = [
            {
                _id: 'u1',
                username: 'Alpha',
                xp: 1200,
                currentStreak: 2,
                challengeProgress: [{ status: 'SOLVED' }, { status: 'SOLVED' }],
                lastLoginDate: new Date().toISOString(),
            },
            {
                _id: 'u2',
                username: 'Bravo',
                xp: 800,
                currentStreak: 1,
                challengeProgress: [{ status: 'SOLVED' }],
            },
        ];

        const rows = buildLeaderboardRows(users, null);

        expect(rows[0].username).toBe('Alpha');
        expect(rows[0].score).toBeGreaterThan(rows[1].score);
    });

    it('handles tie scores by sorting usernames alphabetically', () => {
        const users = [
            {
                _id: 'u1',
                username: 'Zeta',
                xp: 1000,
                currentStreak: 2,
                challengeProgress: [{ status: 'SOLVED' }],
            },
            {
                _id: 'u2',
                username: 'Alpha',
                xp: 1000,
                currentStreak: 2,
                challengeProgress: [{ status: 'SOLVED' }],
            },
        ];

        const rows = buildLeaderboardRows(users, null);

        expect(rows[0].username).toBe('Alpha');
        expect(rows[1].username).toBe('Zeta');
    });

    it('updates ranking when a new user score overtakes the top spot', () => {
        const users = [
            {
                _id: 'u1',
                username: 'Nova',
                xp: 500,
                currentStreak: 1,
                challengeProgress: [],
            },
            {
                _id: 'u2',
                username: 'Orion',
                xp: 1400,
                currentStreak: 1,
                challengeProgress: [],
            },
        ];

        const initialRows = buildLeaderboardRows(users, null);
        expect(initialRows[0].username).toBe('Orion');

        const updatedRows = buildLeaderboardRows([
            { ...users[0], xp: 2000 },
            users[1],
        ], null);

        expect(updatedRows[0].username).toBe('Nova');
        expect(updatedRows[0].score).toBeGreaterThan(updatedRows[1].score);
    });
});
