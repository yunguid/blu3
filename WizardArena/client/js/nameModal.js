// Handles the name entry modal
import { connectToServer } from './network.js';
import { setPlayerName } from './chat.js';
import { startGame } from './game.js';
import { initChat } from './chat.js';
import { initPlayerState } from './playerState.js';

let playerName = '';

export function initNameModal() {
    const modal = document.getElementById('nameModal');
    const nameInput = document.getElementById('playerNameInput');
    const joinButton = document.getElementById('joinGameButton');
    
    // Focus the input field
    nameInput.focus();
    
    // Handle button click
    joinButton.addEventListener('click', handleJoin);
    
    // Handle enter key
    nameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleJoin();
        }
    });
    
    // Prevent closing by clicking outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            nameInput.focus();
        }
    });
}

function handleJoin() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        // Name too short, show error
        nameInput.style.border = '2px solid #e74c3c';
        nameInput.placeholder = 'Name must be at least 2 characters';
        nameInput.value = '';
        nameInput.focus();
        
        // Reset after 2 seconds
        setTimeout(() => {
            nameInput.style.border = 'none';
            nameInput.placeholder = 'Your Wizard Name';
        }, 2000);
        
        return;
    }
    
    // Store the name and hide modal
    playerName = name;
    hideModal();
    showGameContainer();
    
    // Start the game with this name
    initGame(playerName);
}

function hideModal() {
    const modal = document.getElementById('nameModal');
    modal.classList.add('hidden');
}

function showGameContainer() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.classList.remove('hidden');
}

export function getPlayerName() {
    return playerName;
}

function initGame(name) {
    // Connect to server first to ensure we don't miss any messages
    connectToServer('ws://10.0.0.78:8080');
    
    // Initialize the chat
    initChat();
    
    // Set the player name
    setPlayerName(name);
    
    // Initialize player state
    initPlayerState();
    
    // Start the game
    startGame();
} 