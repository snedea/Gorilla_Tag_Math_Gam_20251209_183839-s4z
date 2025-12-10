/**
 * Difficulty Manager Module
 * Tracks performance and adjusts difficulty dynamically
 */

const DifficultyManager = (function() {
    'use strict';

    // Difficulty level constants
    const MIN_DIFFICULTY = 1;
    const MAX_DIFFICULTY = 3;

    // Thresholds for difficulty adjustment
    const STREAK_FOR_LEVEL_UP = 3;    // 3 correct in a row to level up
    const STREAK_FOR_LEVEL_DOWN = 3;  // 3 wrong in a row to level down

    // Difficulty level names
    const DIFFICULTY_NAMES = {
        1: 'Easy',
        2: 'Medium',
        3: 'Hard'
    };

    // Internal state
    let currentDifficulty = 1;
    let correctStreak = 0;
    let incorrectStreak = 0;
    let lastAdjustment = null;

    /**
     * Gets the current difficulty level
     * @returns {number} Current difficulty (1-3)
     */
    function getCurrentDifficulty() {
        return currentDifficulty;
    }

    /**
     * Gets the display name for the current difficulty
     * @returns {string} Difficulty name
     */
    function getDifficultyName() {
        return DIFFICULTY_NAMES[currentDifficulty] || 'Unknown';
    }

    /**
     * Gets the display name for a specific difficulty level
     * @param {number} level - Difficulty level
     * @returns {string} Difficulty name
     */
    function getDifficultyNameForLevel(level) {
        return DIFFICULTY_NAMES[level] || 'Unknown';
    }

    /**
     * Sets the difficulty level directly
     * @param {number} level - New difficulty level (1-3)
     */
    function setDifficulty(level) {
        const newLevel = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, level));
        currentDifficulty = newLevel;
        resetStreaks();
    }

    /**
     * Resets streak counters
     */
    function resetStreaks() {
        correctStreak = 0;
        incorrectStreak = 0;
    }

    /**
     * Records a correct answer and adjusts difficulty if needed
     * @returns {object} {levelChanged: boolean, newLevel: number, direction: 'up'|'down'|null}
     */
    function recordCorrect() {
        correctStreak++;
        incorrectStreak = 0;

        return checkForAdjustment();
    }

    /**
     * Records an incorrect answer and adjusts difficulty if needed
     * @returns {object} {levelChanged: boolean, newLevel: number, direction: 'up'|'down'|null}
     */
    function recordIncorrect() {
        incorrectStreak++;
        correctStreak = 0;

        return checkForAdjustment();
    }

    /**
     * Checks if difficulty should be adjusted based on streaks
     * @returns {object} {levelChanged: boolean, newLevel: number, direction: 'up'|'down'|null}
     */
    function checkForAdjustment() {
        let levelChanged = false;
        let direction = null;
        const previousLevel = currentDifficulty;

        // Check for level up
        if (correctStreak >= STREAK_FOR_LEVEL_UP && currentDifficulty < MAX_DIFFICULTY) {
            currentDifficulty++;
            levelChanged = true;
            direction = 'up';
            resetStreaks();
            lastAdjustment = { direction: 'up', timestamp: Date.now() };
        }
        // Check for level down
        else if (incorrectStreak >= STREAK_FOR_LEVEL_DOWN && currentDifficulty > MIN_DIFFICULTY) {
            currentDifficulty--;
            levelChanged = true;
            direction = 'down';
            resetStreaks();
            lastAdjustment = { direction: 'down', timestamp: Date.now() };
        }

        return {
            levelChanged,
            newLevel: currentDifficulty,
            previousLevel,
            direction,
            difficultyName: getDifficultyName()
        };
    }

    /**
     * Updates difficulty based on recent performance
     * @param {number} recentCorrect - Number of recent correct answers
     * @param {number} recentIncorrect - Number of recent incorrect answers
     * @returns {object} Adjustment result
     */
    function adjustDifficulty(recentCorrect, recentIncorrect) {
        correctStreak = recentCorrect;
        incorrectStreak = recentIncorrect;
        return checkForAdjustment();
    }

    /**
     * Gets allowed operations for the current difficulty level
     * @returns {string[]} Array of operation characters
     */
    function getAllowedOperations() {
        if (typeof MathEngine !== 'undefined') {
            return MathEngine.getAllowedOperations(currentDifficulty);
        }

        // Fallback if MathEngine is not loaded
        const operationsByLevel = {
            1: ['+', '-'],
            2: ['+', '-', '*'],
            3: ['+', '-', '*', '/']
        };
        return operationsByLevel[currentDifficulty] || ['+', '-'];
    }

    /**
     * Gets the current state of the difficulty manager
     * @returns {object} Current state
     */
    function getState() {
        return {
            difficulty: currentDifficulty,
            difficultyName: getDifficultyName(),
            correctStreak,
            incorrectStreak,
            progressToLevelUp: Math.min(correctStreak / STREAK_FOR_LEVEL_UP, 1),
            progressToLevelDown: Math.min(incorrectStreak / STREAK_FOR_LEVEL_DOWN, 1),
            lastAdjustment
        };
    }

    /**
     * Resets the difficulty manager to initial state
     * @param {number} [startingDifficulty=1] - Starting difficulty level
     */
    function reset(startingDifficulty = 1) {
        currentDifficulty = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, startingDifficulty));
        resetStreaks();
        lastAdjustment = null;
    }

    /**
     * Gets statistics about difficulty adjustments
     * @returns {object} Statistics
     */
    function getStats() {
        return {
            currentLevel: currentDifficulty,
            levelName: getDifficultyName(),
            correctStreak,
            incorrectStreak,
            streakForLevelUp: STREAK_FOR_LEVEL_UP,
            streakForLevelDown: STREAK_FOR_LEVEL_DOWN,
            canLevelUp: currentDifficulty < MAX_DIFFICULTY,
            canLevelDown: currentDifficulty > MIN_DIFFICULTY,
            correctsUntilLevelUp: STREAK_FOR_LEVEL_UP - correctStreak,
            incorrectsUntilLevelDown: STREAK_FOR_LEVEL_DOWN - incorrectStreak
        };
    }

    // Public API
    return {
        getCurrentDifficulty,
        getDifficultyName,
        getDifficultyNameForLevel,
        setDifficulty,
        recordCorrect,
        recordIncorrect,
        adjustDifficulty,
        getAllowedOperations,
        getState,
        getStats,
        reset,
        // Constants exposed for testing/configuration
        MIN_DIFFICULTY,
        MAX_DIFFICULTY,
        STREAK_FOR_LEVEL_UP,
        STREAK_FOR_LEVEL_DOWN,
        DIFFICULTY_NAMES
    };
})();

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DifficultyManager;
}
