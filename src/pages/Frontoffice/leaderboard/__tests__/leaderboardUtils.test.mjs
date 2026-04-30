import { jest } from '@jest/globals';

import {
    buildLeaderboardRow,
    buildLeaderboardRows,
    getTierFromXp,
    isAdminUser,
    isSameUser,
    sortLeaderboardRows,
} from '../utils/leaderboardUtils.js';

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

    it('covers admin filtering, identity matching, tiers and row shaping', () => {
        expect(isAdminUser({ role: ' admin ' })).toBe(true);
        expect(isAdminUser({ role: 'player' })).toBe(false);
        expect(isSameUser(null, null)).toBe(false);
        expect(isSameUser({ _id: 'u1' }, { id: 'u1' })).toBe(true);
        expect(isSameUser({ username: 'Alice', email: 'alice@example.com' }, { username: ' alice ' })).toBe(true);
        expect(getTierFromXp(0)).toBe('BRONZE');
        expect(getTierFromXp(1499)).toBe('BRONZE');
        expect(getTierFromXp(1500)).toBe('SILVER');
        expect(getTierFromXp(2999)).toBe('SILVER');
        expect(getTierFromXp(3000)).toBe('GOLD');
        expect(getTierFromXp(5000)).toBe('PLATINUM');
        expect(getTierFromXp(10000)).toBe('DIAMOND');

        const now = new Date('2026-04-29T12:00:00.000Z').getTime();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        const currentUser = { username: 'bob' };
        const users = [
            {
                _id: 'u1',
                username: 'Alice',
                xp: 200,
                currentStreak: 3,
                longestStreak: 5,
                challengeProgress: [
                    { status: 'SOLVED', solvedAt: '2026-04-29T11:30:00.000Z' },
                    { status: 'FAILED' },
                ],
                lastLoginDate: '2026-04-29T11:45:00.000Z',
                avatar: 'https://cdn.example.com/alice.png',
            },
            {
                id: 'u2',
                username: 'bob',
                xp: 4500,
                streak: 12,
                challengeProgress: [{ status: 'SOLVED', solvedAt: '2026-04-20T12:00:00.000Z' }],
                streakUpdatedAt: '2026-04-20T12:00:00.000Z',
                avatar: 'avatars/bob.png',
            },
            {
                id: 'u3',
                username: 'Charlie',
                xp: 50,
                currentStreak: 1,
                challengeProgress: [],
                lastLoginDate: 'not-a-date',
            },
            {
                id: 'admin-1',
                username: 'Admin',
                role: 'admin',
                xp: 9999,
            },
        ];

        const rows = buildLeaderboardRows(users, currentUser);

        expect(rows).toHaveLength(3);
        expect(rows[0]).toMatchObject({
            username: 'bob',
            avatar: '/avatars/bob.png',
            isCurrentUser: true,
            tag: 'YOU',
            trend: 'DOWN',
            rankPosition: 1,
        });
        expect(rows[1]).toMatchObject({
            username: 'Alice',
            avatar: 'https://cdn.example.com/alice.png',
            trend: 'UP',
            tag: null,
            rankPosition: 2,
        });
        expect(rows[1].winRate).toBe(50);
        expect(rows[2]).toMatchObject({
            username: 'Charlie',
            trend: 'STABLE',
            rankPosition: 3,
        });
        expect(rows[2].avatar).toMatch(/^data:image\/svg\+xml/);

        const tieRows = sortLeaderboardRows([
            { username: 'Zeta', score: 10, xp: 10, streak: 1, wins: 1 },
            { username: 'Alpha', score: 10, xp: 10, streak: 1, wins: 1 },
        ]);

        expect(tieRows[0].username).toBe('Alpha');
        expect(buildLeaderboardRow(users[1], currentUser).attempts).toBe(1);
    });
});
