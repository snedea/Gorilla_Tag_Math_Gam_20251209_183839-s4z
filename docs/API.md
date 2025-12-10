# API Documentation

This document describes the public interfaces of each JavaScript module in the Gorilla Tag Math Game.

## Table of Contents

- [MathEngine](#mathengine)
- [DifficultyManager](#difficultymanager)
- [ScoreManager](#scoremanager)
- [GameController](#gamecontroller)
- [UIController](#uicontroller)
- [ThemeEngine](#themeengine)

---

## MathEngine

Responsible for generating math problems and validating answers. This module is stateless and contains pure functions.

**Location**: `js/math-engine.js`

### Methods

#### `generateProblem(operation?, difficulty?)`

Generates a new math problem.

**Parameters:**
- `operation` (string, optional): Specific operation (`+`, `-`, `*`, `/`). If not provided, a random operation is chosen based on difficulty.
- `difficulty` (number, optional): Difficulty level 1-3. Defaults to 1.

**Returns:** `Problem` object
```javascript
{
    id: string,           // Unique problem identifier
    operand1: number,     // First number
    operand2: number,     // Second number
    operation: string,    // Operation character (+, -, *, /)
    displayText: string,  // Human-readable text (e.g., "5 + 3 = ?")
    correctAnswer: number,// The correct answer
    difficulty: number    // Difficulty level
}
```

**Example:**
```javascript
const problem = MathEngine.generateProblem(null, 2);
// { id: "prob_1234_abc", operand1: 15, operand2: 7, operation: "+", ... }
```

#### `checkAnswer(userAnswer, correctAnswer)`

Validates the user's answer.

**Parameters:**
- `userAnswer` (number|string): The user's submitted answer
- `correctAnswer` (number): The correct answer

**Returns:** `boolean` - `true` if correct

**Example:**
```javascript
MathEngine.checkAnswer(8, 8);  // true
MathEngine.checkAnswer("8", 8); // true
MathEngine.checkAnswer(7, 8);  // false
```

#### `getAllowedOperations(difficulty)`

Gets the operations allowed for a difficulty level.

**Parameters:**
- `difficulty` (number): Difficulty level 1-3

**Returns:** `string[]` - Array of operation characters

**Example:**
```javascript
MathEngine.getAllowedOperations(1); // ['+', '-']
MathEngine.getAllowedOperations(3); // ['+', '-', '*', '/']
```

#### `getOperationSymbol(operation)`

Gets the display symbol for an operation.

**Parameters:**
- `operation` (string): Operation character

**Returns:** `string` - Display symbol

**Example:**
```javascript
MathEngine.getOperationSymbol('*'); // '×'
MathEngine.getOperationSymbol('/'); // '÷'
```

#### `getDifficultyConfig(difficulty)`

Gets the configuration for a difficulty level.

**Parameters:**
- `difficulty` (number): Difficulty level 1-3

**Returns:** `DifficultyConfig` object
```javascript
{
    minOperand: number,
    maxOperand: number,
    operations: string[],
    maxMultiplier?: number,
    allowNegativeResults: boolean
}
```

---

## DifficultyManager

Tracks player performance and adjusts difficulty dynamically based on streaks.

**Location**: `js/difficulty-manager.js`

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MIN_DIFFICULTY` | 1 | Minimum difficulty level (Easy) |
| `MAX_DIFFICULTY` | 3 | Maximum difficulty level (Hard) |
| `STREAK_FOR_LEVEL_UP` | 3 | Correct answers needed to level up |
| `STREAK_FOR_LEVEL_DOWN` | 3 | Incorrect answers to level down |

### Methods

#### `getCurrentDifficulty()`

Gets the current difficulty level.

**Returns:** `number` - Current difficulty (1-3)

#### `getDifficultyName()`

Gets the display name for the current difficulty.

**Returns:** `string` - "Easy", "Medium", or "Hard"

#### `getDifficultyNameForLevel(level)`

Gets the display name for a specific level.

**Parameters:**
- `level` (number): Difficulty level

**Returns:** `string` - Level name

#### `setDifficulty(level)`

Sets the difficulty level directly.

**Parameters:**
- `level` (number): New difficulty level (clamped to 1-3)

#### `recordCorrect()`

Records a correct answer and checks for level adjustment.

**Returns:** `AdjustmentResult` object
```javascript
{
    levelChanged: boolean,
    newLevel: number,
    previousLevel: number,
    direction: 'up' | 'down' | null,
    difficultyName: string
}
```

#### `recordIncorrect()`

Records an incorrect answer and checks for level adjustment.

**Returns:** `AdjustmentResult` object (same as above)

#### `getState()`

Gets the current state of the difficulty manager.

**Returns:** `DifficultyState` object
```javascript
{
    difficulty: number,
    difficultyName: string,
    correctStreak: number,
    incorrectStreak: number,
    progressToLevelUp: number,    // 0-1
    progressToLevelDown: number,  // 0-1
    lastAdjustment: object | null
}
```

#### `reset(startingDifficulty?)`

Resets the difficulty manager.

**Parameters:**
- `startingDifficulty` (number, optional): Starting level. Defaults to 1.

---

## ScoreManager

Tracks scores, streaks, and persists player data to localStorage.

**Location**: `js/score-manager.js`

### Constants

```javascript
STORAGE_KEY = 'gorillaTagMath_playerData'

POINTS = {
    CORRECT_BASE: 10,      // Base points per correct answer
    STREAK_BONUS: 5,       // Extra points per streak level
    LEVEL_MULTIPLIER: 1.5  // Multiplier for higher difficulties
}
```

### Methods

#### `updateScore(correct, difficulty?)`

Updates the score after an answer submission.

**Parameters:**
- `correct` (boolean): Whether the answer was correct
- `difficulty` (number, optional): Current difficulty level

**Returns:** `ScoreResult` object
```javascript
{
    current: number,
    streak: number,
    highScore: number,
    totalCorrect: number,
    totalAttempted: number,
    bestStreakThisGame: number,
    accuracy: number,
    pointsEarned: number,
    wasCorrect: boolean
}
```

#### `getScore()`

Gets the current score state.

**Returns:** `ScoreState` object
```javascript
{
    current: number,
    streak: number,
    highScore: number,
    totalCorrect: number,
    totalAttempted: number,
    bestStreakThisGame: number,
    accuracy: number  // 0-100
}
```

#### `resetGame()`

Resets the current game score (preserves player data).

#### `endGame()`

Ends the current game and updates persistent data.

**Returns:** `GameResults` object
```javascript
{
    finalScore: number,
    problemsSolved: number,
    totalProblems: number,
    bestStreak: number,
    accuracy: number,
    isNewHighScore: boolean,
    highScore: number
}
```

#### `getHighScore()`

Gets the player's high score.

**Returns:** `number`

#### `setLastDifficulty(difficulty)` / `getLastDifficulty()`

Gets/sets the last used difficulty level.

#### `setSoundEnabled(enabled)` / `isSoundEnabled()`

Gets/sets the sound preference.

#### `getLifetimeStats()`

Gets lifetime statistics.

**Returns:** `LifetimeStats` object
```javascript
{
    gamesPlayed: number,
    problemsAttempted: number,
    correctAnswers: number,
    highScore: number,
    accuracy: number,
    lastPlayed: string | null
}
```

#### `clearAllData()`

Clears all player data and resets to defaults.

---

## GameController

Orchestrates game flow and state transitions.

**Location**: `js/game-controller.js`

### States

```javascript
STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    FEEDBACK: 'feedback',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
}
```

### Configuration

```javascript
CONFIG = {
    problemsPerGame: 20,      // Total problems per game
    feedbackDuration: 800,    // Feedback display time (ms)
    timeBetweenProblems: 500  // Delay before next problem (ms)
}
```

### Methods

#### `init(deps)`

Initializes the game controller with module dependencies.

**Parameters:**
- `deps` (object): Module references
  ```javascript
  {
      mathEngine: MathEngine,
      difficultyManager: DifficultyManager,
      scoreManager: ScoreManager,
      uiController: UIController,
      themeEngine: ThemeEngine
  }
  ```

#### `startGame()`

Starts a new game.

#### `submitAnswer(answer)`

Handles answer submission.

**Parameters:**
- `answer` (number): The submitted answer

#### `pauseGame()` / `resumeGame()`

Pauses/resumes the game.

#### `quitGame()`

Quits the current game and shows game over screen.

#### `playAgain()`

Starts a new game after game over.

#### `goToMenu()`

Returns to the main menu.

#### `getState()`

Gets the current game state.

**Returns:** `GameState` object
```javascript
{
    status: string,         // Current state (MENU, PLAYING, etc.)
    currentProblem: object, // Current problem or null
    problemNumber: number,  // Current problem number (1-20)
    totalProblems: number   // Total problems (20)
}
```

#### `isPlaying()`

Checks if the game is currently active.

**Returns:** `boolean`

---

## UIController

Handles all DOM manipulation and user input events.

**Location**: `js/ui-controller.js`

### Screen Constants

```javascript
SCREENS = {
    MENU: 'menu',
    GAME: 'game',
    GAMEOVER: 'gameover'
}
```

### Methods

#### `init()`

Initializes the UI controller and caches DOM elements.

#### `setCallbacks(callbacks)`

Sets callback functions for user actions.

**Parameters:**
- `callbacks` (object):
  ```javascript
  {
      onStartGame: Function,
      onSubmitAnswer: Function,
      onPauseGame: Function,
      onResumeGame: Function,
      onQuitGame: Function,
      onPlayAgain: Function,
      onGoToMenu: Function,
      onSettingsChange: Function
  }
  ```

#### `showScreen(screen)`

Shows a specific screen.

**Parameters:**
- `screen` (string): Screen identifier

#### `displayProblem(problem)`

Displays a math problem.

**Parameters:**
- `problem` (object): Problem object from MathEngine

#### `showFeedback(isCorrect, correctAnswer?)`

Shows answer feedback.

**Parameters:**
- `isCorrect` (boolean): Whether answer was correct
- `correctAnswer` (number, optional): Show correct answer if wrong

#### `updateScoreDisplay(score)`

Updates the score display.

#### `updateProgress(percentage)`

Updates the progress bar.

**Parameters:**
- `percentage` (number): Progress 0-1

#### `showGameOver(results)`

Shows the game over screen.

**Parameters:**
- `results` (object): Game results from ScoreManager

---

## ThemeEngine

Manages visual effects, animations, and audio.

**Location**: `js/theme-engine.js`

### Methods

#### `init()`

Initializes the theme engine.

#### `setSoundEnabled(enabled)`

Enables/disables sound effects.

#### `setDifficultyTheme(difficulty)`

Updates visual theme for difficulty level.

#### `playCelebration()`

Plays celebration animation for correct answers.

#### `playEncouragement()`

Plays encouragement animation for incorrect answers.

#### `playLevelUp()`

Plays level up animation and sound.

#### `showFloatingPoints(points, element)`

Shows floating points animation.

**Parameters:**
- `points` (number): Points earned
- `element` (HTMLElement): Element to animate near

#### `createConfetti(container)`

Creates confetti animation for high scores.

**Parameters:**
- `container` (HTMLElement): Container element

#### `updateBackground(streak)`

Updates background intensity based on streak.

#### `getRandomMessage(type)`

Gets a random themed message.

**Parameters:**
- `type` (string): Message type ('correct', 'incorrect', 'levelUp', 'levelDown')

**Returns:** `string`

---

## Global Debug Interface

Available in browser console via `window.GorillaTagMath`:

```javascript
GorillaTagMath.version      // "1.0.0"
GorillaTagMath.getState()   // Current game state
GorillaTagMath.getScore()   // Current score info
GorillaTagMath.getDifficulty() // Difficulty info
GorillaTagMath.resetAll()   // Reset all data
```
