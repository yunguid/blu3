// Handles player input
import { sendToServer } from './network.js';
import { setCurrentPlayerId } from './playerState.js';

let playerId = null;

export function setPlayerId(id) {
    playerId = id;
    setCurrentPlayerId(id);
}

export function handleInput() {
    document.onmousemove = (event) => {
        if (playerId) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const position = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            sendToServer({ type: 'move', position });
        }
    };
} 