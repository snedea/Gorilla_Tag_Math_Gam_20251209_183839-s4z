/**
 * Difficulty Manager Unit Tests
 * Tests for adaptive difficulty logic
 */

// Require the module for Node.js environment
const DifficultyManager = require('../js/difficulty-manager.js');

describe('DifficultyManager', () => {
    beforeEach(() => {
        // Reset to initial state before each test
        DifficultyManager.reset(1);
    });

    describe('getCurrentDifficulty', () => {
        test('starts at level 1 by default', () => {
            expect(DifficultyManager.getCurrentDifficulty()).toBe(1);
        });

        test('can start at specified level', () => {
            DifficultyManager.reset(2);
            expect(DifficultyManager.getCurrentDifficulty()).toBe(2);
        });

        test('clamps starting level to valid range', () => {
            DifficultyManager.reset(0);
            expect(DifficultyManager.getCurrentDifficulty()).toBe(1);

            DifficultyManager.reset(5);
            expect(DifficultyManager.getCurrentDifficulty()).toBe(3);
        });
    });

    describe('getDifficultyName', () => {
        test('returns correct names', () => {
            DifficultyManager.reset(1);
            expect(DifficultyManager.getDifficultyName()).toBe('Easy');

            DifficultyManager.reset(2);
            expect(DifficultyManager.getDifficultyName()).toBe('Medium');

            DifficultyManager.reset(3);
            expect(DifficultyManager.getDifficultyName()).toBe('Hard');
        });
    });

    describe('setDifficulty', () => {
        test('sets difficulty level directly', () => {
            DifficultyManager.setDifficulty(3);
            expect(DifficultyManager.getCurrentDifficulty()).toBe(3);
        });

        test('clamps to valid range', () => {
            DifficultyManager.setDifficulty(0);
            expect(DifficultyManager.getCurrentDifficulty()).toBe(1);

            DifficultyManager.setDifficulty(10);
            expect(DifficultyManager.getCurrentDifficulty()).toBe(3);
        });

        test('resets streaks when set', () => {
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();
            DifficultyManager.setDifficulty(2);
            
            const state = DifficultyManager.getState();
            expect(state.correctStreak).toBe(0);
        });
    });

    describe('recordCorrect', () => {
        test('increments correct streak', () => {
            DifficultyManager.recordCorrect();
            expect(DifficultyManager.getState().correctStreak).toBe(1);

            DifficultyManager.recordCorrect();
            expect(DifficultyManager.getState().correctStreak).toBe(2);
        });

        test('resets incorrect streak', () => {
            DifficultyManager.recordIncorrect();
            DifficultyManager.recordIncorrect();
            DifficultyManager.recordCorrect();
            
            expect(DifficultyManager.getState().incorrectStreak).toBe(0);
        });

        test('levels up after 3 correct in a row', () => {
            DifficultyManager.reset(1);
            
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();
            const result = DifficultyManager.recordCorrect();

            expect(result.levelChanged).toBe(true);
            expect(result.newLevel).toBe(2);
            expect(result.direction).toBe('up');
        });

        test('does not level up past max', () => {
            DifficultyManager.reset(3);
            
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();
            const result = DifficultyManager.recordCorrect();

            expect(result.levelChanged).toBe(false);
            expect(result.newLevel).toBe(3);
        });

        test('resets streak after level up', () => {
            DifficultyManager.reset(1);
            
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();

            expect(DifficultyManager.getState().correctStreak).toBe(0);
        });
    });

    describe('recordIncorrect', () => {
        test('increments incorrect streak', () => {
            DifficultyManager.recordIncorrect();
            expect(DifficultyManager.getState().incorrectStreak).toBe(1);
        });

        test('resets correct streak', () => {
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();
            DifficultyManager.recordIncorrect();
            
            expect(DifficultyManager.getState().correctStreak).toBe(0);
        });

        test('levels down after 3 incorrect in a row', () => {
            DifficultyManager.reset(2);
            
            DifficultyManager.recordIncorrect();
            DifficultyManager.recordIncorrect();
            const result = DifficultyManager.recordIncorrect();

            expect(result.levelChanged).toBe(true);
            expect(result.newLevel).toBe(1);
            expect(result.direction).toBe('down');
        });

        test('does not level down past min', () => {
            DifficultyManager.reset(1);
            
            DifficultyManager.recordIncorrect();
            DifficultyManager.recordIncorrect();
            const result = DifficultyManager.recordIncorrect();

            expect(result.levelChanged).toBe(false);
            expect(result.newLevel).toBe(1);
        });
    });

    describe('adjustDifficulty', () => {
        test('can trigger level up with direct streak count', () => {
            DifficultyManager.reset(1);
            const result = DifficultyManager.adjustDifficulty(3, 0);

            expect(result.levelChanged).toBe(true);
            expect(result.direction).toBe('up');
        });

        test('can trigger level down with direct streak count', () => {
            DifficultyManager.reset(2);
            const result = DifficultyManager.adjustDifficulty(0, 3);

            expect(result.levelChanged).toBe(true);
            expect(result.direction).toBe('down');
        });
    });

    describe('getState', () => {
        test('returns complete state object', () => {
            const state = DifficultyManager.getState();

            expect(state).toHaveProperty('difficulty');
            expect(state).toHaveProperty('difficultyName');
            expect(state).toHaveProperty('correctStreak');
            expect(state).toHaveProperty('incorrectStreak');
            expect(state).toHaveProperty('progressToLevelUp');
            expect(state).toHaveProperty('progressToLevelDown');
        });

        test('calculates progress correctly', () => {
            DifficultyManager.reset(1);
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();

            const state = DifficultyManager.getState();
            expect(state.progressToLevelUp).toBeCloseTo(2/3, 2);
        });
    });

    describe('getStats', () => {
        test('returns complete stats object', () => {
            const stats = DifficultyManager.getStats();

            expect(stats).toHaveProperty('currentLevel');
            expect(stats).toHaveProperty('levelName');
            expect(stats).toHaveProperty('correctsUntilLevelUp');
            expect(stats).toHaveProperty('incorrectsUntilLevelDown');
            expect(stats).toHaveProperty('canLevelUp');
            expect(stats).toHaveProperty('canLevelDown');
        });

        test('correctly calculates remaining for level change', () => {
            DifficultyManager.reset(2);
            DifficultyManager.recordCorrect();

            const stats = DifficultyManager.getStats();
            expect(stats.correctsUntilLevelUp).toBe(2);
        });
    });

    describe('getAllowedOperations', () => {
        test('returns operations based on current level', () => {
            DifficultyManager.reset(1);
            expect(DifficultyManager.getAllowedOperations()).toEqual(['+', '-']);

            DifficultyManager.reset(2);
            expect(DifficultyManager.getAllowedOperations()).toEqual(['+', '-', '*']);

            DifficultyManager.reset(3);
            expect(DifficultyManager.getAllowedOperations()).toEqual(['+', '-', '*', '/']);
        });
    });

    describe('reset', () => {
        test('resets all state', () => {
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect();
            DifficultyManager.recordCorrect(); // Level up
            
            DifficultyManager.reset(1);

            const state = DifficultyManager.getState();
            expect(state.difficulty).toBe(1);
            expect(state.correctStreak).toBe(0);
            expect(state.incorrectStreak).toBe(0);
        });
    });
});
