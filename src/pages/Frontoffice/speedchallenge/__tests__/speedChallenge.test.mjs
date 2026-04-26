import { computePlacement, TOTAL_SECONDS } from '../data/speedChallengeProblems.js';

describe('computePlacement', () => {
  it('returns BRONZE for 0 solved', () => {
    const res = computePlacement([], TOTAL_SECONDS);
    expect(res.rank).toBe('BRONZE');
    expect(res.xp).toBe(0);
  });

  it('returns SILVER for 1 solved fast (<=5 minutes)', () => {
    const fiveMin = 5 * 60;
    const res = computePlacement(['sc-001'], fiveMin);
    expect(res.rank).toBe('SILVER');
    expect(res.xp).toBe(50);
  });

  it('returns BRONZE for 1 solved slowly (>5 minutes)', () => {
    const sixMin = 6 * 60;
    const res = computePlacement(['sc-001'], sixMin);
    expect(res.rank).toBe('BRONZE');
  });

  it('returns GOLD for 2 solved quickly (<=8 minutes)', () => {
    const eightMin = 8 * 60;
    const res = computePlacement(['sc-001', 'sc-002'], eightMin);
    expect(res.rank).toBe('GOLD');
    expect(res.xp).toBe(170);
  });

  it('returns SILVER for 2 solved slowly (>8 minutes)', () => {
    const nineMin = 9 * 60;
    const res = computePlacement(['sc-001', 'sc-002'], nineMin);
    expect(res.rank).toBe('SILVER');
  });

  it('returns GOLD for 3 solved', () => {
    const res = computePlacement(['sc-001', 'sc-002', 'sc-003'], TOTAL_SECONDS - 10);
    expect(res.rank).toBe('GOLD');
  });
});
