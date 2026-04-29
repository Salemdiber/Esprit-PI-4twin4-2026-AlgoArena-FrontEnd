import { computePlacement, TOTAL_SECONDS } from '../pages/Frontoffice/speedchallenge/data/speedChallengeProblems.js';
import { buildLeaderboardRows } from '../pages/Frontoffice/leaderboard/utils/leaderboardUtils.js';

describe('AlgoArena simple coverage (frontend)', () => {
  test('SpeedChallenge: all 3 solved => GOLD (success case)', () => {
    const res = computePlacement(['sc-001', 'sc-002', 'sc-003'], TOTAL_SECONDS - 1);
    expect(res.rank).toBe('GOLD');
    expect(res.xp).toBeGreaterThan(0);
  });

  test('Leaderboard: tie-break edge case (same score uses xp or id)', () => {
    const users = [
      { id: 'u1', username: 'alice', score: 120, xp: 500 },
      { id: 'u2', username: 'bob', score: 120, xp: 400 },
      { id: 'u3', username: 'carol', score: 100, xp: 800 },
    ];

    const rows = buildLeaderboardRows(users, 'u3');
    // Expect highest score first, and among ties alice before bob (higher xp)
    expect(rows[0].username).toBe('alice');
    expect(rows[1].username).toBe('bob');
    expect(rows[2].username).toBe('carol');
  });
});
