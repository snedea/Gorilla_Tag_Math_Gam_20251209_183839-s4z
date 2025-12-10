/**
 * UI Controller Module
 * Manages DOM updates and user input
 */

const UIController = (function() {
    'use strict';

    // DOM element cache
    let elements = {};

    // Screen states
    const SCREENS = {
        MENU: 'menu',
        GAME: 'game',
        GAMEOVER: 'gameover'
    };

    // Current screen
    let currentScreen = SCREENS.MENU;

    // Callbacks for user actions
    let callbacks = {
        onStartGame: null,
        onSubmitAnswer: null,
        onPauseGame: null,
        onResumeGame: null,
        onQuitGame: null,
        onPlayAgain: null,
        onGoToMenu: null,
        onSettingsChange: null
    };

    /**
     * Caches all DOM elements for quick access
     */
    function cacheElements() {
        elements = {
            // Screens
            menuScreen: document.getElementById('menu-screen'),
            gameScreen: document.getElementById('game-screen'),
            gameoverScreen: document.getElementById('gameover-screen'),

            // Menu elements
            startBtn: document.getElementById('start-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            menuHighScore: document.getElementById('menu-high-score'),

            // Settings modal
            settingsModal: document.getElementById('settings-modal'),
            soundToggle: document.getElementById('sound-toggle'),
            difficultySelect: document.getElementById('difficulty-select'),
            closeSettings: document.getElementById('close-settings'),

            // Game elements
            problemCard: document.getElementById('problem-card'),
            problemText: document.getElementById('problem-text'),
            answerInput: document.getElementById('answer-input'),
            submitBtn: document.getElementById('submit-btn'),
            pauseBtn: document.getElementById('pause-btn'),

            // Game stats
            currentScore: document.getElementById('current-score'),
            currentStreak: document.getElementById('current-streak'),
            difficultyLevel: document.getElementById('difficulty-level'),
            streakFire: document.querySelector('.streak-fire'),
            progressFill: document.getElementById('progress-fill'),

            // Game gorilla
            gameGorilla: document.getElementById('game-gorilla'),
            gorillaSpeech: document.getElementById('gorilla-speech'),
            gorillaSpeechText: document.querySelector('#gorilla-speech .speech-text'),

            // Pause modal
            pauseModal: document.getElementById('pause-modal'),
            pauseScore: document.getElementById('pause-score'),
            pauseProblems: document.getElementById('pause-problems'),
            resumeBtn: document.getElementById('resume-btn'),
            quitBtn: document.getElementById('quit-btn'),

            // Feedback overlay
            feedbackOverlay: document.getElementById('feedback-overlay'),
            feedbackContent: document.querySelector('.feedback-content'),
            feedbackIcon: document.querySelector('.feedback-icon'),
            feedbackText: document.querySelector('.feedback-text'),

            // Game over elements
            finalScore: document.getElementById('final-score'),
            finalProblems: document.getElementById('final-problems'),
            finalStreak: document.getElementById('final-streak'),
            newHighScoreBadge: document.getElementById('new-high-score-badge'),
            playAgainBtn: document.getElementById('play-again-btn'),
            menuBtn: document.getElementById('menu-btn'),
            celebrationGorilla: document.getElementById('celebration-gorilla'),
            confettiContainer: document.getElementById('confetti-container')
        };
    }

    /**
     * Initializes event listeners
     */
    function initEventListeners() {
        // Menu buttons
        elements.startBtn?.addEventListener('click', handleStartGame);
        elements.settingsBtn?.addEventListener('click', handleOpenSettings);
        elements.closeSettings?.addEventListener('click', handleCloseSettings);

        // Settings
        elements.soundToggle?.addEventListener('click', handleSoundToggle);
        elements.difficultySelect?.addEventListener('change', handleDifficultyChange);

        // Game controls
        elements.submitBtn?.addEventListener('click', handleSubmitAnswer);
        elements.answerInput?.addEventListener('keypress', handleAnswerKeypress);
        elements.pauseBtn?.addEventListener('click', handlePauseGame);

        // Pause modal
        elements.resumeBtn?.addEventListener('click', handleResumeGame);
        elements.quitBtn?.addEventListener('click', handleQuitGame);

        // Game over buttons
        elements.playAgainBtn?.addEventListener('click', handlePlayAgain);
        elements.menuBtn?.addEventListener('click', handleGoToMenu);

        // Close modal on backdrop click
        elements.settingsModal?.addEventListener('click', handleModalBackdropClick);
        elements.pauseModal?.addEventListener('click', handleModalBackdropClick);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleGlobalKeydown);
    }

    /**
     * Handles modal backdrop click to close
     */
    function handleModalBackdropClick(event) {
        if (event.target === event.currentTarget) {
            event.currentTarget.classList.add('hidden');
        }
    }

    /**
     * Handles global keyboard shortcuts
     */
    function handleGlobalKeydown(event) {
        // Escape to close modals
        if (event.key === 'Escape') {
            if (!elements.settingsModal?.classList.contains('hidden')) {
                handleCloseSettings();
            }
            if (!elements.pauseModal?.classList.contains('hidden')) {
                handleResumeGame();
            }
        }
    }

    /**
     * Event Handlers
     */
    function handleStartGame() {
        if (callbacks.onStartGame) {
            callbacks.onStartGame();
        }
    }

    function handleOpenSettings() {
        elements.settingsModal?.classList.remove('hidden');
    }

    function handleCloseSettings() {
        elements.settingsModal?.classList.add('hidden');
    }

    function handleSoundToggle() {
        const isPressed = elements.soundToggle?.getAttribute('aria-pressed') === 'true';
        elements.soundToggle?.setAttribute('aria-pressed', !isPressed);

        if (callbacks.onSettingsChange) {
            callbacks.onSettingsChange({ soundEnabled: !isPressed });
        }
    }

    function handleDifficultyChange() {
        const difficulty = parseInt(elements.difficultySelect?.value || '1', 10);

        if (callbacks.onSettingsChange) {
            callbacks.onSettingsChange({ startingDifficulty: difficulty });
        }
    }

    function handleSubmitAnswer() {
        const answer = getAnswerInput();

        if (answer !== null && callbacks.onSubmitAnswer) {
            callbacks.onSubmitAnswer(answer);
        }
    }

    function handleAnswerKeypress(event) {
        if (event.key === 'Enter') {
            handleSubmitAnswer();
        }
    }

    function handlePauseGame() {
        if (callbacks.onPauseGame) {
            callbacks.onPauseGame();
        }
    }

    function handleResumeGame() {
        elements.pauseModal?.classList.add('hidden');

        if (callbacks.onResumeGame) {
            callbacks.onResumeGame();
        }
    }

    function handleQuitGame() {
        elements.pauseModal?.classList.add('hidden');

        if (callbacks.onQuitGame) {
            callbacks.onQuitGame();
        }
    }

    function handlePlayAgain() {
        if (callbacks.onPlayAgain) {
            callbacks.onPlayAgain();
        }
    }

    function handleGoToMenu() {
        if (callbacks.onGoToMenu) {
            callbacks.onGoToMenu();
        }
    }

    /**
     * Sets callback functions for UI events
     * @param {object} newCallbacks - Object with callback functions
     */
    function setCallbacks(newCallbacks) {
        callbacks = { ...callbacks, ...newCallbacks };
    }

    /**
     * Shows/hides game screens
     * @param {string} screen - 'menu' | 'game' | 'gameover'
     */
    function showScreen(screen) {
        // Hide all screens
        elements.menuScreen?.classList.remove('active');
        elements.menuScreen?.classList.add('hidden');
        elements.gameScreen?.classList.remove('active');
        elements.gameScreen?.classList.add('hidden');
        elements.gameoverScreen?.classList.remove('active');
        elements.gameoverScreen?.classList.add('hidden');

        // Show selected screen
        let targetScreen;
        switch (screen) {
            case SCREENS.MENU:
                targetScreen = elements.menuScreen;
                break;
            case SCREENS.GAME:
                targetScreen = elements.gameScreen;
                break;
            case SCREENS.GAMEOVER:
                targetScreen = elements.gameoverScreen;
                break;
            default:
                targetScreen = elements.menuScreen;
        }

        targetScreen?.classList.remove('hidden');
        targetScreen?.classList.add('active');
        currentScreen = screen;

        // Focus appropriate element
        if (screen === SCREENS.GAME) {
            elements.answerInput?.focus();
        }
    }

    /**
     * Updates problem display
     * @param {object} problem - Problem object with displayText
     */
    function displayProblem(problem) {
        if (elements.problemText) {
            elements.problemText.textContent = problem.displayText;

            // Add animation
            elements.problemCard?.classList.remove('card-flip-in');
            void elements.problemCard?.offsetWidth; // Trigger reflow
            elements.problemCard?.classList.add('card-flip-in');
        }

        // Clear and focus input
        if (elements.answerInput) {
            elements.answerInput.value = '';
            elements.answerInput.classList.remove('correct', 'incorrect');
            elements.answerInput.focus();
        }
    }

    /**
     * Shows correct/incorrect feedback
     * @param {boolean} correct - Whether the answer was correct
     * @param {number} [correctAnswer] - The correct answer (shown if incorrect)
     */
    function showFeedback(correct, correctAnswer) {
        if (!elements.feedbackOverlay) return;

        // Set feedback content
        elements.feedbackOverlay.classList.remove('correct', 'incorrect');
        elements.feedbackContent?.classList.remove('correct', 'incorrect');

        if (correct) {
            elements.feedbackOverlay.classList.add('correct');
            elements.feedbackContent?.classList.add('correct');
            elements.feedbackIcon.textContent = getRandomCorrectEmoji();
            elements.feedbackText.textContent = getRandomCorrectMessage();
        } else {
            elements.feedbackOverlay.classList.add('incorrect');
            elements.feedbackContent?.classList.add('incorrect');
            elements.feedbackIcon.textContent = getRandomEncouragementEmoji();
            elements.feedbackText.textContent = correctAnswer !== undefined
                ? 'The answer was ' + correctAnswer
                : getRandomEncouragementMessage();
        }

        // Add animation class to input
        elements.answerInput?.classList.add(correct ? 'correct' : 'incorrect');

        // Show overlay briefly
        elements.feedbackOverlay.classList.remove('hidden');

        // Auto-hide after delay
        setTimeout(() => {
            elements.feedbackOverlay.classList.add('hidden');
        }, correct ? 800 : 1200);
    }

    /**
     * Hides the feedback overlay
     */
    function hideFeedback() {
        elements.feedbackOverlay?.classList.add('hidden');
    }

    /**
     * Updates score display
     * @param {object} score - ScoreState object
     */
    function updateScoreDisplay(score) {
        if (elements.currentScore) {
            const oldScore = parseInt(elements.currentScore.textContent || '0', 10);
            elements.currentScore.textContent = score.current;

            // Add pop animation if score increased
            if (score.current > oldScore) {
                elements.currentScore.classList.remove('score-pop');
                void elements.currentScore.offsetWidth;
                elements.currentScore.classList.add('score-pop');
            }
        }

        if (elements.currentStreak) {
            elements.currentStreak.textContent = score.streak;
        }

        // Show/hide streak fire
        if (elements.streakFire) {
            if (score.streak >= 3) {
                elements.streakFire.classList.remove('hidden');
            } else {
                elements.streakFire.classList.add('hidden');
            }
        }
    }

    /**
     * Updates difficulty level display
     * @param {number} level - Current difficulty level
     */
    function updateDifficultyDisplay(level) {
        if (elements.difficultyLevel) {
            elements.difficultyLevel.textContent = level;
        }
    }

    /**
     * Updates progress bar
     * @param {number} progress - Progress value (0-1)
     */
    function updateProgress(progress) {
        if (elements.progressFill) {
            elements.progressFill.style.width = Math.min(100, progress * 100) + '%';
        }
    }

    /**
     * Gets answer from input field
     * @returns {number|null} The answer or null if invalid
     */
    function getAnswerInput() {
        const value = elements.answerInput?.value?.trim();

        if (value === '' || value === undefined) {
            return null;
        }

        const number = parseFloat(value);
        return isNaN(number) ? null : number;
    }

    /**
     * Clears the answer input
     */
    function clearAnswerInput() {
        if (elements.answerInput) {
            elements.answerInput.value = '';
            elements.answerInput.classList.remove('correct', 'incorrect');
        }
    }

    /**
     * Shows pause modal
     * @param {object} stats - Current game stats
     */
    function showPauseModal(stats) {
        if (elements.pauseScore) {
            elements.pauseScore.textContent = stats.score || 0;
        }
        if (elements.pauseProblems) {
            elements.pauseProblems.textContent = stats.problemsSolved || 0;
        }
        elements.pauseModal?.classList.remove('hidden');
    }

    /**
     * Hides pause modal
     */
    function hidePauseModal() {
        elements.pauseModal?.classList.add('hidden');
    }

    /**
     * Shows game over screen with final stats
     * @param {object} results - Final game results
     */
    function showGameOver(results) {
        if (elements.finalScore) {
            elements.finalScore.textContent = results.finalScore || 0;
        }
        if (elements.finalProblems) {
            elements.finalProblems.textContent = (results.problemsSolved || 0) + '/' + (results.totalProblems || 0);
        }
        if (elements.finalStreak) {
            elements.finalStreak.textContent = results.bestStreak || 0;
        }

        // Show/hide new high score badge
        if (elements.newHighScoreBadge) {
            if (results.isNewHighScore) {
                elements.newHighScoreBadge.classList.remove('hidden');
            } else {
                elements.newHighScoreBadge.classList.add('hidden');
            }
        }

        showScreen(SCREENS.GAMEOVER);
    }

    /**
     * Updates high score display on menu
     * @param {number} highScore - The high score value
     */
    function updateHighScoreDisplay(highScore) {
        if (elements.menuHighScore) {
            elements.menuHighScore.textContent = highScore;
        }
    }

    /**
     * Updates settings display
     * @param {object} settings - Settings object
     */
    function updateSettingsDisplay(settings) {
        if (elements.soundToggle && settings.soundEnabled !== undefined) {
            elements.soundToggle.setAttribute('aria-pressed', settings.soundEnabled);
        }
        if (elements.difficultySelect && settings.startingDifficulty !== undefined) {
            elements.difficultySelect.value = settings.startingDifficulty;
        }
    }

    /**
     * Shows gorilla speech bubble
     * @param {string} text - Text to show
     * @param {number} [duration=2000] - Duration in ms
     */
    function showGorillaSpeech(text, duration) {
        duration = duration || 2000;
        if (elements.gorillaSpeechText && elements.gorillaSpeech) {
            elements.gorillaSpeechText.textContent = text;
            elements.gorillaSpeech.classList.remove('hidden');

            setTimeout(function() {
                elements.gorillaSpeech?.classList.add('hidden');
            }, duration);
        }
    }

    /**
     * Gets a random correct answer emoji
     */
    function getRandomCorrectEmoji() {
        var emojis = ['🎉', '⭐', '🌟', '🏆', '🙌', '💪', '🦍', '🍌'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    /**
     * Gets a random correct answer message
     */
    function getRandomCorrectMessage() {
        var messages = [
            'Awesome!', 'Great job!', 'Perfect!', 'Amazing!',
            'You rock!', 'Brilliant!', 'Excellent!', 'Fantastic!'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Gets a random encouragement emoji
     */
    function getRandomEncouragementEmoji() {
        var emojis = ['💭', '🤔', '🦍', '💪', '🌱'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    /**
     * Gets a random encouragement message
     */
    function getRandomEncouragementMessage() {
        var messages = [
            'Keep trying!', 'Almost there!', 'You got this!',
            'Try again!', "Don't give up!", 'Next one!'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Initializes the UI Controller
     */
    function init() {
        cacheElements();
        initEventListeners();
    }

    // Public API
    return {
        init: init,
        setCallbacks: setCallbacks,
        showScreen: showScreen,
        displayProblem: displayProblem,
        showFeedback: showFeedback,
        hideFeedback: hideFeedback,
        updateScoreDisplay: updateScoreDisplay,
        updateDifficultyDisplay: updateDifficultyDisplay,
        updateProgress: updateProgress,
        getAnswerInput: getAnswerInput,
        clearAnswerInput: clearAnswerInput,
        showPauseModal: showPauseModal,
        hidePauseModal: hidePauseModal,
        showGameOver: showGameOver,
        updateHighScoreDisplay: updateHighScoreDisplay,
        updateSettingsDisplay: updateSettingsDisplay,
        showGorillaSpeech: showGorillaSpeech,
        SCREENS: SCREENS
    };
})();

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
