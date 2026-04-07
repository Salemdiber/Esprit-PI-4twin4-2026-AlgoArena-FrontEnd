/**
 * CreateBattleModal – multi-step battle creation flow
 *
 * Step 1 → Select mode (1vs1 / 1vsAI)
 * Step 2 → Configure settings (rounds, difficulty, time)
 * Step 3 → Confirm & create
 */
import React, { useState, useEffect } from 'react';
import { useBattleState } from '../hooks/useBattleState';
import { BattleMode, Difficulty } from '../types/battle.types';
import { settingsService } from '../../../../services/settingsService';

const CreateBattleModal = () => {
    const {
        createModal,
        closeCreateModal,
        setCreateStep,
        setCreateMode,
        setCreateConfig,
        confirmCreateBattle,
        challenges,
    } = useBattleState();

    const [aiBattlesEnabled, setAiBattlesEnabled] = useState(true);

    useEffect(() => {
        if (createModal.isOpen) {
            settingsService.getSettings()
                .then((data) => setAiBattlesEnabled(data?.aiBattles ?? true))
                .catch(() => setAiBattlesEnabled(true));
        }
    }, [createModal.isOpen]);

    const { step, mode, totalRounds, difficulty, timeLimit, challengeType } = createModal;

    const typeOptions = React.useMemo(() => {
        const set = new Set();
        challenges.forEach((challenge) => {
            if (challenge?.type) set.add(challenge.type);
            if (Array.isArray(challenge?.tags)) challenge.tags.forEach((tag) => set.add(tag));
            if (challenge?.difficulty) set.add(challenge.difficulty);
        });
        return Array.from(set);
    }, [challenges]);

    const availableChallenges = React.useMemo(() => {
        const pool = challengeType
            ? challenges.filter((challenge) => (
                challenge?.type === challengeType
                || (Array.isArray(challenge?.tags) && challenge.tags.includes(challengeType))
                || challenge?.difficulty === challengeType
            ))
            : challenges;
        return Array.isArray(pool) ? pool : [];
    }, [challengeType, challenges]);

    const assignedChallenges = React.useMemo(() => {
        if (!availableChallenges.length) return [];
        // Do NOT cycle challenges: if not enough, surface it as insufficient.
        return availableChallenges.slice(0, Math.max(0, Number(totalRounds || 0)));
    }, [availableChallenges, totalRounds]);

    const hasEnoughChallenges = availableChallenges.length >= Number(totalRounds || 0);

    const canGoNext = () => {
        if (step === 1) return mode !== null;
        if (step === 2) return totalRounds >= 1 && totalRounds <= 10 && assignedChallenges.length === totalRounds && hasEnoughChallenges;
        return true;
    };

    if (!createModal.isOpen) return null;

    const handleNext = () => {
        if (step < 3) setCreateStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setCreateStep(step - 1);
    };

    const handleConfirm = () => {
        if (assignedChallenges.length === 0) return;
        confirmCreateBattle();
    };

    // Step circle helper
    const stepCircleClass = (s) => {
        if (s < step) return 'battle-step-circle battle-step-circle--done';
        if (s === step) return 'battle-step-circle battle-step-circle--active';
        return 'battle-step-circle battle-step-circle--inactive';
    };

    const stepLineClass = (s) =>
        s < step ? 'battle-step-line battle-step-line--active' : 'battle-step-line';

    const stepLabels = ['Mode', 'Configure', 'Confirm'];

    return (
        <div className="battle-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeCreateModal(); }}>
            <div className="battle-modal">
                {/* Header */}
                <div className="battle-flex-between battle-mb-lg">
                    <h2 className="battle-text-2xl battle-font-bold">Create New Battle</h2>
                    <button
                        onClick={closeCreateModal}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        ×
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="battle-step-indicator">
                    {stepLabels.map((label, i) => (
                        <React.Fragment key={i}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className={stepCircleClass(i + 1)}>
                                    {i + 1 < step ? '✓' : i + 1}
                                </div>
                                <span
                                    className="battle-text-xs"
                                    style={{
                                        color: i + 1 === step ? 'var(--color-cyan-400)' : 'var(--color-text-muted)',
                                        fontWeight: i + 1 === step ? 600 : 400,
                                        marginTop: '0.5rem',
                                    }}
                                >
                                    {label}
                                </span>
                            </div>
                            {i < stepLabels.length - 1 && <div className={stepLineClass(i + 1)} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                {step === 1 && <StepMode mode={mode} setCreateMode={setCreateMode} aiBattlesEnabled={aiBattlesEnabled} />}
                {step === 2 && (
                    <StepConfigure
                        totalRounds={totalRounds}
                        difficulty={difficulty}
                        timeLimit={timeLimit}
                        challengeType={challengeType}
                        typeOptions={typeOptions}
                        assignedChallenges={assignedChallenges}
                        availableCount={availableChallenges.length}
                        hasEnoughChallenges={hasEnoughChallenges}
                        setCreateConfig={setCreateConfig}
                    />
                )}
                {step === 3 && (
                    <StepConfirm
                        mode={mode}
                        totalRounds={totalRounds}
                        difficulty={difficulty}
                        timeLimit={timeLimit}
                        challengeType={challengeType}
                        assignedChallenges={assignedChallenges}
                    />
                )}

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', marginTop: '1.5rem' }}>
                    {step > 1 ? (
                        <button className="battle-btn battle-btn--secondary" onClick={handleBack}>← Back</button>
                    ) : (
                        <button className="battle-btn battle-btn--secondary" onClick={closeCreateModal}>Cancel</button>
                    )}

                    {step < 3 ? (
                        <button
                            className="battle-btn battle-btn--primary"
                            onClick={handleNext}
                            disabled={!canGoNext()}
                            style={{ opacity: canGoNext() ? 1 : 0.5 }}
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button className="battle-btn battle-btn--primary" onClick={handleConfirm}>
                            ⚔️ Create Battle
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Step 1: Choose Mode ────────────────────────────── */

const StepMode = ({ mode, setCreateMode, aiBattlesEnabled }) => (
    <div>
        <h3 className="battle-text-lg battle-font-semibold battle-mb-md">Choose Battle Mode</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div
                className={`battle-mode-card ${mode === BattleMode.ONE_VS_ONE ? 'battle-mode-card--selected' : ''}`}
                onClick={() => setCreateMode(BattleMode.ONE_VS_ONE)}
            >
                <div className="battle-mode-icon battle-mode-icon--pvp">👥</div>
                <h4 className="battle-font-bold battle-mb-sm" style={{ fontSize: '1.1rem' }}>1vs1 Battle</h4>
                <p className="battle-text-sm battle-text-muted">Compete against another player in real-time</p>
            </div>

            <div
                className={`battle-mode-card ${mode === BattleMode.ONE_VS_AI ? 'battle-mode-card--selected' : ''} ${!aiBattlesEnabled ? 'battle-mode-card--disabled' : ''}`}
                onClick={() => aiBattlesEnabled && setCreateMode(BattleMode.ONE_VS_AI)}
                style={!aiBattlesEnabled ? { opacity: 0.45, cursor: 'not-allowed', position: 'relative' } : {}}
            >
                <div className="battle-mode-icon battle-mode-icon--ai">AI</div>
                <h4 className="battle-font-bold battle-mb-sm" style={{ fontSize: '1.1rem' }}>1vsAI Battle</h4>
                <p className="battle-text-sm battle-text-muted">
                    {aiBattlesEnabled
                        ? 'Challenge our AI opponent at various difficulty levels'
                        : 'AI Battles are currently disabled by admin'}
                </p>
                {!aiBattlesEnabled && (
                    <span style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderRadius: '9999px',
                        background: 'var(--color-error-bg)',
                        color: 'var(--color-red-500)',
                        border: '1px solid var(--color-red-500)',
                    }}>Disabled</span>
                )}
            </div>
        </div>
    </div>
);

/* ── Step 2: Configure ──────────────────────────────── */

const StepConfigure = ({
    totalRounds,
    difficulty,
    timeLimit,
    challengeType,
    typeOptions,
    assignedChallenges,
    availableCount,
    hasEnoughChallenges,
    setCreateConfig,
}) => (
    <div>
        <h3 className="battle-text-lg battle-font-semibold battle-mb-md">Configure Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Rounds */}
            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Number of Rounds
                </label>
                <select
                    className="battle-select"
                    value={totalRounds}
                    onChange={(e) => setCreateConfig({ totalRounds: parseInt(e.target.value) })}
                >
                    {[1, 3, 5, 7, 10].map(n => (
                        <option key={n} value={n}>Best of {n}</option>
                    ))}
                </select>
                {!hasEnoughChallenges && (
                    <div
                        style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem 0.9rem',
                            borderRadius: '12px',
                            border: '1px solid var(--color-red-500)',
                            background: 'var(--color-error-bg)',
                            color: 'var(--color-red-500)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                        }}
                    >
                        Not enough challenges for Best of {totalRounds}. Available: {availableCount}. Reduce rounds.
                    </div>
                )}
            </div>

            {/* Difficulty */}
            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Difficulty
                </label>
                <select
                    className="battle-select"
                    value={difficulty}
                    onChange={(e) => setCreateConfig({ difficulty: e.target.value })}
                >
                    <option value={Difficulty.EASY}>Easy</option>
                    <option value={Difficulty.MEDIUM}>Medium</option>
                    <option value={Difficulty.HARD}>Hard</option>
                </select>
            </div>

            {/* Challenge Type */}
            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Challenge Type
                </label>
                <select
                    className="battle-select"
                    value={challengeType}
                    onChange={(e) => setCreateConfig({ challengeType: e.target.value })}
                >
                    <option value="">All Types</option>
                    {typeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Assigned Challenges */}
            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Challenges by Round
                </label>
                <div className="battle-card" style={{ border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {assignedChallenges.length === 0 ? (
                            <span className="battle-text-sm battle-text-muted">No challenges available.</span>
                        ) : (
                            assignedChallenges.map((challenge, idx) => (
                                <span key={`round-${idx}`} className="battle-text-sm">
                                    Round {idx + 1}: {challenge?.title || '—'}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Time Limit */}
            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Time Limit per Round
                </label>
                <select
                    className="battle-select"
                    value={timeLimit}
                    onChange={(e) => setCreateConfig({ timeLimit: parseInt(e.target.value) })}
                >
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                    <option value={900}>15 minutes</option>
                    <option value={1200}>20 minutes</option>
                    <option value={1800}>30 minutes</option>
                </select>
            </div>
        </div>
    </div>
);

/* ── Step 3: Confirm ────────────────────────────────── */

const StepConfirm = ({ mode, totalRounds, difficulty, timeLimit, challengeType, assignedChallenges }) => {
    const modeLabel = mode === BattleMode.ONE_VS_ONE ? '1vs1 Battle' : '1vsAI Battle';
    const timeMins = Math.floor(timeLimit / 60);

    return (
        <div>
            <h3 className="battle-text-lg battle-font-semibold battle-mb-md">Confirm Battle</h3>
            <div className="battle-card" style={{ border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Mode</span>
                        <span className="battle-font-semibold">{modeLabel}</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Rounds</span>
                        <span className="battle-font-semibold">Best of {totalRounds}</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Difficulty</span>
                        <span className="battle-font-semibold" style={{ color: difficulty === 'HARD' ? 'var(--color-red-500)' : difficulty === 'EASY' ? 'var(--color-green-500)' : 'var(--color-yellow-500)' }}>
                            {difficulty}
                        </span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Time per Round</span>
                        <span className="battle-font-semibold">{timeMins} minutes</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Challenge Type</span>
                        <span className="battle-font-semibold">{challengeType || 'All Types'}</span>
                    </div>
                    <div>
                        <span className="battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Challenges by Round
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {assignedChallenges.length === 0 ? (
                                <span className="battle-text-sm battle-text-muted">No challenges available.</span>
                            ) : (
                                assignedChallenges.map((challenge, idx) => (
                                    <span key={`confirm-round-${idx}`} className="battle-text-sm">
                                        Round {idx + 1}: {challenge?.title || '—'}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--color-info-bg)', borderRadius: '12px', border: '1px solid var(--color-glass-border-strong)' }}>
                <p className="battle-text-sm battle-text-cyan">
                    {mode === BattleMode.ONE_VS_AI
                        ? 'You will immediately enter the battle against the AI.'
                        : '⏳ Your battle will be created with WAITING status until an opponent joins.'
                    }
                </p>
            </div>
        </div>
    );
};

export default CreateBattleModal;
