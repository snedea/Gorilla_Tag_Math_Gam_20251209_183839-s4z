/**
 * Game Controller Module
 * Orchestrates game flow and state transitions
 */

const GameController = (function() {
    'use strict';

    // Game states
    const STATES = {
        MENU: 'menu',
        PLAYING: 'playing',
        FEEDBACK: 'feedback',
        PAUSED: 'paused',
        GAMEOVER: 'gameover'
    };

    // Game configuration
    const CONFIG = {
        problemsPerGame: 20,      // Total problems per game
        feedbackDuration: 800,    // Duration to show feedback (ms)
        timeBetweenProblems: 500  // Delay before next problem (ms)
    };

    // Current game state
    let state = {
        status: STATES.MENU,
        currentProblem: null,
        problemNumber: 0,
        startingDifficulty: 1
    };

    // Module references
    let modules = {
        mathEngine: null,
        difficultyManager: null,
        scoreManager: null,
        uiController: null,
        themeEngine: null
    };

    /**
     * Initializes the game controller with module references
     * @param {object} deps - Module dependencies
     */
    function init(deps) {
        modules.mathEngine = deps.mathEngine || MathEngine;
        modules.difficultyManager = deps.difficultyManager || DifficultyManager;
        modules.scoreManager = deps.scoreManager || ScoreManager;
        modules.uiController = deps.uiController || UIController;
        modules.themeEngine = deps.themeEngine || ThemeEngine;

        // Initialize UI callbacks
        setupUICallbacks();

        // Load saved settings
        loadSettings();

        // Update UI with initial values
        updateMenuDisplay();
    }

    /**
     * Sets up UI callback functions
     */
    function setupUICallbacks() {
        modules.uiController.setCallbacks({
            onStartGame: startGame,
            onSubmitAnswer: submitAnswer,
            onPauseGame: pauseGame,
            onResumeGame: resumeGame,
            onQuitGame: quitGame,
            onPlayAgain: playAgain,
            onGoToMenu: goToMenu,
            onSettingsChange: handleSettingsChange
        });
    }

    /**
     * Loads saved settings
     */
    function loadSettings() {
        state.startingDifficulty = modules.scoreManager.getLastDifficulty() || 1;
        var soundEnabled = modules.scoreManager.isSoundEnabled();
        modules.themeEngine.setSoundEnabled(soundEnabled);

        modules.uiController.updateSettingsDisplay({
            soundEnabled: soundEnabled,
            startingDifficulty: state.startingDifficulty
        });
    }

    /**
     * Updates menu display with current values
     */
    function updateMenuDisplay() {
        var highScore = modules.scoreManager.getHighScore();
        modules.uiController.updateHighScoreDisplay(highScore);
    }

    /**
     * Handles settings changes
     * @param {object} settings - Changed settings
     */
    function handleSettingsChange(settings) {
        if (settings.soundEnabled !== undefined) {
            modules.themeEngine.setSoundEnabled(settings.soundEnabled);
            modules.scoreManager.setSoundEnabled(settings.soundEnabled);
        }

        if (settings.startingDifficulty !== undefined) {
            state.startingDifficulty = settings.startingDifficulty;
            modules.scoreManager.setLastDifficulty(settings.startingDifficulty);
        }
    }

    /**
     * Starts a new game
     */
    function startGame() {
        // Reset game state
        state.status = STATES.PLAYING;
        state.problemNumber = 0;

        // Reset managers
        modules.scoreManager.resetGame();
        modules.difficultyManager.reset(state.startingDifficulty);

        // Update theme
        modules.themeEngine.setDifficultyTheme(state.startingDifficulty);

        // Show game screen
        modules.uiController.showScreen(modules.uiController.SCREENS.GAME);

        // Update displays
        updateGameDisplay();

        // Generate first problem
        nextProblem();
    }

    /**
     * Generates and displays the next problem
     */
    function nextProblem() {
        if (state.status !== STATES.PLAYING) return;

        state.problemNumber++;

        // Check if game is over
        if (state.problemNumber > CONFIG.problemsPerGame) {
            endGame();
            return;
        }

        // Get current difficulty
        var difficulty = modules.difficultyManager.getCurrentDifficulty();

        // Generate problem
        state.currentProblem = modules.mathEngine.generateProblem(null, difficulty);

        // Update UI
        modules.uiController.displayProblem(state.currentProblem);
        modules.uiController.updateProgress((state.problemNumber - 1) / CONFIG.problemsPerGame);
        modules.uiController.updateDifficultyDisplay(difficulty);
    }

    /**
     * Handles answer submission
     * @param {number} answer - The submitted answer
     */
    function submitAnswer(answer) {
        if (state.status !== STATES.PLAYING || !state.currentProblem) return;

        state.status = STATES.FEEDBACK;

        // Check answer
        var isCorrect = modules.mathEngine.checkAnswer(answer, state.currentProblem.correctAnswer);

        // Get current difficulty for scoring
        var difficulty = modules.difficultyManager.getCurrentDifficulty();

        // Update score
        var scoreResult = modules.scoreManager.updateScore(isCorrect, difficulty);

        // Update difficulty based on result
        var difficultyResult = isCorrect 
            ? modules.difficultyManager.recordCorrect()
            : modules.difficultyManager.recordIncorrect();

        // Update UI
        modules.uiController.showFeedback(isCorrect, isCorrect ? null : state.currentProblem.correctAnswer);
        modules.uiController.updateScoreDisplay(modules.scoreManager.getScore());

        // Play animations
        if (isCorrect) {
            modules.themeEngine.playCelebration();
            modules.themeEngine.showFloatingPoints(
                scoreResult.pointsEarned,
                document.getElementById('current-score')
            );
        } else {
            modules.themeEngine.playEncouragement();
        }

        // Handle difficulty change
        if (difficultyResult.levelChanged) {
            handleDifficultyChange(difficultyResult);
        }

        // Update streak-based background
        modules.themeEngine.updateBackground(scoreResult.streak);

        // Proceed to next problem after delay
        setTimeout(function() {
            if (state.status === STATES.FEEDBACK) {
                state.status = STATES.PLAYING;
                nextProblem();
            }
        }, isCorrect ? CONFIG.feedbackDuration : CONFIG.feedbackDuration + 400);
    }

    /**
     * Handles difficulty level change
     * @param {object} result - Difficulty change result
     */
    function handleDifficultyChange(result) {
        modules.uiController.updateDifficultyDisplay(result.newLevel);
        modules.themeEngine.setDifficultyTheme(result.newLevel);

        if (result.direction === 'up') {
            modules.themeEngine.playLevelUp();
            modules.uiController.showGorillaSpeech('Level Up! ' + result.difficultyName, 2000);
        } else if (result.direction === 'down') {
            modules.uiController.showGorillaSpeech(modules.themeEngine.getRandomMessage('levelDown'), 2000);
        }
    }

    /**
     * Pauses the game
     */
    function pauseGame() {
        if (state.status !== STATES.PLAYING && state.status !== STATES.FEEDBACK) return;

        state.status = STATES.PAUSED;

        var score = modules.scoreManager.getScore();
        modules.uiController.showPauseModal({
            score: score.current,
            problemsSolved: score.totalCorrect
        });
    }

    /**
     * Resumes the game
     */
    function resumeGame() {
        if (state.status !== STATES.PAUSED) return;

        state.status = STATES.PLAYING;
        modules.uiController.hidePauseModal();
    }

    /**
     * Quits the current game
     */
    function quitGame() {
        endGame();
    }

    /**
     * Ends the current game
     */
    function endGame() {
        state.status = STATES.GAMEOVER;

        // Get final results
        var results = modules.scoreManager.endGame();

        // Show game over screen
        modules.uiController.showGameOver(results);

        // Play celebration if new high score
        if (results.isNewHighScore) {
            var container = document.getElementById('confetti-container');
            modules.themeEngine.createConfetti(container);
        }

        // Update menu high score for next visit
        updateMenuDisplay();
    }

    /**
     * Starts a new game after game over
     */
    function playAgain() {
        startGame();
    }

    /**
     * Returns to the main menu
     */
    function goToMenu() {
        state.status = STATES.MENU;
        state.currentProblem = null;
        state.problemNumber = 0;

        modules.uiController.showScreen(modules.uiController.SCREENS.MENU);
        updateMenuDisplay();
    }

    /**
     * Updates the game display
     */
    function updateGameDisplay() {
        var score = modules.scoreManager.getScore();
        var difficulty = modules.difficultyManager.getCurrentDifficulty();

        modules.uiController.updateScoreDisplay(score);
        modules.uiController.updateDifficultyDisplay(difficulty);
        modules.uiController.updateProgress(0);
    }

    /**
     * Gets the current game state
     * @returns {object} Current state
     */
    function getState() {
        return {
            status: state.status,
            currentProblem: state.currentProblem,
            problemNumber: state.problemNumber,
            totalProblems: CONFIG.problemsPerGame
        };
    }

    /**
     * Checks if the game is in progress
     * @returns {boolean} True if game is active
     */
    function isPlaying() {
        return state.status === STATES.PLAYING || state.status === STATES.FEEDBACK;
    }

    // Public API
    return {
        init: init,
        startGame: startGame,
        submitAnswer: submitAnswer,
        pauseGame: pauseGame,
        resumeGame: resumeGame,
        quitGame: quitGame,
        endGame: endGame,
        playAgain: playAgain,
        goToMenu: goToMenu,
        getState: getState,
        isPlaying: isPlaying,
        STATES: STATES,
        CONFIG: CONFIG
    };
})();

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
}
