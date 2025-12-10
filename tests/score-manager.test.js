/**
 * Score Manager Unit Tests
 * Tests for score tracking and persistence
 */

// Mock localStorage for Node.js environment
const localStorageMock = {
    store: {},
    getItem: function(key) {
        return this.store[key] || null;
    },
    setItem: function(key, value) {
        this.store[key] = value.toString();
    },
    removeItem: function(key) {
        delete this.store[key];
    },
    clear: function() {
        this.store = {};
    }
};

// Set up global mock before requiring the module
global.localStorage = localStorageMock;

// Require the module for Node.js environment
const ScoreManager = require('../js/score-manager.js');

describe('ScoreManager', () => {
    beforeEach(() => {
        // Clear all data before each test
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
        ScoreManager.clearAllData();
        ScoreManager.init();
    });

    describe('getScore', () => {
        test('returns initial score state', () => {
            const score = ScoreManager.getScore();

            expect(score.current).toBe(0);
            expect(score.streak).toBe(0);
            expect(score.totalCorrect).toBe(0);
            expect(score.totalAttempted).toBe(0);
        });

        test('includes high score', () => {
            const score = ScoreManager.getScore();
            expect(score).toHaveProperty('highScore');
        });
    });

    describe('updateScore', () => {
        test('increments score on correct answer', () => {
            const result = ScoreManager.updateScore(true, 1);

            expect(result.current).toBeGreaterThan(0);
            expect(result.wasCorrect).toBe(true);
            expect(result.totalCorrect).toBe(1);
        });

        test('increments streak on correct answer', () => {
            ScoreManager.updateScore(true);
            const result = ScoreManager.updateScore(true);

            expect(result.streak).toBe(2);
        });

        test('resets streak on incorrect answer', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            const result = ScoreManager.updateScore(false);

            expect(result.streak).toBe(0);
        });

        test('does not increment score on incorrect answer', () => {
            const before = ScoreManager.getScore().current;
            ScoreManager.updateScore(false);
            const after = ScoreManager.getScore().current;

            expect(after).toBe(before);
        });

        test('increments total attempted regardless of correctness', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(false);
            const result = ScoreManager.updateScore(true);

            expect(result.totalAttempted).toBe(3);
        });

        test('awards bonus points for streaks', () => {
            const first = ScoreManager.updateScore(true, 1);
            const second = ScoreManager.updateScore(true, 1);

            // Second correct answer should have streak bonus
            expect(second.pointsEarned).toBeGreaterThanOrEqual(first.pointsEarned);
        });

        test('awards more points for higher difficulty', () => {
            ScoreManager.resetGame();
            const easy = ScoreManager.updateScore(true, 1);
            
            ScoreManager.resetGame();
            const hard = ScoreManager.updateScore(true, 3);

            expect(hard.pointsEarned).toBeGreaterThan(easy.pointsEarned);
        });

        test('tracks best streak this game', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(false);
            ScoreManager.updateScore(true);

            const score = ScoreManager.getScore();
            expect(score.bestStreakThisGame).toBe(3);
        });
    });

    describe('resetGame', () => {
        test('resets game state but keeps player data', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.resetGame();

            const score = ScoreManager.getScore();
            expect(score.current).toBe(0);
            expect(score.streak).toBe(0);
            expect(score.totalCorrect).toBe(0);
        });
    });

    describe('endGame', () => {
        test('returns final game results', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(false);

            const results = ScoreManager.endGame();

            expect(results).toHaveProperty('finalScore');
            expect(results).toHaveProperty('problemsSolved');
            expect(results).toHaveProperty('totalProblems');
            expect(results).toHaveProperty('accuracy');
            expect(results).toHaveProperty('isNewHighScore');
        });

        test('calculates accuracy correctly', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(false);
            ScoreManager.updateScore(true);

            const results = ScoreManager.endGame();
            expect(results.accuracy).toBe(75); // 3/4 = 75%
        });

        test('detects new high score', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);

            const results = ScoreManager.endGame();
            expect(results.isNewHighScore).toBe(true);
        });

        test('increments games played', () => {
            ScoreManager.endGame();
            ScoreManager.resetGame();
            ScoreManager.endGame();

            const stats = ScoreManager.getLifetimeStats();
            expect(stats.gamesPlayed).toBe(2);
        });
    });

    describe('getHighScore', () => {
        test('returns 0 initially', () => {
            expect(ScoreManager.getHighScore()).toBe(0);
        });

        test('returns high score after game', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.endGame();

            expect(ScoreManager.getHighScore()).toBeGreaterThan(0);
        });
    });

    describe('saveHighScore', () => {
        test('saves new high score', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);

            const saved = ScoreManager.saveHighScore();
            expect(saved).toBe(true);
        });

        test('does not save lower score', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.endGame();

            ScoreManager.resetGame();
            ScoreManager.updateScore(true);
            
            const saved = ScoreManager.saveHighScore();
            expect(saved).toBe(false);
        });
    });

    describe('sound settings', () => {
        test('sound is enabled by default', () => {
            expect(ScoreManager.isSoundEnabled()).toBe(true);
        });

        test('can toggle sound', () => {
            ScoreManager.setSoundEnabled(false);
            expect(ScoreManager.isSoundEnabled()).toBe(false);

            ScoreManager.setSoundEnabled(true);
            expect(ScoreManager.isSoundEnabled()).toBe(true);
        });
    });

    describe('difficulty settings', () => {
        test('default difficulty is 1', () => {
            expect(ScoreManager.getLastDifficulty()).toBe(1);
        });

        test('can set and get difficulty', () => {
            ScoreManager.setLastDifficulty(3);
            expect(ScoreManager.getLastDifficulty()).toBe(3);
        });
    });

    describe('getLifetimeStats', () => {
        test('returns complete stats object', () => {
            const stats = ScoreManager.getLifetimeStats();

            expect(stats).toHaveProperty('gamesPlayed');
            expect(stats).toHaveProperty('problemsAttempted');
            expect(stats).toHaveProperty('correctAnswers');
            expect(stats).toHaveProperty('highScore');
            expect(stats).toHaveProperty('accuracy');
        });

        test('tracks lifetime statistics', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.endGame();

            ScoreManager.resetGame();
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(false);
            ScoreManager.endGame();

            const stats = ScoreManager.getLifetimeStats();
            expect(stats.gamesPlayed).toBe(2);
            expect(stats.problemsAttempted).toBe(4);
            expect(stats.correctAnswers).toBe(3);
        });
    });

    describe('clearAllData', () => {
        test('resets all data to defaults', () => {
            ScoreManager.updateScore(true);
            ScoreManager.updateScore(true);
            ScoreManager.endGame();
            ScoreManager.setSoundEnabled(false);
            ScoreManager.setLastDifficulty(3);

            ScoreManager.clearAllData();
            ScoreManager.init();

            expect(ScoreManager.getHighScore()).toBe(0);
            expect(ScoreManager.isSoundEnabled()).toBe(true);
            expect(ScoreManager.getLastDifficulty()).toBe(1);
        });
    });
});
