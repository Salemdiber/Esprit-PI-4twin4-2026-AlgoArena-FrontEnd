/**
 * ActiveBattlePage – live battle detail view
 *
 * Displays scoreboard, round timeline, current challenge,
 * and simulation controls.
 */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBattleState } from '../hooks/useBattleState';
import {
    BattleStatus,
    getTotalPlayerScore,
    getTotalOpponentScore,
    RoundStatus,
    difficultyBadgeMap,
} from '../types/battle.types';
import ScoreBoard from '../components/ScoreBoard';
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

    const playerScore = getTotalPlayerScore(battle);
    const opponentScore = getTotalOpponentScore(battle);
    const currentRound = battle.rounds[battle.currentRoundIndex] || null;

    // Format timer
    const timerMins = Math.floor(timer.remaining / 60);
    const timerSecs = timer.remaining % 60;
    const timerStr = `${timerMins}:${timerSecs.toString().padStart(2, '0')}`;

    // Current challenge info
    const challenge = currentRound?.challenge;
    const diffBadge = currentRound ? difficultyBadgeMap[currentRound.difficulty] : null;

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

                {/* Scoreboard */}
                <div className="battle-card battle-card--glow battle-mb-xl">
                    <ScoreBoard
                        battle={battle}
                        playerScore={playerScore}
                        opponentScore={opponentScore}
                    />
                </div>

                {/* Timeline */}
                <div className="battle-mb-xl">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">Round Timeline</h2>
                    <div className="battle-card">
                        <BattleTimeline rounds={battle.rounds} currentRoundIndex={battle.currentRoundIndex} />
                    </div>
                </div>

                {/* Current Challenge */}
                {currentRound && challenge && (
                    <div className="battle-mb-xl">
                        <h2 className="battle-text-xl battle-font-bold battle-mb-md">Current Challenge</h2>
                        <div className="battle-card battle-card--glow">
                            {/* Tags */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {diffBadge && (
                                    <span className={`battle-badge battle-badge--${diffBadge.color}`}>
                                        {diffBadge.label}
                                    </span>
                                )}
                                {challenge.tags.map(tag => (
                                    <span key={tag} className="battle-badge battle-badge--gray">{tag}</span>
                                ))}
                            </div>

                            <h3 className="battle-text-xl battle-font-bold" style={{ marginBottom: '0.75rem' }}>
                                {challenge.title}
                            </h3>
                            <p className="battle-text-muted battle-mb-md">{challenge.description}</p>

                            {/* Code Example */}
                            {challenge.example?.input && (
                                <div className="battle-code-block battle-mb-md">
                                    <pre style={{ margin: 0 }}>
                                        {`Input: ${challenge.example.input}\nOutput: ${challenge.example.output}\nExplanation: ${challenge.example.explanation}`}
                                    </pre>
                                </div>
                            )}

                            {/* Meta */}
                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>⏱️</span>
                                    <span className="battle-text-muted">
                                        Time Remaining: <strong className="battle-text-cyan">{timerStr}</strong>
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>⭐</span>
                                    <span className="battle-text-muted">
                                        Max Points: <strong className="battle-text-yellow">{challenge.maxPoints} XP</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button className="battle-btn battle-btn--primary battle-btn--lg" style={{ flex: 1 }}>
                                    Enter Coding Arena →
                                </button>
                                <button
                                    className="battle-btn battle-btn--secondary"
                                    onClick={() => simulateCompleteRound(battle.id)}
                                    title="Simulate completing this round with random scores"
                                >
                                    ⚡ Simulate Round
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveBattlePage;
