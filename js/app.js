/**
 * Application Bootstrap
 * Initializes all modules and starts the application
 */

(function() {
    'use strict';

    /**
     * Initialize the application when DOM is ready
     */
    function initApp() {
        console.log('Gorilla Tag Math Game - Initializing...');

        try {
            // Initialize UI Controller first (sets up DOM cache)
            if (typeof UIController !== 'undefined') {
                UIController.init();
                console.log('UI Controller initialized');
            } else {
                throw new Error('UIController not found');
            }

            // Initialize Theme Engine
            if (typeof ThemeEngine !== 'undefined') {
                ThemeEngine.init();
                console.log('Theme Engine initialized');
            } else {
                throw new Error('ThemeEngine not found');
            }

            // Initialize Score Manager (loads saved data)
            if (typeof ScoreManager !== 'undefined') {
                ScoreManager.init();
                console.log('Score Manager initialized');
            } else {
                throw new Error('ScoreManager not found');
            }

            // Initialize Difficulty Manager
            if (typeof DifficultyManager !== 'undefined') {
                // DifficultyManager auto-initializes
                console.log('Difficulty Manager initialized');
            } else {
                throw new Error('DifficultyManager not found');
            }

            // Initialize Math Engine
            if (typeof MathEngine !== 'undefined') {
                // MathEngine is stateless, no init needed
                console.log('Math Engine initialized');
            } else {
                throw new Error('MathEngine not found');
            }

            // Initialize Game Controller with all dependencies
            if (typeof GameController !== 'undefined') {
                GameController.init({
                    mathEngine: MathEngine,
                    difficultyManager: DifficultyManager,
                    scoreManager: ScoreManager,
                    uiController: UIController,
                    themeEngine: ThemeEngine
                });
                console.log('Game Controller initialized');
            } else {
                throw new Error('GameController not found');
            }

            console.log('Gorilla Tag Math Game - Ready!');

        } catch (error) {
            console.error('Failed to initialize game:', error);
            showErrorMessage(error.message);
        }
    }

    /**
     * Shows an error message to the user
     * @param {string} message - Error message
     */
    function showErrorMessage(message) {
        var app = document.getElementById('app');
        if (app) {
            app.innerHTML = [
                '<div style="',
                'display: flex;',
                'flex-direction: column;',
                'align-items: center;',
                'justify-content: center;',
                'min-height: 100vh;',
                'padding: 2rem;',
                'text-align: center;',
                'background: #1a3d14;',
                'color: white;',
                'font-family: sans-serif;',
                '">',
                '<h1 style="color: #FFD700; margin-bottom: 1rem;">',
                'Oops! Something went wrong',
                '</h1>',
                '<p style="margin-bottom: 1rem;">',
                'The game failed to load properly.',
                '</p>',
                '<p style="color: #FF6B6B; margin-bottom: 1rem;">',
                'Error: ' + message,
                '</p>',
                '<button onclick="location.reload()" style="',
                'padding: 1rem 2rem;',
                'font-size: 1.2rem;',
                'background: #FFD700;',
                'border: none;',
                'border-radius: 8px;',
                'cursor: pointer;',
                '">',
                'Try Again',
                '</button>',
                '</div>'
            ].join('');
        }
    }

    /**
     * Wait for DOM to be ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM already loaded
        initApp();
    }

    // Expose for debugging in development
    if (typeof window !== 'undefined') {
        window.GorillaTagMath = {
            version: '1.0.0',
            getState: function() {
                if (typeof GameController !== 'undefined') {
                    return GameController.getState();
                }
                return null;
            },
            getScore: function() {
                if (typeof ScoreManager !== 'undefined') {
                    return ScoreManager.getScore();
                }
                return null;
            },
            getDifficulty: function() {
                if (typeof DifficultyManager !== 'undefined') {
                    return DifficultyManager.getState();
                }
                return null;
            },
            resetAll: function() {
                if (typeof ScoreManager !== 'undefined') {
                    ScoreManager.clearAllData();
                    location.reload();
                }
            }
        };
    }
})();
