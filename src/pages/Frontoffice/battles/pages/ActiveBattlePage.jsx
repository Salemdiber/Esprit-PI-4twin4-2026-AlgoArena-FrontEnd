/**
 * ActiveBattlePage – live battle detail view
 */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBattleState } from '../hooks/useBattleState';
import { BattleStatus, BattleMode, RoundStatus, difficultyBadgeMap } from '../types/battle.types';
import BattleTimeline from '../components/BattleTimeline';
import { CodeEditor, OutputTerminal } from '../../../../editor';
import { battlesService } from '../../../../services/battlesService';
import { judgeService } from '../../../../services/judgeService';
import '../battles.css';

const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const mapComplexityScore = (complexity) => {
    const value = String(complexity || '').toLowerCase();
    if (value.includes('o(1)')) return 100;
    if (value.includes('o(log')) return 90;
    if (value.includes('o(n log')) return 75;
    if (value.includes('o(n)')) return 80;
    if (value.includes('o(n^2') || value.includes('o(n2)')) return 55;
    if (value.includes('o(n^3') || value.includes('o(n3)')) return 35;
    return 60;
};

const computeBattleScore = ({
    passedCount,
    total,
    timeComplexity,
    spaceComplexity,
    timeLimitSeconds,
    solveTimeSeconds,
    maxPoints,
}) => {
    const exactitude = total > 0 ? (passedCount / total) * 100 : 0;
    const timeScore = mapComplexityScore(timeComplexity);
    const spaceScore = mapComplexityScore(spaceComplexity);
    const complexityScore = Math.round((timeScore + spaceScore) / 2);
    const styleScore = 60;
    const timeBonus = Math.max(0, Math.round(10 * (1 - Math.min(1, (solveTimeSeconds || 0) / (timeLimitSeconds || 900)))));
    const composite = exactitude * 0.4 + complexityScore * 0.3 + styleScore * 0.2 + timeBonus;
    const score = Math.max(0, Math.round((maxPoints || 500) * (composite / 100)));

    return {
        score,
        exactitude: Math.round(exactitude),
        complexityScore,
        styleScore,
        timeBonus,
    };
};

const buildOutputLines = (response) => {
    if (!response) return [];
    const lines = [];
    if (response.error) {
        lines.push({ type: 'error', text: `${response.error.type || 'Error'}: ${response.error.message}` });
        return lines;
    }

    lines.push({ type: 'info', text: 'Running test cases...' });
    const results = Array.isArray(response.results) ? response.results : [];
    results.slice(0, 5).forEach((r) => {
        const status = r.passed ? 'success' : 'error';
        const output = r.output ?? r.got ?? '—';
        const expected = r.expected ?? r.expectedOutput ?? '—';
        lines.push({
            type: status,
            text: `TC${r.testCase}: ${r.passed ? 'PASS' : 'FAIL'} | got: ${output} | expected: ${expected}`,
        });
    });

    if (results.length > 5) {
        lines.push({ type: 'info', text: `+${results.length - 5} more test cases` });
    }

    if (response.executionTime) {
        lines.push({ type: 'result', text: `Runtime: ${response.executionTime}` });
    }

    return lines;
};

const parseExecutionMs = (value) => {
    if (Number.isFinite(value)) return Number(value);
    if (typeof value === 'string') {
        const match = value.match(/(\d+)/);
        if (match) return Number(match[1]);
    }
    return 0;
};

const buildResult = ({ response, challenge, timeLimitSeconds, solveTimeSeconds }) => {
    const submission = response?.submissionDetails || response?.previousSubmission || null;
    const passedCount = Number(response?.passedCount || submission?.passedCount || 0);
    const total = Number(response?.total || submission?.total || 0);
    const executionTimeMs = parseExecutionMs(
        submission?.executionTimeMs ?? response?.executionTimeMs ?? response?.executionTime
    );
    const timeComplexity = submission?.timeComplexity || response?.timeComplexity || response?.analysis?.timeComplexity || 'Unknown';
    const spaceComplexity = submission?.spaceComplexity || response?.spaceComplexity || response?.analysis?.spaceComplexity || 'Unknown';
    const maxPoints = Number(challenge?.maxPoints || 500);

    const scoreDetail = computeBattleScore({
        passedCount,
        total,
        timeComplexity,
        spaceComplexity,
        timeLimitSeconds,
        solveTimeSeconds,
        maxPoints,
    });

    const score = scoreDetail.score;

    return {
        executionTimeMs,
        timeComplexity,
        spaceComplexity,
        score,
        passedCount,
        total,
        criteria: [
            `Exactitude: ${scoreDetail.exactitude}/100`,
            `Complexity: ${scoreDetail.complexityScore}/100`,
            `Time bonus: ${scoreDetail.timeBonus}/10`,
            `Execution time: ${executionTimeMs}ms`,
            `Time complexity: ${timeComplexity}`,
            `Space complexity: ${spaceComplexity}`,
        ],
    };
};

const ActiveBattlePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        battles,
        selectBattle,
        deselectBattle,
        timer,
        startTimer,
        stopTimer,
        completeRound,
        setRoundResult,
    } = useBattleState();

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openHints, setOpenHints] = useState({});
    const [aiStatus, setAiStatus] = useState('idle');
    const [aiError, setAiError] = useState('');

    const battle = battles.find(b => b.id === id);

    // Select battle on mount
    useEffect(() => {
        if (id) selectBattle(id);
        return () => deselectBattle();
    }, [id, selectBattle, deselectBattle]);

    // Start timer on mount
    useEffect(() => {
        if (battle && battle.timeLimit) {
            startTimer(battle.timeLimit);
        }
        return () => stopTimer();
    }, [battle?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Redirect to summary if battle completed
    useEffect(() => {
        if (battle?.status === BattleStatus.COMPLETED) {
            navigate(`/battles/${id}/summary`, { replace: true });
        }
    }, [battle?.status, id, navigate]);

    if (!battle) {
        return (
            <div className="battle-page">
                <div className="battle-container battle-text-center" style={{ paddingTop: '4rem' }}>
                    <h2 className="battle-text-2xl battle-font-bold battle-mb-md">Battle Not Found</h2>
                    <p className="battle-text-muted battle-mb-lg">The requested battle doesn't exist.</p>
                    <button className="battle-btn battle-btn--primary" onClick={() => navigate('/battles')}>
                        Back to Arena
                    </button>
                </div>
            </div>
        );
    }

    const currentRound = battle.rounds[battle.currentRoundIndex] || null;
    const challenge = currentRound?.challenge;
    const diffBadge = currentRound ? difficultyBadgeMap[currentRound.difficulty] : null;
    const timerStr = formatTimer(timer.remaining);

    const opponentName = battle.opponent?.name || 'AI Master';
    const opponentLeague = battle.opponent?.league || 'AI League';

    const testCases = useMemo(() => {
        if (!challenge) return [];
        if (Array.isArray(challenge.testCases) && challenge.testCases.length > 0) {
            return challenge.testCases.slice(0, 3);
        }
        if (challenge.example?.input) {
            return [{ input: challenge.example.input, output: challenge.example.output }];
        }
        return [];
    }, [challenge]);

    const hints = useMemo(() => {
        const list = Array.isArray(challenge?.hints) ? challenge.hints.slice(0, 3) : [];
        while (list.length < 3) list.push('No hint available for this challenge.');
        return list;
    }, [challenge]);

    const toggleHint = useCallback((idx) => {
        setOpenHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
    }, []);

    useEffect(() => {
        if (!challenge) return;
        const starter = challenge?.starterCode?.[language]
            || 'function solve() {\n  // Start coding here\n}\n';
        setCode((prev) => (prev.trim() ? prev : starter));
    }, [challenge, language]);

    const handleRun = async () => {
        if (!challenge?.id || !code.trim() || isRunning) return;
        setIsRunning(true);
        setOutput([]);
        try {
            const response = await judgeService.submitSolution({
                challengeId: challenge.id,
                userCode: code,
                language,
                mode: 'run',
            });
            setOutput(buildOutputLines(response));
        } catch (error) {
            setOutput([{ type: 'error', text: error?.message || 'Failed to run code.' }]);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!challenge?.id || !code.trim() || isSubmitting || !currentRound) return;
        setIsSubmitting(true);
        setOutput([]);
        try {
            const solveTimeSeconds = Math.max(0, (battle.timeLimit || 900) - timer.remaining);
            const response = await judgeService.submitSolution({
                challengeId: challenge.id,
                userCode: code,
                language,
                solveTimeSeconds,
                mode: 'submit',
            });
            setOutput(buildOutputLines(response));
            const result = buildResult({
                response,
                challenge,
                timeLimitSeconds: battle.timeLimit || 900,
                solveTimeSeconds,
            });
            setRoundResult({
                battleId: battle.id,
                roundIndex: currentRound.index,
                side: 'player',
                result,
            });
        } catch (error) {
            setOutput([{ type: 'error', text: error?.message || 'Failed to submit solution.' }]);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!battle || battle.mode !== BattleMode.ONE_VS_AI) return;
        if (!currentRound || currentRound.status !== RoundStatus.IN_PROGRESS) return;
        if (currentRound.opponentResult) return;

        let cancelled = false;
        setAiStatus('thinking');
        setAiError('');

        const runAi = async () => {
            try {
                const response = await battlesService.submitAiSolution(battle.id, { language });
                if (cancelled) return;
                const aiSolveSeconds = Math.round(Number(response?.executionTimeMs || 0) / 1000);
                const result = buildResult({
                    response,
                    challenge,
                    timeLimitSeconds: battle.timeLimit || 900,
                    solveTimeSeconds: aiSolveSeconds,
                });
                setRoundResult({
                    battleId: battle.id,
                    roundIndex: currentRound.index,
                    side: 'opponent',
                    result,
                });
                setAiStatus('done');
            } catch (error) {
                if (cancelled) return;
                setAiStatus('error');
                setAiError(error?.message || 'AI failed to submit.');
            }
        };

        const timeoutId = setTimeout(runAi, 900);
        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [battle?.id, battle?.mode, currentRound?.index, currentRound?.status, currentRound?.opponentResult, language, setRoundResult]);

    useEffect(() => {
        if (!battle || !currentRound) return;
        if (currentRound.status !== RoundStatus.IN_PROGRESS) return;
        if (!currentRound.playerResult || !currentRound.opponentResult) return;

        const playerScore = currentRound.playerResult.score || 0;
        const opponentScore = currentRound.opponentResult.score || 0;
        const timeSpent = formatSeconds(Math.round((currentRound.playerResult.executionTimeMs || 0) / 1000));
        const efficiency = challenge?.maxPoints
            ? Math.round((playerScore / challenge.maxPoints) * 100)
            : 0;

        completeRound({
            battleId: battle.id,
            roundIndex: currentRound.index,
            playerScore,
            opponentScore,
            timeSpent,
            efficiency,
        });
    }, [battle, currentRound, challenge?.maxPoints, completeRound]);

    const aiTyping = aiStatus === 'thinking';
    const playerResult = currentRound?.playerResult;
    const opponentResult = currentRound?.opponentResult;

    return (
        <div className="battle-page">
            <div className="battle-container">
                {/* Header */}
                <div className="battle-mb-xl">
                    <button
                        className="battle-btn battle-btn--secondary"
                        onClick={() => navigate('/battles')}
                        style={{ marginBottom: '1rem' }}
                    >
                        ← Back to Arena
                    </button>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        Battle in Progress
                    </h1>
                    <p className="battle-text-muted" style={{ fontSize: '1.125rem' }}>
                        Round {battle.currentRoundIndex + 1} of {battle.totalRounds} • Time Remaining: {timerStr}
                    </p>
                </div>

                <div className="battle-mb-xl">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">Round Timeline</h2>
                    <div className="battle-card" style={{ padding: '1rem' }}>
                        <BattleTimeline rounds={battle.rounds} currentRoundIndex={battle.currentRoundIndex} />
                    </div>
                </div>

                <div className="battle-active-layout">
                    {/* Challenge Panel */}
                    <section className="battle-panel">
                        <div className="battle-panel-header">
                            <h2 className="battle-text-lg battle-font-semibold">Challenge</h2>
                            <div className="battle-panel-meta">
                                <span className="battle-text-muted">{timerStr}</span>
                            </div>
                        </div>
                        {currentRound && challenge ? (
                            <div className="battle-panel-content">
                                <div className="battle-chip-row">
                                    {diffBadge && (
                                        <span className={`battle-badge battle-badge--${diffBadge.color}`}>
                                            {diffBadge.label}
                                        </span>
                                    )}
                                    {challenge.tags.map(tag => (
                                        <span key={tag} className="battle-badge battle-badge--gray">{tag}</span>
                                    ))}
                                </div>
                                <h3 className="battle-text-xl battle-font-bold" style={{ marginBottom: '0.5rem' }}>
                                    {challenge.title}
                                </h3>
                                <p className="battle-text-muted" style={{ marginBottom: '0.75rem' }}>{challenge.description}</p>

                                <div className="battle-hints">
                                    <div className="battle-hints-title">Hints</div>
                                    {hints.map((hint, idx) => (
                                        <div key={`hint-${idx}`} className="battle-hint-card">
                                            <button
                                                type="button"
                                                className="battle-hint-toggle"
                                                onClick={() => toggleHint(idx)}
                                            >
                                                Hint {idx + 1}
                                                <span className="battle-hint-toggle-icon">{openHints[idx] ? '−' : '+'}</span>
                                            </button>
                                            {openHints[idx] && (
                                                <div className="battle-hint-body">{hint}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="battle-challenge-meta" style={{ marginTop: '0.75rem' }}>
                                    <span className="battle-meta-pill">⏱️ {timerStr}</span>
                                    <span className="battle-meta-pill">⭐ {challenge.maxPoints} XP</span>
                                </div>

                                <h4 className="battle-text-sm battle-text-muted" style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}>Test Cases</h4>
                                {testCases.length === 0 ? (
                                    <div className="battle-empty">No test cases available.</div>
                                ) : (
                                    <div className="battle-testcases">
                                        {testCases.map((tc, idx) => (
                                            <div key={`tc-${idx}`} className="battle-testcase">
                                                <div className="battle-testcase-line">Input: <span>{tc.input}</span></div>
                                                <div className="battle-testcase-line">Output: <span className="battle-text-green">{tc.output}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="battle-empty">No active challenge.</div>
                        )}
                    </section>

                    {/* Editor Panel */}
                    <section className="battle-panel battle-panel--editor">
                        <div className="battle-panel-header">
                            <div className="battle-editor-title">Your Solution</div>
                            <select
                                className="battle-language-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                            </select>
                        </div>
                        <div className="battle-editor-area battle-editor-area--code">
                            <CodeEditor
                                code={code}
                                onChange={setCode}
                                language={language}
                                height="320px"
                                options={{ fontSize: 13 }}
                            />
                        </div>
                        <div className="battle-editor-actions">
                            <button className="battle-btn battle-btn--primary battle-btn--lg" onClick={handleRun} disabled={isRunning || !code.trim()}>
                                {isRunning ? 'Running...' : 'Run Code'}
                            </button>
                            <button className="battle-btn battle-btn--secondary battle-btn--lg" onClick={handleSubmit} disabled={isSubmitting || !code.trim()}>
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                        <div className="battle-console">
                            <OutputTerminal output={output} isRunning={isRunning || isSubmitting} />
                        </div>
                    </section>

                    {/* AI Opponent Panel */}
                    <section className="battle-panel battle-panel--opponent">
                        <div className="battle-panel-header">
                            <h2 className="battle-text-lg battle-font-semibold">AI Opponent</h2>
                            <span className="battle-badge battle-badge--purple">LIVE</span>
                        </div>
                        <div className="battle-opponent-card">
                            <div className="battle-opponent-avatar">🤖</div>
                            <div>
                                <div className="battle-opponent-name">{opponentName}</div>
                                <div className="battle-text-muted">{opponentLeague}</div>
                            </div>
                        </div>
                        <div className="battle-opponent-status">
                            <span className={`battle-status-dot ${aiTyping ? 'battle-status-dot--active' : ''}`} />
                            <span>{aiStatus === 'error' ? 'Error' : aiTyping ? 'Thinking...' : 'Ready'}</span>
                        </div>
                        <div className="battle-typing-indicator">
                            <span className={`typing-dot ${aiTyping ? 'typing-dot--active' : ''}`} />
                            <span className={`typing-dot ${aiTyping ? 'typing-dot--active' : ''}`} />
                            <span className={`typing-dot ${aiTyping ? 'typing-dot--active' : ''}`} />
                        </div>

                        {aiError && (
                            <div className="battle-empty">{aiError}</div>
                        )}

                        {opponentResult && (
                            <div className="battle-opponent-metrics">
                                <div className="battle-opponent-metric">
                                    <span>Execution</span>
                                    <strong>{opponentResult.executionTimeMs}ms</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>Time / Space</span>
                                    <strong>{opponentResult.timeComplexity} / {opponentResult.spaceComplexity}</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>Score</span>
                                    <strong>+{opponentResult.score}</strong>
                                </div>
                                <div className="battle-opponent-criteria">
                                    {opponentResult.criteria?.map((item, idx) => (
                                        <div key={`ai-crit-${idx}`}>{item}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {playerResult && (
                            <div className="battle-opponent-metrics battle-opponent-metrics--player">
                                <div className="battle-opponent-metric">
                                    <span>Your Execution</span>
                                    <strong>{playerResult.executionTimeMs}ms</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>Time / Space</span>
                                    <strong>{playerResult.timeComplexity} / {playerResult.spaceComplexity}</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>Your Score</span>
                                    <strong>+{playerResult.score}</strong>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ActiveBattlePage;
