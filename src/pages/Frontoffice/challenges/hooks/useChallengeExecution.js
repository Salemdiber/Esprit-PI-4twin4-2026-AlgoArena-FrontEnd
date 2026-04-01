/**
 * useChallengeExecution – simulated code execution and submission.
 *
 * Exposes: runCode, submitCode, testResults, isRunning, isSubmitting.
 * Simulates test runs with setTimeout (ready to be replaced by a real judge).
 */
import { useCallback } from 'react';
import { useChallengeContext } from '../context/ChallengeContext';

/**
 * Simulate a single test-case result.
 * In a real system this would call a backend judge.
 */
function simulateTestResult(testCase) {
    const passed = Math.random() > 0.15; // 85 % pass rate for demo
    const runtime = Math.round(40 + Math.random() * 80); // 40-120 ms
    const memory = +(38 + Math.random() * 10).toFixed(1); // 38-48 MB

    return {
        id: testCase.id,
        input: testCase.input,
        expected: testCase.expected,
        output: passed ? testCase.expected : '"wrong_answer"',
        status: passed ? 'PASSED' : 'FAILED',
        runtime,
        memory,
    };
}

export default function useChallengeExecution() {
    const {
        selectedChallenge,
        code,
        setTestResults,
        setRunning,
        setSubmitting,
        markSolved,
        clearResults,
    } = useChallengeContext();

    // ── Run Code (quick test) ────────────────────────────────
    const runCode = useCallback(() => {
        if (!selectedChallenge) return;
        clearResults();
        setRunning(true);

        setTimeout(() => {
            const results = selectedChallenge.testCases.map(simulateTestResult);
            const allPassed = results.every(r => r.status === 'PASSED');
            setTestResults(results, allPassed);
            setRunning(false);
        }, 1200 + Math.random() * 800);
    }, [selectedChallenge, clearResults, setRunning, setTestResults]);

    // ── Submit Code (full submission) ────────────────────────
    const submitCode = useCallback(() => {
        if (!selectedChallenge) return;
        clearResults();
        setSubmitting(true);
        setRunning(true);

        setTimeout(() => {
            // For submit, simulate all passing (realistic demo)
            const results = selectedChallenge.testCases.map(tc => {
                const runtime = Math.round(40 + Math.random() * 80);
                const memory = +(38 + Math.random() * 10).toFixed(1);
                return {
                    id: tc.id,
                    input: tc.input,
                    expected: tc.expected,
                    output: tc.expected,
                    status: 'PASSED',
                    runtime,
                    memory,
                };
            });

            const allPassed = true;
            const avgRuntime = Math.round(results.reduce((s, r) => s + r.runtime, 0) / results.length);
            const avgMemory = +(results.reduce((s, r) => s + r.memory, 0) / results.length).toFixed(1);

            setTestResults(results, allPassed);
            setRunning(false);
            setSubmitting(false);

            if (allPassed) {
                markSolved(selectedChallenge.id, avgRuntime, avgMemory, selectedChallenge.xpReward);
            }
        }, 1800 + Math.random() * 1200);
    }, [selectedChallenge, clearResults, setRunning, setSubmitting, setTestResults, markSolved]);

    return { runCode, submitCode };
}
