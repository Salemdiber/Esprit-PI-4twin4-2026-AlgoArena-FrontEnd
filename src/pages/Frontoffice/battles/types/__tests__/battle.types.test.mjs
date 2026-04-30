import {
    BattleMode,
    BattleStatus,
    Difficulty,
    RoundResult,
    RoundStatus,
    createBattle,
    createRound,
    difficultyBadgeMap,
    getAvgEfficiency,
    getAvgTime,
    getProgressPercent,
    getRankProgress,
    getRoundsWon,
    getTotalOpponentScore,
    getTotalPlayerScore,
    getWinner,
    getXPEarned,
    modeBadgeMap,
    statusBadgeMap,
} from '../battle.types.js';

describe('battle.types', () => {
    it('creates default rounds and battles with the exported enums and badge maps', () => {
        expect(BattleStatus.WAITING).toBe('WAITING');
        expect(BattleMode.ONE_VS_ONE).toBe('1vs1');
        expect(Difficulty.MEDIUM).toBe('MEDIUM');
        expect(RoundStatus.UPCOMING).toBe('UPCOMING');
        expect(RoundResult.PENDING).toBe('PENDING');
        expect(statusBadgeMap[BattleStatus.COMPLETED]).toMatchObject({ label: 'COMPLETED', color: 'gray' });
        expect(modeBadgeMap[BattleMode.ONE_VS_AI]).toMatchObject({ label: '1vsAI', color: 'purple' });
        expect(difficultyBadgeMap[Difficulty.HARD]).toMatchObject({ label: 'HARD', color: 'red' });

        const customChallenge = {
            title: 'Custom challenge',
            description: 'Solve it',
            tags: ['arrays'],
            example: { input: '1', output: '2', explanation: 'demo' },
            maxPoints: 900,
        };

        const round = createRound(2, customChallenge);
        expect(round).toMatchObject({
            index: 2,
            status: RoundStatus.UPCOMING,
            result: RoundResult.PENDING,
            difficulty: Difficulty.MEDIUM,
            challenge: customChallenge,
            playerScore: 0,
            opponentScore: 0,
            timeSpent: '0:00',
            efficiency: 0,
        });

        const battle = createBattle({
            mode: BattleMode.ONE_VS_AI,
            totalRounds: 3,
            difficulty: Difficulty.HARD,
            timeLimit: 600,
        });

        expect(battle.mode).toBe(BattleMode.ONE_VS_AI);
        expect(battle.status).toBe(BattleStatus.WAITING);
        expect(battle.totalRounds).toBe(3);
        expect(battle.rounds).toHaveLength(3);
        expect(battle.rounds[0].index).toBe(0);
        expect(battle.timeLimit).toBe(600);
        expect(battle.difficulty).toBe(Difficulty.HARD);
    });

    it('computes battle aggregates and tiebreakers', () => {
        const battle = {
            totalRounds: 2,
            rounds: [
                {
                    status: RoundStatus.COMPLETED,
                    result: RoundResult.WON,
                    playerScore: 80,
                    opponentScore: 40,
                    efficiency: 90,
                    timeSpent: '1:20',
                    playerResult: { executionTimeMs: 180 },
                    opponentResult: { executionTimeMs: 240 },
                },
                {
                    status: RoundStatus.COMPLETED,
                    result: RoundResult.LOST,
                    playerScore: 20,
                    opponentScore: 60,
                    efficiency: 60,
                    timeSpent: '2:40',
                    playerResult: { executionTimeMs: 220 },
                    opponentResult: { executionTimeMs: 210 },
                },
            ],
        };

        expect(getTotalPlayerScore(battle)).toBe(100);
        expect(getTotalOpponentScore(battle)).toBe(100);
        expect(getProgressPercent(battle)).toBe(100);
        expect(getRoundsWon(battle, 'player')).toBe(1);
        expect(getRoundsWon(battle, 'opponent')).toBe(1);
        expect(getWinner(battle)).toBe('draw');
        expect(getXPEarned(battle)).toBe(100);
        expect(getRankProgress(battle)).toBe(10);
        expect(getAvgEfficiency(battle)).toBe(75);
        expect(getAvgTime(battle)).toBe('2:00');
    });

    it('handles zero rounds and single-round execution tiebreaks', () => {
        const emptyBattle = { totalRounds: 0, rounds: [] };
        expect(getProgressPercent(emptyBattle)).toBe(0);
        expect(getAvgEfficiency(emptyBattle)).toBe(0);
        expect(getAvgTime(emptyBattle)).toBe('0:00');

        const timeBattle = {
            totalRounds: 1,
            rounds: [
                {
                    status: RoundStatus.COMPLETED,
                    result: RoundResult.PENDING,
                    playerScore: 50,
                    opponentScore: 50,
                    efficiency: 88,
                    timeSpent: '0:45',
                    playerResult: { executionTimeMs: 120 },
                    opponentResult: { executionTimeMs: 180 },
                },
            ],
        };

        expect(getWinner(timeBattle)).toBe('player');
        expect(getXPEarned(timeBattle)).toBe(300);
        expect(getRankProgress(timeBattle)).toBe(45);
    });
});