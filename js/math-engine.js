/**
 * Math Engine Module
 * Responsible for generating math problems and validating answers
 * Pure functions - no dependencies, easily testable
 */

const MathEngine = (function() {
    'use strict';

    // Constants for difficulty configuration
    const DIFFICULTY_CONFIG = {
        1: { // Easy
            minOperand: 1,
            maxOperand: 10,
            operations: ['+', '-'],
            allowNegativeResults: false
        },
        2: { // Medium
            minOperand: 1,
            maxOperand: 20,
            operations: ['+', '-', '*'],
            maxMultiplier: 10,
            allowNegativeResults: false
        },
        3: { // Hard
            minOperand: 1,
            maxOperand: 50,
            operations: ['+', '-', '*', '/'],
            maxMultiplier: 12,
            allowNegativeResults: false
        }
    };

    // Operation symbols for display
    const OPERATION_SYMBOLS = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷'
    };

    /**
     * Generates a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generates a unique ID for each problem
     * @returns {string} Unique identifier
     */
    function generateProblemId() {
        return 'prob_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Calculates the correct answer for a given operation
     * @param {number} operand1 - First number
     * @param {number} operand2 - Second number
     * @param {string} operation - Operation (+, -, *, /)
     * @returns {number} The correct answer
     */
    function calculateAnswer(operand1, operand2, operation) {
        switch (operation) {
            case '+':
                return operand1 + operand2;
            case '-':
                return operand1 - operand2;
            case '*':
                return operand1 * operand2;
            case '/':
                return operand1 / operand2;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }

    /**
     * Generates operands for addition problems
     * @param {object} config - Difficulty configuration
     * @returns {object} {operand1, operand2}
     */
    function generateAdditionOperands(config) {
        const operand1 = getRandomInt(config.minOperand, config.maxOperand);
        const operand2 = getRandomInt(config.minOperand, config.maxOperand);
        return { operand1, operand2 };
    }

    /**
     * Generates operands for subtraction problems (ensures non-negative result)
     * @param {object} config - Difficulty configuration
     * @returns {object} {operand1, operand2}
     */
    function generateSubtractionOperands(config) {
        let operand1 = getRandomInt(config.minOperand, config.maxOperand);
        let operand2 = getRandomInt(config.minOperand, config.maxOperand);

        // Ensure operand1 >= operand2 for non-negative results
        if (!config.allowNegativeResults && operand1 < operand2) {
            [operand1, operand2] = [operand2, operand1];
        }

        return { operand1, operand2 };
    }

    /**
     * Generates operands for multiplication problems
     * @param {object} config - Difficulty configuration
     * @returns {object} {operand1, operand2}
     */
    function generateMultiplicationOperands(config) {
        const maxMultiplier = config.maxMultiplier || 10;
        const operand1 = getRandomInt(1, maxMultiplier);
        const operand2 = getRandomInt(1, maxMultiplier);
        return { operand1, operand2 };
    }

    /**
     * Generates operands for division problems (ensures whole number result)
     * @param {object} config - Difficulty configuration
     * @returns {object} {operand1, operand2}
     */
    function generateDivisionOperands(config) {
        const maxMultiplier = config.maxMultiplier || 10;

        // Generate factors, then multiply to get dividend
        const operand2 = getRandomInt(1, maxMultiplier); // Divisor (never 0)
        const quotient = getRandomInt(1, maxMultiplier); // Expected answer
        const operand1 = operand2 * quotient; // Dividend

        return { operand1, operand2 };
    }

    /**
     * Generates operands based on operation type
     * @param {string} operation - The operation type
     * @param {object} config - Difficulty configuration
     * @returns {object} {operand1, operand2}
     */
    function generateOperands(operation, config) {
        switch (operation) {
            case '+':
                return generateAdditionOperands(config);
            case '-':
                return generateSubtractionOperands(config);
            case '*':
                return generateMultiplicationOperands(config);
            case '/':
                return generateDivisionOperands(config);
            default:
                return generateAdditionOperands(config);
        }
    }

    /**
     * Generates a new math problem based on operation type and difficulty
     * @param {string} [operation] - Optional specific operation (random if not provided)
     * @param {number} [difficulty=1] - Difficulty level (1-3)
     * @returns {object} Problem object
     */
    function generateProblem(operation, difficulty = 1) {
        // Get configuration for difficulty level
        const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1];

        // Select operation if not provided
        if (!operation) {
            const randomIndex = getRandomInt(0, config.operations.length - 1);
            operation = config.operations[randomIndex];
        }

        // Validate operation is allowed for this difficulty
        if (!config.operations.includes(operation)) {
            operation = config.operations[0];
        }

        // Generate operands appropriate for the operation
        const { operand1, operand2 } = generateOperands(operation, config);

        // Calculate the correct answer
        const correctAnswer = calculateAnswer(operand1, operand2, operation);

        // Create display text with friendly symbols
        const displaySymbol = OPERATION_SYMBOLS[operation] || operation;
        const displayText = `${operand1} ${displaySymbol} ${operand2} = ?`;

        return {
            id: generateProblemId(),
            operand1,
            operand2,
            operation,
            displayText,
            correctAnswer,
            difficulty
        };
    }

    /**
     * Validates user's answer against correct answer
     * @param {number|string} userAnswer - The user's submitted answer
     * @param {number} correctAnswer - The correct answer
     * @returns {boolean} True if answer is correct
     */
    function checkAnswer(userAnswer, correctAnswer) {
        // Convert to number if string
        const numericAnswer = parseFloat(userAnswer);

        // Check for invalid input
        if (isNaN(numericAnswer)) {
            return false;
        }

        // Compare with small epsilon for floating point errors
        const epsilon = 0.0001;
        return Math.abs(numericAnswer - correctAnswer) < epsilon;
    }

    /**
     * Gets the allowed operations for a given difficulty level
     * @param {number} difficulty - Difficulty level (1-3)
     * @returns {string[]} Array of allowed operation characters
     */
    function getAllowedOperations(difficulty) {
        const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1];
        return [...config.operations];
    }

    /**
     * Gets the display symbol for an operation
     * @param {string} operation - The operation character
     * @returns {string} The display symbol
     */
    function getOperationSymbol(operation) {
        return OPERATION_SYMBOLS[operation] || operation;
    }

    /**
     * Gets the difficulty configuration
     * @param {number} difficulty - Difficulty level
     * @returns {object} Configuration object
     */
    function getDifficultyConfig(difficulty) {
        return { ...(DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1]) };
    }

    // Public API
    return {
        generateProblem,
        checkAnswer,
        getAllowedOperations,
        getOperationSymbol,
        getDifficultyConfig,
        // Export for testing
        _internal: {
            getRandomInt,
            calculateAnswer,
            generateOperands,
            DIFFICULTY_CONFIG,
            OPERATION_SYMBOLS
        }
    };
})();

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathEngine;
}
