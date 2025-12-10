/**
 * Math Engine Unit Tests
 * Tests for problem generation and answer validation
 */

// Require the module for Node.js environment
const MathEngine = require('../js/math-engine.js');

describe('MathEngine', () => {
    describe('generateProblem', () => {
        test('generates a problem with all required properties', () => {
            const problem = MathEngine.generateProblem();
            
            expect(problem).toHaveProperty('id');
            expect(problem).toHaveProperty('operand1');
            expect(problem).toHaveProperty('operand2');
            expect(problem).toHaveProperty('operation');
            expect(problem).toHaveProperty('displayText');
            expect(problem).toHaveProperty('correctAnswer');
            expect(problem).toHaveProperty('difficulty');
        });

        test('generates addition problems correctly', () => {
            const problem = MathEngine.generateProblem('+', 1);
            
            expect(problem.operation).toBe('+');
            expect(problem.correctAnswer).toBe(problem.operand1 + problem.operand2);
            expect(problem.displayText).toContain('+');
        });

        test('generates subtraction problems with non-negative results at level 1', () => {
            for (let i = 0; i < 50; i++) {
                const problem = MathEngine.generateProblem('-', 1);
                
                expect(problem.operation).toBe('-');
                expect(problem.correctAnswer).toBe(problem.operand1 - problem.operand2);
                expect(problem.correctAnswer).toBeGreaterThanOrEqual(0);
            }
        });

        test('generates multiplication problems correctly', () => {
            const problem = MathEngine.generateProblem('*', 2);
            
            expect(problem.operation).toBe('*');
            expect(problem.correctAnswer).toBe(problem.operand1 * problem.operand2);
            expect(problem.displayText).toContain('×');
        });

        test('generates division problems with whole number results', () => {
            for (let i = 0; i < 50; i++) {
                const problem = MathEngine.generateProblem('/', 3);
                
                expect(problem.operation).toBe('/');
                expect(Number.isInteger(problem.correctAnswer)).toBe(true);
                expect(problem.operand2).not.toBe(0);
            }
        });

        test('respects difficulty level for operations', () => {
            // Level 1 should only have + and -
            const level1Problem = MathEngine.generateProblem(null, 1);
            expect(['+', '-']).toContain(level1Problem.operation);

            // Level 2 should have +, -, *
            for (let i = 0; i < 100; i++) {
                const problem = MathEngine.generateProblem(null, 2);
                expect(['+', '-', '*']).toContain(problem.operation);
            }
        });

        test('falls back to allowed operation if given operation not allowed', () => {
            const problem = MathEngine.generateProblem('*', 1); // * not allowed at level 1
            
            expect(['+', '-']).toContain(problem.operation);
        });

        test('generates unique problem IDs', () => {
            const problem1 = MathEngine.generateProblem();
            const problem2 = MathEngine.generateProblem();
            
            expect(problem1.id).not.toBe(problem2.id);
        });
    });

    describe('checkAnswer', () => {
        test('returns true for correct numeric answer', () => {
            const result = MathEngine.checkAnswer(8, 8);
            expect(result).toBe(true);
        });

        test('returns true for correct string answer', () => {
            const result = MathEngine.checkAnswer('8', 8);
            expect(result).toBe(true);
        });

        test('returns false for incorrect answer', () => {
            const result = MathEngine.checkAnswer(7, 8);
            expect(result).toBe(false);
        });

        test('returns false for empty string', () => {
            const result = MathEngine.checkAnswer('', 8);
            expect(result).toBe(false);
        });

        test('returns false for non-numeric string', () => {
            const result = MathEngine.checkAnswer('abc', 8);
            expect(result).toBe(false);
        });

        test('handles floating point answers', () => {
            const result = MathEngine.checkAnswer(8.0, 8);
            expect(result).toBe(true);
        });

        test('handles negative answers', () => {
            const result = MathEngine.checkAnswer(-5, -5);
            expect(result).toBe(true);
        });
    });

    describe('getAllowedOperations', () => {
        test('returns correct operations for level 1', () => {
            const ops = MathEngine.getAllowedOperations(1);
            expect(ops).toEqual(['+', '-']);
        });

        test('returns correct operations for level 2', () => {
            const ops = MathEngine.getAllowedOperations(2);
            expect(ops).toEqual(['+', '-', '*']);
        });

        test('returns correct operations for level 3', () => {
            const ops = MathEngine.getAllowedOperations(3);
            expect(ops).toEqual(['+', '-', '*', '/']);
        });

        test('defaults to level 1 for invalid level', () => {
            const ops = MathEngine.getAllowedOperations(99);
            expect(ops).toEqual(['+', '-']);
        });
    });

    describe('getOperationSymbol', () => {
        test('returns correct symbols', () => {
            expect(MathEngine.getOperationSymbol('+')).toBe('+');
            expect(MathEngine.getOperationSymbol('-')).toBe('-');
            expect(MathEngine.getOperationSymbol('*')).toBe('×');
            expect(MathEngine.getOperationSymbol('/')).toBe('÷');
        });

        test('returns original for unknown operation', () => {
            expect(MathEngine.getOperationSymbol('%')).toBe('%');
        });
    });

    describe('difficulty configuration', () => {
        test('level 1 uses single digit operands', () => {
            for (let i = 0; i < 50; i++) {
                const problem = MathEngine.generateProblem('+', 1);
                expect(problem.operand1).toBeLessThanOrEqual(10);
                expect(problem.operand2).toBeLessThanOrEqual(10);
            }
        });

        test('level 2 uses larger operands', () => {
            const config = MathEngine.getDifficultyConfig(2);
            expect(config.maxOperand).toBe(20);
        });

        test('level 3 uses largest operands', () => {
            const config = MathEngine.getDifficultyConfig(3);
            expect(config.maxOperand).toBe(50);
        });
    });
});
