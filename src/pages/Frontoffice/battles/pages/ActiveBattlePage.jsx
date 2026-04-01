/**
 * ActiveBattlePage – live battle detail view
 *
 * Displays scoreboard, round timeline, current challenge,
 * and simulation controls.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBattleState } from '../hooks/useBattleState';
import { BattleStatus, difficultyBadgeMap } from '../types/battle.types';
import BattleTimeline from '../components/BattleTimeline';
import '../battles.css';

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
        simulateCompleteRound,
    } = useBattleState();

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
    const [aiTyping, setAiTyping] = useState(false);

    // Format timer
    const timerMins = Math.floor(timer.remaining / 60);
    const timerSecs = timer.remaining % 60;
    const timerStr = `${timerMins}:${timerSecs.toString().padStart(2, '0')}`;

    // Current challenge info
    const challenge = currentRound?.challenge;
    const diffBadge = currentRound ? difficultyBadgeMap[currentRound.difficulty] : null;

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

    useEffect(() => {
        const interval = setInterval(() => {
            setAiTyping((prev) => !prev);
        }, 2400);
        return () => clearInterval(interval);
    }, []);

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
                                <p className="battle-text-muted" style={{ marginBottom: '1rem' }}>{challenge.description}</p>

                                <div className="battle-challenge-meta">
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
                            <select className="battle-language-select">
                                <option>JavaScript</option>
                                <option>Python</option>
                            </select>
                        </div>
                        <div className="battle-editor-area">
                            <pre>
    {`function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
          return [map.get(complement), i];
        }
        map.set(nums[i], i);
      }
      return [];
    }`}
                            </pre>
                        </div>
                        <div className="battle-editor-actions">
                            <button className="battle-btn battle-btn--primary battle-btn--lg">Run Code</button>
                            <button className="battle-btn battle-btn--secondary battle-btn--lg">Submit</button>
                            <button
                                className="battle-btn battle-btn--secondary"
                                onClick={() => simulateCompleteRound(battle.id)}
                                title="Simulate completing this round with random scores"
                            >
                                ⚡ Simulate Round
                            </button>
                        </div>
                        <div className="battle-console">
                            <div className="battle-console-title">Console Output</div>
                            <div className="battle-console-line">✓ Test case 1 passed</div>
                            <div className="battle-console-line">✓ Test case 2 passed</div>
                            <div className="battle-console-meta">Runtime: 52ms • Memory: 42.1MB</div>
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
                            <span>{aiTyping ? 'Typing...' : 'Idle'}</span>
                        </div>
                        <div className="battle-typing-indicator">
                            <span className={`typing-dot ${aiTyping ? 'typing-dot--active' : ''}`} />
                            <span className={`typing-dot ${aiTyping ? 'typing-dot--active' : ''}`} />
                            <span className={`typing-dot ${aiTyping ? 'typing-dot--active' : ''}`} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ActiveBattlePage;
