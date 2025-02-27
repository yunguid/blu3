// Manages client-side game state and game loop
import { render } from './renderer.js';
import { handleInput } from './player.js';
import { checkPlayerAlive } from './playerState.js';

let gameState = {
    players: {},
    orbs: []
};

function startGame() {
    const gameLoop = () => {
        handleInput();
        render(gameState);
        requestAnimationFrame(gameLoop);
    };
    gameLoop();
}

export function updateGameState(newState) {
    gameState = newState;
    // Check if our player is still alive
    checkPlayerAlive(newState.players);
}

export { startGame }; 