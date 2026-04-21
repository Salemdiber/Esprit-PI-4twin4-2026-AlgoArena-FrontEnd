import { useState, useEffect, useRef } from 'react';
import { judgeService } from '../services/judgeService';

export function useChallenge(challengeId, timeLimitMinutes) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [results, setResults] = useState(null);
  const [hint, setHint] = useState(null);
  const [hintsUnlocked, setHintsUnlocked] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - startTime.current) / 60000));
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await judgeService.submitSolution({
        challengeId,
        userCode: code,
        language,
        elapsedMinutes,
        failedCount,
        hintsUnlocked,
      });
      setResults(res);
      if (!res.executionResults.every((r) => r.passed)) {
        setFailedCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHintRequest = async () => {
    try {
      const res = await judgeService.requestHint(challengeId, elapsedMinutes, failedCount, hintsUnlocked);
      if (res && res !== 'HINT_LOCKED') {
        setHint(res);
        setHintsUnlocked((n) => Math.min(n + 1, 3));
      }
    } catch (err) {
      console.error('Hint request failed:', err);
    }
  };

  const hintAvailable =
    (hintsUnlocked === 0 && elapsedMinutes >= timeLimitMinutes * 0.25 && failedCount >= 1) ||
    (hintsUnlocked === 1 && elapsedMinutes >= timeLimitMinutes * 0.50 && failedCount >= 3) ||
    (hintsUnlocked === 2 && elapsedMinutes >= timeLimitMinutes * 0.75 && failedCount >= 5);

  return {
    code, setCode,
    language, setLanguage,
    results, hint,
    hintsUnlocked, hintAvailable,
    timeRemaining: timeLimitMinutes - elapsedMinutes,
    isSubmitting,
    handleSubmit,
    handleHintRequest,
  };
}
