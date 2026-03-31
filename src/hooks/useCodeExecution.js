/**
 * useCodeExecution Hook
 * Manages code execution, test running, and submission
 * Integrates with code execution service and leaderboard
 */

import { useCallback, useState, useRef } from 'react';
import codeExecutionService from '../services/codeExecutionService';
import leaderboardService from '../services/leaderboardService';

export const useCodeExecution = (challengeId, testCases = []) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [passedTests, setPassedTests] = useState(0);
  const [totalTests, setTotalTests] = useState(testCases.length);
  const [executionTime, setExecutionTime] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const timerRef = useRef(null);

  /**
   * Run code against test cases
   */
  const runCode = useCallback(
    async (code, language) => {
      if (!code.trim()) {
        setError('Please write some code first');
        return;
      }

      try {
        setError(null);
        setSuccess(false);
        setIsRunning(true);

        console.log('🚀 Running code...', { code: code.slice(0, 50), language });

        const startTime = Date.now();

        const result = await codeExecutionService.runCode(
          code,
          language,
          challengeId,
          testCases
        );

        const duration = Date.now() - startTime;
        setExecutionTime(duration);

        if (result.success) {
          setTestResults(result.testResults || []);
          setPassedTests(result.passedTests || 0);
          setTotalTests(result.totalTests || testCases.length);
          
          if (result.passedTests === result.totalTests) {
            setSuccess(true);
          }

          console.log('✅ Run complete:', result);
        } else {
          setError(result.error || 'Execution failed');
        }
      } catch (err) {
        console.error('❌ Execution error:', err);
        setError(err.message || 'Code execution failed');
      } finally {
        setIsRunning(false);
      }
    },
    [challengeId, testCases]
  );

  /**
   * Submit code for full evaluation
   */
  const submitCode = useCallback(
    async (code, language, userId) => {
      if (!code.trim()) {
        setError('Please write some code first');
        return;
      }

      try {
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);
        setIsRunning(true);

        console.log('📤 Submitting code...', { language, challengeId });

        const startTime = Date.now();

        const result = await codeExecutionService.submitCode(
          code,
          language,
          challengeId,
          testCases
        );

        const duration = Date.now() - startTime;
        setExecutionTime(duration);

        if (result.success) {
          setTestResults(result.testResults || []);
          setPassedTests(result.passedTests || 0);
          setTotalTests(result.totalTests || testCases.length);

          // Record submission in leaderboard if all tests passed
          if (result.passedTests === result.totalTests && userId) {
            await leaderboardService.recordSubmission({
              userId,
              challengeId,
              code,
              language,
              passedTests: result.passedTests,
              totalTests: result.totalTests,
              executionTime: duration,
              xpEarned: result.xpEarned || 100,
            });

            setSuccess(true);
          }

          console.log('✅ Submission complete:', result);
        } else {
          setError(result.error || 'Submission failed');
        }
      } catch (err) {
        console.error('❌ Submission error:', err);
        setError(err.message || 'Code submission failed');
      } finally {
        setIsSubmitting(false);
        setIsRunning(false);
      }
    },
    [challengeId, testCases]
  );

  /**
   * Reset test results
   */
  const resetResults = useCallback(() => {
    setTestResults([]);
    setPassedTests(0);
    setTotalTests(testCases.length);
    setExecutionTime(0);
    setError(null);
    setSuccess(false);
  }, [testCases.length]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isRunning,
    isSubmitting,
    testResults,
    passedTests,
    totalTests,
    executionTime,
    error,
    success,

    // Methods
    runCode,
    submitCode,
    resetResults,
    clearError,

    // Computed
    allTestsPassed: passedTests === totalTests && totalTests > 0,
    passPercentage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
  };
};

export default useCodeExecution;
