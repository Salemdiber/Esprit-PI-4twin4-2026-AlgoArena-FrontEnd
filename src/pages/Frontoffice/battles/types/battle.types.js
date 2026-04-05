/**
 * Battle Types & Constants
 * ========================
 * Central type definitions for the battle system.
 * Using JS enums (frozen objects) since this is a non-TS project.
 */

// ─── Enums ───────────────────────────────────────────────

export const BattleStatus = Object.freeze({
    WAITING: 'WAITING',
    ACTIVE: 'ACTIVE',
    LIVE: 'LIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
});

export const BattleMode = Object.freeze({
    ONE_VS_ONE: '1vs1',
    ONE_VS_AI: '1vsAI',
});

export const Difficulty = Object.freeze({
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
});

export const RoundStatus = Object.freeze({
    UPCOMING: 'UPCOMING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
});

export const RoundResult = Object.freeze({
    WON: 'WON',
    LOST: 'LOST',
    DRAW: 'DRAW',
    PENDING: 'PENDING',
});

// ─── Status → Badge color mapping ───────────────────────

export const statusBadgeMap = {
    [BattleStatus.WAITING]: { label: 'WAITING', color: 'yellow' },
    [BattleStatus.ACTIVE]: { label: 'ACTIVE', color: 'green' },
    [BattleStatus.LIVE]: { label: 'LIVE', color: 'green' },
    [BattleStatus.COMPLETED]: { label: 'COMPLETED', color: 'gray' },
    [BattleStatus.CANCELLED]: { label: 'CANCELLED', color: 'red' },
};

export const modeBadgeMap = {
    [BattleMode.ONE_VS_ONE]: { label: '1vs1', color: 'cyan' },
    [BattleMode.ONE_VS_AI]: { label: '1vsAI', color: 'purple' },
};

export const difficultyBadgeMap = {
    [Difficulty.EASY]: { label: 'EASY', color: 'green' },
    [Difficulty.MEDIUM]: { label: 'MEDIUM', color: 'gray' },
    [Difficulty.HARD]: { label: 'HARD', color: 'red' },
};

// ─── Shape Reference (for documentation) ────────────────
/*
  Player: {
    id: string,
    name: string,
    avatar: string | null,
    level: number,
    league: string,
  }

  Round: {
    index: number,          // 0-based
    status: RoundStatus,
    result: RoundResult,
    difficulty: Difficulty,
    challenge: {
      title: string,
      description: string,
      tags: string[],
      example: { input: string, output: string, explanation: string },
      maxPoints: number,
    },
    playerScore: number,
    opponentScore: number,
    timeSpent: string,      // "mm:ss"
    efficiency: number,     // 0-100
  }

  Battle: {
    id: string,
    mode: BattleMode,
    status: BattleStatus,
    totalRounds: number,
    currentRoundIndex: number,   // 0-based, -1 if not started
    rounds: Round[],
    player: Player,
    opponent: Player | null,
    createdAt: Date,
    completedAt: Date | null,
    timeLimit: number,           // seconds per round
    difficulty: Difficulty,
  }
*/

// ─── Factory: create a blank round ──────────────────────

export function createRound(index, challenge = null) {
    return {
        index,
        status: RoundStatus.UPCOMING,
        result: RoundResult.PENDING,
        difficulty: Difficulty.MEDIUM,
        challenge: challenge || {
            title: `Challenge ${index + 1}`,
            description: 'Challenge description will appear here...',
            tags: [],
            example: { input: '', output: '', explanation: '' },
            maxPoints: 500,
        },
        playerScore: 0,
        opponentScore: 0,
        timeSpent: '0:00',
        efficiency: 0,
    };
}

// ─── Factory: create a battle ───────────────────────────

let _idCounter = 100;

export function createBattle({ mode, totalRounds, difficulty, timeLimit }) {
    const id = `battle-${++_idCounter}`;
    const rounds = Array.from({ length: totalRounds }, (_, i) => createRound(i));

    return {
        id,
        mode,
        status: BattleStatus.WAITING,
        totalRounds,
        currentRoundIndex: -1,
        rounds,
        player: {
            id: 'user-1',
            name: 'You',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
            level: 42,
            league: 'Gold League',
        },
        opponent: null,
        createdAt: new Date(),
        completedAt: null,
        timeLimit: timeLimit || 900, // 15 min default
        difficulty: difficulty || Difficulty.MEDIUM,
    };
}

// ─── Derived helpers ────────────────────────────────────

export function getTotalPlayerScore(battle) {
    return battle.rounds.reduce((sum, r) => sum + r.playerScore, 0);
}

export function getTotalOpponentScore(battle) {
    return battle.rounds.reduce((sum, r) => sum + r.opponentScore, 0);
}

export function getProgressPercent(battle) {
    if (battle.totalRounds === 0) return 0;
    const completed = battle.rounds.filter(r => r.status === RoundStatus.COMPLETED).length;
    return Math.round((completed / battle.totalRounds) * 100);
}

export function getRoundsWon(battle, side = 'player') {
    return battle.rounds.filter(r => {
        if (r.result === RoundResult.PENDING) return false;
        return side === 'player' ? r.result === RoundResult.WON : r.result === RoundResult.LOST;
    }).length;
}

export function getWinner(battle) {
    const playerWins = getRoundsWon(battle, 'player');
    const opponentWins = getRoundsWon(battle, 'opponent');
    if (playerWins > opponentWins) return 'player';
    if (opponentWins > playerWins) return 'opponent';
    return 'draw';
}

export function getXPEarned(battle) {
    const baseXP = getTotalPlayerScore(battle);
    const bonus = getWinner(battle) === 'player' ? 250 : 0;
    return baseXP + bonus;
}

export function getRankProgress(battle) {
    const winner = getWinner(battle);
    if (winner === 'player') return 45;
    if (winner === 'draw') return 10;
    return -20;
}

export function getAvgEfficiency(battle, side = 'player') {
    const completed = battle.rounds.filter(r => r.status === RoundStatus.COMPLETED);
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((sum, r) => sum + r.efficiency, 0) / completed.length);
}

export function getAvgTime(battle) {
    const completed = battle.rounds.filter(r => r.status === RoundStatus.COMPLETED);
    if (completed.length === 0) return '0:00';
    const totalSeconds = completed.reduce((sum, r) => {
        const parts = r.timeSpent.split(':');
        return sum + parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }, 0);
    const avgSeconds = Math.round(totalSeconds / completed.length);
    const mins = Math.floor(avgSeconds / 60);
    const secs = avgSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
