// Manages player state and reset functionality
import { sendToServer } from './network.js';
import { setPlayerId } from './player.js';

let isAlive = true;
let currentPlayerId = null;

export function setCurrentPlayerId(id) {
    currentPlayerId = id;
    isAlive = true;
}

export function checkPlayerAlive(players) {
    // If we had an ID but now we don't exist in the players list, we're dead
    if (currentPlayerId && isAlive && !players[currentPlayerId]) {
        handlePlayerDeath();
    }
}

function handlePlayerDeath() {
    isAlive = false;
    showResetButton();
}

function showResetButton() {
    const resetButton = document.getElementById('resetButton');
    resetButton.classList.remove('hidden');
    
    resetButton.addEventListener('click', resetGame);
}

function resetGame() {
    // Hide the reset button
    const resetButton = document.getElementById('resetButton');
    resetButton.classList.add('hidden');
    
    // Reset player ID
    currentPlayerId = null;
    
    // Tell the server to reset this player
    sendToServer({ type: 'reset' });
}

// Initialize the reset button event listener
export function initPlayerState() {
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', resetGame);
} 