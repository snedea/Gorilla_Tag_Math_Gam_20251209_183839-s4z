# Scout Report: Gorilla Tag Math Game

## What We're Building

A math education game themed around Gorilla Tag - the popular VR game where players swing through environments as gorillas. The game will present math problems to players, likely using Gorilla Tag's aesthetic (jungle environments, gorilla characters, swinging/movement mechanics as metaphors or rewards).

This is a greenfield project with no existing codebase. We're building from scratch.

## Requirements

- Math problem generation (likely arithmetic: addition, subtraction, multiplication, division)
- Gorilla Tag theming (jungle visuals, gorilla character, possibly movement-based interactions)
- Score tracking and progression
- Age-appropriate difficulty levels
- Engaging feedback for correct/incorrect answers

## Stack

- **Frontend**: HTML5/CSS3/JavaScript (vanilla or lightweight framework)
- **Backend**: None initially - client-side only for simplicity
- **Database**: localStorage for progress/scores
- **Testing**: Manual testing, potentially Jest for logic

## Architecture

1. **Static web app** - deployable anywhere, no server dependencies
2. **Modular math engine** - separate problem generation from UI
3. **Progressive difficulty** - start easy, scale up based on performance
4. **Theme layer** - Gorilla Tag assets/styling isolated for easy modification

## Risks

- **Asset licensing**: Gorilla Tag is a trademarked game - use inspired-by styling, not official assets
- **Scope creep**: Keep V1 simple - basic math operations, single player
- **Accessibility**: Ensure the game works without VR (this is a web game, not actual VR)

## Project State

- **Existing code**: None
- **Dependencies**: None defined yet
- **Build system**: Not established

## Recommendation

Start with a minimal viable product:
1. HTML page with gorilla-themed styling
2. Math problem display + answer input
3. Score counter
4. 3 difficulty levels
5. Celebratory feedback (gorilla animations/sounds)
