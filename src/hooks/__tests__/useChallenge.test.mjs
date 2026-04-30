import { jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';

const submitSolution = jest.fn();
const requestHint = jest.fn();

await jest.unstable_mockModule('../../services/judgeService', () => ({
  judgeService: {
    submitSolution,
    requestHint,
  },
}));

const { judgeService } = await import('../../services/judgeService');
const { useChallenge } = await import('../useChallenge.js');

describe('useChallenge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    let now = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    globalThis.__setChallengeNow = (value) => {
      now = value;
    };
    submitSolution.mockReset();
    requestHint.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete globalThis.__setChallengeNow;
  });

  it('unlocks the first hint after a failed submission and enough elapsed time', async () => {
    judgeService.submitSolution.mockResolvedValue({
      executionResults: [{ passed: false }],
    });

    const { result } = renderHook(() => useChallenge('challenge-1', 20));

    await act(async () => {
      await result.current.handleSubmit();
    });

    globalThis.__setChallengeNow(5 * 60 * 1000 + 1);
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => expect(result.current.hintAvailable).toBe(true));
  });

  it('stores a hint and increments the unlocked counter', async () => {
    judgeService.requestHint.mockResolvedValue({ unlocked: true, hint: 'Try a hash map' });

    const { result } = renderHook(() => useChallenge('challenge-2', 20));

    await act(async () => {
      await result.current.handleHintRequest();
    });

    expect(result.current.hint).toBe('Try a hash map');
    expect(result.current.hintsUnlocked).toBe(1);
  });
});