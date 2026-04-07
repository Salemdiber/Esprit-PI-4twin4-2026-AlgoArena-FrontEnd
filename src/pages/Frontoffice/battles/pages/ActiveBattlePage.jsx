/**
 * ActiveBattlePage – live battle detail view
 */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../i18n';
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
    executionTimeMs,
    solveTimeSeconds,
    timeLimitSeconds,
    codeQualityScore,
    maxPoints,
    difficulty,
    side,
}) => {
    const correctnessFactor = total > 0 ? Math.max(0, Math.min(1, passedCount / total)) : 0;
    const timeComplexityScore = mapComplexityScore(timeComplexity);
    const spaceComplexityScore = mapComplexityScore(spaceComplexity);
    const complexityScore = Math.round((timeComplexityScore + spaceComplexityScore) / 2);

    const runtime = Math.max(0, Number(executionTimeMs || 0));
    const runtimeCapMs = 10_000;
    const runtimeScore = Math.round(100 * (1 - Math.min(1, runtime / runtimeCapMs)));

    const limit = Math.max(1, Number(timeLimitSeconds || 900));
    const solveSecs = Math.max(0, Number.isFinite(Number(solveTimeSeconds)) ? Number(solveTimeSeconds) : 0);
    const solveTimeScore = Math.round(100 * (1 - Math.min(1, solveSecs / limit)));

    const quality = Number.isFinite(Number(codeQualityScore)) ? Number(codeQualityScore) : 60;
    const qualityScore = Math.max(0, Math.min(100, Math.round(quality)));

    const timeScore = side === 'player' ? solveTimeScore : runtimeScore;
    const composite = complexityScore * 0.45 + timeScore * 0.35 + qualityScore * 0.2;
    let score = Math.max(0, Math.round((maxPoints || 500) * (composite / 100) * correctnessFactor));

    const diff = String(difficulty || '').toUpperCase();
    const difficultyMultiplier = diff === 'EASY' ? 0.9 : diff === 'HARD' ? 1.15 : 1.0;
    const handicap = diff === 'EASY' ? 0.82 : diff === 'HARD' ? 1.02 : 1.0;

    score = Math.max(0, Math.round(score * difficultyMultiplier));
    if (side === 'opponent') {
        score = Math.max(0, Math.round(score * handicap));
    }

    return {
        score,
        correctness: Math.round(correctnessFactor * 100),
        complexityScore,
        runtimeScore,
        solveTimeScore,
        qualityScore,
    };
};

