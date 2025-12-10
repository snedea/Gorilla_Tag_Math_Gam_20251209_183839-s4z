/**
 * Theme Engine Module
 * Handles visual theme, animations, and audio feedback
 */

const ThemeEngine = (function() {
    'use strict';

    // Audio context and sounds
    let audioContext = null;
    let soundEnabled = true;

    // Sound frequencies for different events
    const SOUNDS = {
        correct: { frequency: 523.25, duration: 0.15, type: 'sine' }, // C5
        incorrect: { frequency: 196, duration: 0.2, type: 'triangle' }, // G3
        levelup: { frequencies: [523.25, 659.25, 783.99], duration: 0.15, type: 'sine' } // C5, E5, G5
    };

    // Confetti configuration
    const CONFETTI_CONFIG = {
        count: 50,
        colors: ['#FFD700', '#4CAF50', '#FF6B6B', '#4ECDC4', '#9B59B6', '#FF9800'],
        shapes: ['square', 'circle']
    };

    // Encouragement messages
    const MESSAGES = {
        correct: [
            'Great job!', 'Awesome!', 'Perfect!', 'Amazing!',
            'You rock!', 'Brilliant!', 'Excellent!', 'Fantastic!',
            'Way to go!', 'Outstanding!', 'Super!', 'Incredible!'
        ],
        incorrect: [
            'Keep trying!', 'Almost there!', 'You can do it!',
            'Try again!', "Don't give up!", 'Next one!',
            'Keep going!', 'Good effort!', 'So close!'
        ],
        levelUp: [
            'Level Up!', 'Nice work!', 'Getting harder!',
            'Challenge accepted!', 'You are on fire!'
        ],
        levelDown: [
            'Taking it easy!', 'No worries!', 'Practice makes perfect!',
            'Keep at it!', 'You got this!'
        ]
    };

    /**
     * Initializes the audio context
     */
    function initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            audioContext = null;
        }
    }

    /**
     * Plays a simple tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type
     */
    function playTone(frequency, duration, type) {
        if (!audioContext || !soundEnabled) return;

        try {
            // Resume audio context if suspended (browser autoplay policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            var oscillator = audioContext.createOscillator();
            var gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type || 'sine';

            // Fade out to avoid clicks
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Error playing tone:', e);
        }
    }

    /**
     * Plays a sound effect
     * @param {string} type - Sound type: 'correct', 'incorrect', 'levelup'
     */
    function playSound(type) {
        if (!soundEnabled) return;

        var sound = SOUNDS[type];
        if (!sound) return;

        if (type === 'levelup' && sound.frequencies) {
            // Play arpeggio for level up
            sound.frequencies.forEach(function(freq, i) {
                setTimeout(function() {
                    playTone(freq, sound.duration, sound.type);
                }, i * 100);
            });
        } else {
            playTone(sound.frequency, sound.duration, sound.type);
        }
    }

    /**
     * Sets sound enabled state
     * @param {boolean} enabled - Whether sound is enabled
     */
    function setSoundEnabled(enabled) {
        soundEnabled = enabled;

        // Initialize audio context on first enable
        if (enabled && !audioContext) {
            initAudio();
        }
    }

    /**
     * Gets sound enabled state
     * @returns {boolean} Whether sound is enabled
     */
    function isSoundEnabled() {
        return soundEnabled;
    }

    /**
     * Creates confetti particles
     * @param {HTMLElement} container - Container element for confetti
     */
    function createConfetti(container) {
        if (!container) return;

        // Clear existing confetti
        container.innerHTML = '';

        for (var i = 0; i < CONFETTI_CONFIG.count; i++) {
            var confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Random properties
            var color = CONFETTI_CONFIG.colors[Math.floor(Math.random() * CONFETTI_CONFIG.colors.length)];
            var shape = CONFETTI_CONFIG.shapes[Math.floor(Math.random() * CONFETTI_CONFIG.shapes.length)];
            var size = Math.random() * 10 + 5;
            var left = Math.random() * 100;
            var delay = Math.random() * 2;
            var duration = Math.random() * 2 + 2;

            confetti.style.cssText = [
                'background-color: ' + color,
                'width: ' + size + 'px',
                'height: ' + size + 'px',
                'left: ' + left + '%',
                'animation-delay: ' + delay + 's',
                'animation-duration: ' + duration + 's',
                'border-radius: ' + (shape === 'circle' ? '50%' : '0')
            ].join(';');

            container.appendChild(confetti);
        }
    }

    /**
     * Plays celebration animation (correct answer)
     */
    function playCelebration() {
        var gorilla = document.querySelector('.game-gorilla');
        if (gorilla) {
            gorilla.classList.remove('gorilla-jump');
            void gorilla.offsetWidth; // Trigger reflow
            gorilla.classList.add('gorilla-jump');

            // Remove class after animation
            setTimeout(function() {
                gorilla.classList.remove('gorilla-jump');
            }, 600);
        }

        // Create star particles
        createStarParticles();

        // Play sound
        playSound('correct');
    }

    /**
     * Plays encouragement animation (incorrect answer)
     */
    function playEncouragement() {
        var gorilla = document.querySelector('.game-gorilla');
        if (gorilla) {
            gorilla.classList.remove('gorilla-shake');
            void gorilla.offsetWidth;
            gorilla.classList.add('gorilla-shake');

            setTimeout(function() {
                gorilla.classList.remove('gorilla-shake');
            }, 500);
        }

        // Play sound
        playSound('incorrect');
    }

    /**
     * Plays level up celebration
     */
    function playLevelUp() {
        // Create special celebration
        var container = document.getElementById('confetti-container');
        if (container) {
            createConfetti(container);
        }

        // Show level up badge
        showLevelUpBadge();

        // Play sound
        playSound('levelup');
    }

    /**
     * Shows level up badge
     */
    function showLevelUpBadge() {
        // Create badge element
        var existingBadge = document.querySelector('.level-up-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        var badge = document.createElement('div');
        badge.className = 'level-up-badge';
        badge.textContent = getRandomMessage('levelUp');
        document.body.appendChild(badge);

        // Remove after animation
        setTimeout(function() {
            badge.remove();
        }, 2000);
    }

    /**
     * Creates star particle effects
     */
    function createStarParticles() {
        var problemCard = document.getElementById('problem-card');
        if (!problemCard) return;

        var rect = problemCard.getBoundingClientRect();
        var stars = ['⭐', '✨', '🌟', '💫'];

        for (var i = 0; i < 5; i++) {
            var star = document.createElement('span');
            star.className = 'star-particle';
            star.textContent = stars[Math.floor(Math.random() * stars.length)];

            // Random position around the card
            var x = rect.left + Math.random() * rect.width;
            var y = rect.top + Math.random() * rect.height;

            star.style.cssText = [
                'position: fixed',
                'left: ' + x + 'px',
                'top: ' + y + 'px',
                'font-size: 1.5rem',
                'pointer-events: none',
                'z-index: 1000'
            ].join(';');

            document.body.appendChild(star);

            // Animate and remove
            star.animate([
                { transform: 'translateY(0) scale(1)', opacity: 1 },
                { transform: 'translateY(-50px) scale(0)', opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = function() {
                this.effect.target.remove();
            };
        }
    }

    /**
     * Updates background based on streak
     * @param {number} streak - Current streak count
     */
    function updateBackground(streak) {
        var gameContainer = document.getElementById('app');
        if (!gameContainer) return;

        // Remove existing intensity classes
        gameContainer.classList.remove('streak-low', 'streak-medium', 'streak-high');

        // Add appropriate intensity class
        if (streak >= 10) {
            gameContainer.classList.add('streak-high');
        } else if (streak >= 5) {
            gameContainer.classList.add('streak-medium');
        } else if (streak >= 3) {
            gameContainer.classList.add('streak-low');
        }
    }

    /**
     * Sets the difficulty theme
     * @param {number} difficulty - Difficulty level (1-3)
     */
    function setDifficultyTheme(difficulty) {
        var gameContainer = document.getElementById('app');
        if (!gameContainer) return;

        gameContainer.setAttribute('data-difficulty', difficulty);
    }

    /**
     * Gets a random message of a specific type
     * @param {string} type - Message type
     * @returns {string} Random message
     */
    function getRandomMessage(type) {
        var messages = MESSAGES[type] || MESSAGES.correct;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Shows floating points animation
     * @param {number} points - Points to display
     * @param {HTMLElement} targetElement - Element to position near
     */
    function showFloatingPoints(points, targetElement) {
        if (!targetElement) return;

        var rect = targetElement.getBoundingClientRect();
        var pointsEl = document.createElement('div');
        pointsEl.className = 'points-float';
        pointsEl.textContent = '+' + points;

        pointsEl.style.cssText = [
            'position: fixed',
            'left: ' + (rect.left + rect.width / 2) + 'px',
            'top: ' + rect.top + 'px',
            'transform: translateX(-50%)',
            'z-index: 1000'
        ].join(';');

        document.body.appendChild(pointsEl);

        // Remove after animation
        setTimeout(function() {
            pointsEl.remove();
        }, 1000);
    }

    /**
     * Initializes the theme engine
     */
    function init() {
        // Initialize audio on user interaction to comply with autoplay policies
        document.addEventListener('click', function initOnClick() {
            if (!audioContext) {
                initAudio();
            }
            document.removeEventListener('click', initOnClick);
        }, { once: true });
    }

    // Public API
    return {
        init: init,
        playSound: playSound,
        setSoundEnabled: setSoundEnabled,
        isSoundEnabled: isSoundEnabled,
        playCelebration: playCelebration,
        playEncouragement: playEncouragement,
        playLevelUp: playLevelUp,
        updateBackground: updateBackground,
        setDifficultyTheme: setDifficultyTheme,
        getRandomMessage: getRandomMessage,
        showFloatingPoints: showFloatingPoints,
        createConfetti: createConfetti,
        MESSAGES: MESSAGES
    };
})();

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeEngine;
}
