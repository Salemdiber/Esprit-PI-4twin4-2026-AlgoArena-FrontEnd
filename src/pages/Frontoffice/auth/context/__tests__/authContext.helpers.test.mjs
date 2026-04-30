import { hasCompletedSpeedChallenge, redirectBasedOnRole } from '../authContextUtils.js';

describe('authContextUtils', () => {
  it('redirects by role and falls back to signin for missing users', () => {
    expect(redirectBasedOnRole(null)).toBe('/signin');
    expect(redirectBasedOnRole({ role: 'admin' })).toBe('/admin');
    expect(redirectBasedOnRole({ role: 'ORGANIZER' })).toBe('/admin');
    expect(redirectBasedOnRole({ role: 'competitor' })).toBe('/');
  });

  it('detects speed challenge completion by boolean flag only', () => {
    expect(hasCompletedSpeedChallenge(null)).toBe(false);
    expect(hasCompletedSpeedChallenge({ speedChallengeCompleted: true })).toBe(true);
    expect(hasCompletedSpeedChallenge({ speedChallengeCompleted: 'true' })).toBe(false);
  });
});