const buildOutputLines = (response) => {
    if (!response) return [];
    const lines = [];
    if (response.error) {
        lines.push({ type: 'error', text: `${response.error.type || 'Error'}: ${response.error.message}` });
        return lines;
    }

    lines.push({ type: 'info', text: i18n.t('battles.runningTestCases') });
    const results = Array.isArray(response.results) ? response.results : [];
    results.slice(0, 5).forEach((r) => {
        const status = r.passed ? 'success' : 'error';
        const output = r.output ?? r.got ?? '—';
        const expected = r.expected ?? r.expectedOutput ?? '—';
        lines.push({
            type: status,
            text: `TC${r.testCase}: ${r.passed ? i18n.t('battles.pass') : i18n.t('battles.fail')} | ${i18n.t('battles.got')}: ${output} | ${i18n.t('battles.expected')}: ${expected}`,
        });
    });

    if (results.length > 5) {
        lines.push({ type: 'info', text: i18n.t('battles.moreTestCases', { count: results.length - 5 }) });
    }

    if (response.executionTime) {
        lines.push({ type: 'result', text: i18n.t('battles.runtimeLabel', { time: response.executionTime }) });
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

const buildResult = ({ response, challenge, difficulty, side }) => {
    const submission = response?.submissionDetails || response?.previousSubmission || null;
    const passedCount = Number(response?.passedCount || submission?.passedCount || 0);
    const total = Number(response?.total || submission?.total || 0);
    const executionTimeMs = parseExecutionMs(
        submission?.executionTimeMs ?? response?.executionTimeMs ?? response?.executionTime
    );
    const timeComplexity = submission?.timeComplexity || response?.timeComplexity || response?.analysis?.timeComplexity || 'Unknown';
    const spaceComplexity = submission?.spaceComplexity || response?.spaceComplexity || response?.analysis?.spaceComplexity || 'Unknown';
    const codeQualityScore = submission?.codeQualityScore ?? response?.codeQualityScore ?? null;
    const maxPoints = Number(challenge?.maxPoints || 500);
    const solveTimeSeconds = response?.solveTimeSeconds ?? submission?.solveTimeSeconds ?? null;

    const scoreDetail = computeBattleScore({
        passedCount,
        total,
        timeComplexity,
        spaceComplexity,
        executionTimeMs,
        solveTimeSeconds,
        timeLimitSeconds: 900,
        codeQualityScore,
        maxPoints,
        difficulty,
        side,
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
            i18n.t('battles.criteriaCorrectness', { score: scoreDetail.correctness }),
            i18n.t('battles.criteriaComplexity', { score: scoreDetail.complexityScore }),
            side === 'player'
                ? i18n.t('battles.criteriaSolveTime', { score: scoreDetail.solveTimeScore })
                : i18n.t('battles.criteriaRuntime', { score: scoreDetail.runtimeScore }),
            i18n.t('battles.criteriaCodeQuality', { score: scoreDetail.qualityScore }),
            i18n.t('battles.criteriaExecTime', { ms: executionTimeMs }),
            i18n.t('battles.criteriaTimeComplexity', { value: timeComplexity }),
            i18n.t('battles.criteriaSpaceComplexity', { value: spaceComplexity }),
        ],
    };
};

const ActiveBattlePage = () => {
    const { t } = useTranslation();
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

    useEffect(() => {
        if (id) selectBattle(id);
        return () => deselectBattle();
    }, [id, selectBattle, deselectBattle]);

    useEffect(() => {
        if (battle && battle.timeLimit) {
            startTimer(battle.timeLimit);
        }
        return () => stopTimer();
    }, [battle?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (battle?.status === BattleStatus.COMPLETED) {
            navigate(`/battles/${id}/summary`, { replace: true });
        }
    }, [battle?.status, id, navigate]);

    if (!battle) {
        return (
            <div className="battle-page">
                <div className="battle-container battle-text-center" style={{ paddingTop: '4rem' }}>
                    <h2 className="battle-text-2xl battle-font-bold battle-mb-md">{t('battles.notFound')}</h2>
                    <p className="battle-text-muted battle-mb-lg">{t('battles.notFoundDesc')}</p>
                    <button className="battle-btn battle-btn--primary" onClick={() => navigate('/battles')}>
                        {t('battles.backToArena')}
                    </button>
                </div>
            </div>
        );
    }

    const currentRound = battle.rounds[battle.currentRoundIndex] || null;
    const challenge = currentRound?.challenge;
    const diffBadge = currentRound ? difficultyBadgeMap[currentRound.difficulty] : null;
    const timerStr = formatTimer(timer.remaining);
    const difficultyLabel = currentRound ? ({ EASY: t('battles.easy'), MEDIUM: t('battles.medium'), HARD: t('battles.hard') }[currentRound.difficulty] || diffBadge?.label) : null;

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
        while (list.length < 3) list.push(t('battles.noHint'));
        return list;
    }, [challenge, t]);

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
            setOutput([{ type: 'error', text: error?.message || t('battles.failedRunCode') }]);
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
                difficulty: battle.difficulty,
                side: 'player',
            });
            setRoundResult({
                battleId: battle.id,
                roundIndex: currentRound.index,
                side: 'player',
                result,
            });
        } catch (error) {
            setOutput([{ type: 'error', text: error?.message || t('battles.failedSubmitSolution') }]);
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
                const result = buildResult({
                    response,
                    challenge,
                    difficulty: response?.botDifficulty || battle.difficulty,
                    side: 'opponent',
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
                setAiError(error?.message || t('battles.aiFailed'));
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
                        {t('battles.backToArenaArrow')}
                    </button>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        {t('battles.inProgress')}
                    </h1>
                    <p className="battle-text-muted" style={{ fontSize: '1.125rem' }}>
                        {t('battles.roundOfTotal', { current: battle.currentRoundIndex + 1, total: battle.totalRounds, time: timerStr })}
                    </p>
                </div>

                <div className="battle-mb-xl">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">{t('battles.roundTimeline')}</h2>
                    <div className="battle-card" style={{ padding: '1rem' }}>
                        <BattleTimeline rounds={battle.rounds} currentRoundIndex={battle.currentRoundIndex} />
                    </div>
                </div>

                <div className="battle-active-layout">
                    {/* Challenge Panel */}
                    <section className="battle-panel">
                        <div className="battle-panel-header">
                            <h2 className="battle-text-lg battle-font-semibold">{t('battles.challenge')}</h2>
                            <div className="battle-panel-meta">
                                <span className="battle-text-muted">{timerStr}</span>
                            </div>
                        </div>
                        {currentRound && challenge ? (
                            <div className="battle-panel-content">
                                <div className="battle-chip-row">
                                    {diffBadge && (
                                        <span className={`battle-badge battle-badge--${diffBadge.color}`}>
                                            {difficultyLabel}
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
                                    <div className="battle-hints-title">{t('battles.hints')}</div>
                                    {hints.map((hint, idx) => (
                                        <div key={`hint-${idx}`} className="battle-hint-card">
                                            <button
                                                type="button"
                                                className="battle-hint-toggle"
                                                onClick={() => toggleHint(idx)}
                                            >
                                                {t('battles.hintN', { n: idx + 1 })}
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

                                <h4 className="battle-text-sm battle-text-muted" style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}>{t('battles.testCases')}</h4>
                                {testCases.length === 0 ? (
                                    <div className="battle-empty">{t('battles.noTestCases')}</div>
                                ) : (
                                    <div className="battle-testcases">
                                        {testCases.map((tc, idx) => (
                                            <div key={`tc-${idx}`} className="battle-testcase">
                                                <div className="battle-testcase-line">{t('battles.inputLabel')} <span>{tc.input}</span></div>
                                                <div className="battle-testcase-line">{t('battles.outputLabel')} <span className="battle-text-green">{tc.output}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="battle-empty">{t('battles.noActiveChallenge')}</div>
                        )}
                    </section>

                    {/* Editor Panel */}
                    <section className="battle-panel battle-panel--editor">
                        <div className="battle-panel-header">
                            <div className="battle-editor-title">{t('battles.yourSolution')}</div>
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
                                {isRunning ? t('battles.running') : t('battles.runCode')}
                            </button>
                            <button className="battle-btn battle-btn--secondary battle-btn--lg" onClick={handleSubmit} disabled={isSubmitting || !code.trim()}>
                                {isSubmitting ? t('battles.submitting') : t('battles.submit')}
                            </button>
                        </div>
                        <div className="battle-console">
                            <OutputTerminal output={output} isRunning={isRunning || isSubmitting} />
                        </div>
                    </section>

                    {/* AI Opponent Panel */}
                    <section className="battle-panel battle-panel--opponent">
                        <div className="battle-panel-header">
                            <h2 className="battle-text-lg battle-font-semibold">{t('battles.aiOpponent')}</h2>
                            <span className="battle-badge battle-badge--purple">{t('battles.live')}</span>
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
                            <span>{aiStatus === 'error' ? t('battles.error') : aiTyping ? t('battles.thinking') : t('battles.ready')}</span>
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
                                    <span>{t('battles.execution')}</span>
                                    <strong>{opponentResult.executionTimeMs}ms</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>{t('battles.timeSpace')}</span>
                                    <strong>{opponentResult.timeComplexity} / {opponentResult.spaceComplexity}</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>{t('battles.score')}</span>
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
                                    <span>{t('battles.yourExecution')}</span>
                                    <strong>{playerResult.executionTimeMs}ms</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>{t('battles.timeSpace')}</span>
                                    <strong>{playerResult.timeComplexity} / {playerResult.spaceComplexity}</strong>
                                </div>
                                <div className="battle-opponent-metric">
                                    <span>{t('battles.yourScore')}</span>
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
