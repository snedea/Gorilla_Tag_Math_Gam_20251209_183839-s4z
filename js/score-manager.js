/**
 * Score Manager Module
 * Tracks scores, streaks, and persists to localStorage
 */

const ScoreManager = (function() {
    'use strict';

    // localStorage key for player data
    const STORAGE_KEY = 'gorillaTagMath_playerData';

    // Points configuration
    const POINTS = {
        CORRECT_BASE: 10,
        STREAK_BONUS: 5,     // Extra points per streak level
        LEVEL_MULTIPLIER: 1.5 // Multiplier for higher difficulty levels
    };

    // Current game state
    let gameState = {
        current: 0,
        streak: 0,
        bestStreakThisGame: 0,
        totalCorrect: 0,
        totalAttempted: 0
    };

    // Persistent player data
    let playerData = {
        highScore: 0,
        totalGamesPlayed: 0,
        totalProblemsAttempted: 0,
        totalCorrectAnswers: 0,
        lastDifficulty: 1,
        soundEnabled: true,
        lastPlayed: null
    };

    /**
     * Loads player data from localStorage
     */
    function loadPlayerData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                playerData = { ...playerData, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load player data:', error);
        }
    }

    /**
     * Saves player data to localStorage
     */
    function savePlayerData() {
        try {
            playerData.lastPlayed = new Date().toISOString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
        } catch (error) {
            console.warn('Failed to save player data:', error);
        }
    }

    /**
     * Calculates points for a correct answer
     * @param {number} streak - Current streak count
     * @param {number} difficulty - Current difficulty level
     * @returns {number} Points earned
     */
    function calculatePoints(streak, difficulty) {
        const basePoints = POINTS.CORRECT_BASE;
        const streakBonus = Math.max(0, (streak - 1)) * POINTS.STREAK_BONUS;
        const levelMultiplier = 1 + ((difficulty - 1) * (POINTS.LEVEL_MULTIPLIER - 1));

        return Math.round((basePoints + streakBonus) * levelMultiplier);
    }

    /**
     * Updates score after answer submission
     * @param {boolean} correct - Whether the answer was correct
     * @param {number} [difficulty=1] - Current difficulty level
     * @returns {object} ScoreState with points earned
     */
    function updateScore(correct, difficulty = 1) {
        gameState.totalAttempted++;
        playerData.totalProblemsAttempted++;

        let pointsEarned = 0;

        if (correct) {
            gameState.streak++;
            gameState.totalCorrect++;
            playerData.totalCorrectAnswers++;

            // Track best streak this game
            if (gameState.streak > gameState.bestStreakThisGame) {
                gameState.bestStreakThisGame = gameState.streak;
            }

            // Calculate and add points
            pointsEarned = calculatePoints(gameState.streak, difficulty);
            gameState.current += pointsEarned;
        } else {
            // Reset streak on incorrect answer
            gameState.streak = 0;
        }

        return {
            ...getScore(),
            pointsEarned,
            wasCorrect: correct
        };
    }

    /**
     * Gets current score state
     * @returns {object} ScoreState
     */
    function getScore() {
        return {
            current: gameState.current,
            streak: gameState.streak,
            highScore: playerData.highScore,
            totalCorrect: gameState.totalCorrect,
            totalAttempted: gameState.totalAttempted,
            bestStreakThisGame: gameState.bestStreakThisGame,
            accuracy: gameState.totalAttempted > 0
                ? Math.round((gameState.totalCorrect / gameState.totalAttempted) * 100)
                : 0
        };
    }

    /**
     * Gets the player's persistent data
     * @returns {object} Player data
     */
    function getPlayerData() {
        return { ...playerData };
    }

    /**
     * Resets current game score (keeps player data)
     */
    function resetGame() {
        gameState = {
            current: 0,
            streak: 0,
            bestStreakThisGame: 0,
            totalCorrect: 0,
            totalAttempted: 0
        };
    }

    /**
     * Ends the current game and updates persistent data
     * @returns {object} Final game results
     */
    function endGame() {
        playerData.totalGamesPlayed++;

        const isNewHighScore = gameState.current > playerData.highScore;

        if (isNewHighScore) {
            playerData.highScore = gameState.current;
        }

        savePlayerData();

        return {
            finalScore: gameState.current,
            problemsSolved: gameState.totalCorrect,
            totalProblems: gameState.totalAttempted,
            bestStreak: gameState.bestStreakThisGame,
            accuracy: gameState.totalAttempted > 0
                ? Math.round((gameState.totalCorrect / gameState.totalAttempted) * 100)
                : 0,
            isNewHighScore,
            highScore: playerData.highScore
        };
    }

    /**
     * Saves high score to persistent storage
     */
    function saveHighScore() {
        if (gameState.current > playerData.highScore) {
            playerData.highScore = gameState.current;
            savePlayerData();
            return true;
        }
        return false;
    }

    /**
     * Gets the current high score
     * @returns {number} High score
     */
    function getHighScore() {
        return playerData.highScore;
    }

    /**
     * Sets the last used difficulty level
     * @param {number} difficulty - Difficulty level
     */
    function setLastDifficulty(difficulty) {
        playerData.lastDifficulty = difficulty;
        savePlayerData();
    }

    /**
     * Gets the last used difficulty level
     * @returns {number} Last difficulty level
     */
    function getLastDifficulty() {
        return playerData.lastDifficulty || 1;
    }

    /**
     * Sets sound preference
     * @param {boolean} enabled - Whether sound is enabled
     */
    function setSoundEnabled(enabled) {
        playerData.soundEnabled = enabled;
        savePlayerData();
    }

    /**
     * Gets sound preference
     * @returns {boolean} Whether sound is enabled
     */
    function isSoundEnabled() {
        return playerData.soundEnabled;
    }

    /**
     * Gets lifetime statistics
     * @returns {object} Lifetime stats
     */
    function getLifetimeStats() {
        return {
            gamesPlayed: playerData.totalGamesPlayed,
            problemsAttempted: playerData.totalProblemsAttempted,
            correctAnswers: playerData.totalCorrectAnswers,
            highScore: playerData.highScore,
            accuracy: playerData.totalProblemsAttempted > 0
                ? Math.round((playerData.totalCorrectAnswers / playerData.totalProblemsAttempted) * 100)
                : 0,
            lastPlayed: playerData.lastPlayed
        };
    }

    /**
     * Clears all player data (reset to defaults)
     */
    function clearAllData() {
        playerData = {
            highScore: 0,
            totalGamesPlayed: 0,
            totalProblemsAttempted: 0,
            totalCorrectAnswers: 0,
            lastDifficulty: 1,
            soundEnabled: true,
            lastPlayed: null
        };
        resetGame();

        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to clear player data:', error);
        }
    }

    /**
     * Initializes the score manager
     */
    function init() {
        loadPlayerData();
    }

    // Initialize on load
    init();

    // Public API
    return {
        updateScore,
        getScore,
        getPlayerData,
        resetGame,
        endGame,
        saveHighScore,
        getHighScore,
        setLastDifficulty,
        getLastDifficulty,
        setSoundEnabled,
        isSoundEnabled,
        getLifetimeStats,
        clearAllData,
        init,
        // Expose for testing
        STORAGE_KEY,
        POINTS
    };
})();

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreManager;
}
