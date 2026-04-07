import { useCallback, useRef } from 'react';
import { useChallengeContext } from '../context/ChallengeContext';
import { useToast } from '@chakra-ui/react';
import i18n from '../../../../i18n';

export default function useChallengeExecution() {
    const {
        selectedChallenge,
        submitSolution,
        clearResults,
        setRunning,
        setSubmitting,
        isRunning,
        isSubmitting,
        isPaused,
        isChallengeSolved,
    } = useChallengeContext();
    const toast = useToast();

    const lastExecutionTime = useRef(0);

    const isExecuting = isRunning || isSubmitting;

    // ── Run Code ──────────────────────────────────────────────────
    const runCode = useCallback(async () => {
        const now = Date.now();
        if (!selectedChallenge || isExecuting) return;
        if (now - lastExecutionTime.current < 2000) return; // 2s cooldown anti-spam
        lastExecutionTime.current = now;

        clearResults();
        setRunning(true);
        try {
            const result = await submitSolution('run');
            if (result?.reason === 'paused') {
                toast({
                    title: i18n.t('challengePage.timerPaused'),
                    description: i18n.t('challengePage.resumeToContinue'),
                    status: 'warning',
                    duration: 2500,
                    isClosable: true,
                });
            }
        } finally {
            setRunning(false);
        }
    }, [selectedChallenge, isExecuting, clearResults, setRunning, submitSolution, toast]);

    // ── Submit Code ───────────────────────────────────────────────
    const submitCode = useCallback(async () => {
        const now = Date.now();
        if (!selectedChallenge || isExecuting) return;
        if (now - lastExecutionTime.current < 2000) return;
        lastExecutionTime.current = now;

        clearResults();
        setSubmitting(true);
        try {
            const result = await submitSolution('submit');
            if (result?.reason === 'paused') {
                toast({
                    title: i18n.t('challengePage.timerPaused'),
                    description: i18n.t('challengePage.resumeBeforeSubmit'),
                    status: 'warning',
                    duration: 2500,
                    isClosable: true,
                });
            } else if (result?.reason === 'solved') {
                toast({
                    title: i18n.t('challengePage.challengeAlreadySolvedToast'),
                    description: i18n.t('challengePage.resubmissionDisabled'),
                    status: 'info',
                    duration: 2500,
                    isClosable: true,
                });
            }
        } finally {
            setSubmitting(false);
        }
    }, [selectedChallenge, isExecuting, clearResults, setSubmitting, submitSolution, toast]);

    // ── Cancel (for slow executions) ──────────────────────────────
    const cancelExecution = useCallback(() => {
        setRunning(false);
        setSubmitting(false);
        clearResults();
    }, [setRunning, setSubmitting, clearResults]);

    return { runCode, submitCode, cancelExecution, isPaused, isChallengeSolved };
}
