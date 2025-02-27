// Handles WebSocket communication for multi-network gameplay
import { setPlayerId } from './player.js';
import { updateGameState } from './game.js';
import { receiveMessage } from './chat.js';

let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;
let gameId = null;

/**
 * Connect to game server
 * @param {string} url - WebSocket URL of the server
 * @param {string} gameSessionId - Optional game session ID to join
 */
export function connectToServer(url, gameSessionId = null) {
    // Store the game ID for reconnection
    if (gameSessionId) {
        gameId = gameSessionId;
    }
    
    // Extract game ID from URL parameters if not provided
    if (!gameId && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const gameParam = urlParams.get('game');
        if (gameParam) {
            gameId = gameParam;
        }
    }
    
    // Construct the WebSocket URL with game ID if available
    let wsUrl = url;
    if (gameId) {
        // Add gameId as a URL parameter
        wsUrl = `${url}${url.includes('?') ? '&' : '?'}gameId=${gameId}`;
    }
    
    // Create WebSocket connection
    socket = new WebSocket(wsUrl);
    
    // Connection opened
    socket.onopen = () => {
        console.log('Connected to server');
        reconnectAttempts = 0;
    };
    
    // Listen for messages
    socket.onmessage = (message) => {
        try {
            const data = JSON.parse(message.data);
            handleServerMessage(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };
    
    // Connection error
    socket.onerror = (err) => {
        console.error('WebSocket error:', err);
    };
    
    // Connection closed
    socket.onclose = (event) => {
        console.log('Disconnected from server, code:', event.code);
        
        // Handle reconnection logic
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log(`Attempting to reconnect in ${RECONNECT_DELAY / 1000}s... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
            
            setTimeout(() => {
                reconnectAttempts++;
                connectToServer(url, gameId);
            }, RECONNECT_DELAY);
        } else {
            console.error('Maximum reconnection attempts reached. Please refresh the page.');
            
            // Show reconnection error to user
            displayConnectionError();
        }
    };
}

/**
 * Handle messages from the server
 * @param {Object} data - Message data from server
 */
function handleServerMessage(data) {
    switch (data.type) {
        case 'init':
            // Initial connection setup
            setPlayerId(data.id);
            
            // Store game ID if provided
            if (data.gameId) {
                gameId = data.gameId;
                
                // Update URL with game ID for sharing
                if (window.history && window.history.replaceState) {
                    const newUrl = `${window.location.origin}${window.location.pathname}?game=${gameId}`;
                    window.history.replaceState({}, document.title, newUrl);
                }
            }
            break;
            
        case 'update':
            // Game state update
            updateGameState(data.state);
            break;
            
        case 'chatMessage':
            // Chat message from another player
            receiveMessage({
                type: 'chat',
                sender: data.sender,
                color: data.color || '#ffffff',
                text: data.content
            });
            break;
            
        case 'system':
            // System message
            receiveMessage({
                type: 'system',
                text: data.content
            });
            break;
            
        case 'error':
            // Error message from server
            console.error('Server error:', data.message);
            
            // Show error to user
            receiveMessage({
                type: 'system',
                text: `Error: ${data.message}`
            });
            break;
            
        case 'collectOrb':
            // Player collected an orb
            // This is handled by the main.js eventHandler
            window.dispatchEvent(new CustomEvent('orbCollected', { detail: data }));
            break;
            
        case 'hit':
            // Player was hit by a projectile
            window.dispatchEvent(new CustomEvent('playerHit', { detail: data }));
            break;
            
        case 'hitConfirmed':
            // Player's projectile hit someone
            window.dispatchEvent(new CustomEvent('hitConfirmed', { detail: data }));
            break;
            
        case 'projectileCreated':
            // Player successfully created a projectile
            window.dispatchEvent(new CustomEvent('projectileCreated'));
            break;
            
        case 'absorbed':
            // Player was absorbed by another player
            window.dispatchEvent(new CustomEvent('playerAbsorbed', { detail: data }));
            break;
            
        case 'victory':
            // Player won the game
            window.dispatchEvent(new CustomEvent('playerVictory'));
            break;
            
        case 'gameReset':
            // Game was reset
            window.dispatchEvent(new CustomEvent('gameReset'));
            break;
            
        case 'speedBoostEnded':
            // Speed boost has ended
            window.dispatchEvent(new CustomEvent('speedBoostEnded'));
            break;
            
        default:
            console.log('Unknown message type:', data.type);
    }
}

/**
 * Send data to the server
 * @param {Object} data - Data to send
 * @returns {boolean} - Whether the message was sent
 */
export function sendToServer(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        return true;
    }
    return false;
}

/**
 * Get the current game ID
 * @returns {string|null} - Current game ID or null
 */
export function getCurrentGameId() {
    return gameId;
}

/**
 * Create a new game session
 * @param {string} name - Game session name
 * @param {number} maxPlayers - Maximum players allowed
 * @param {boolean} isPrivate - Whether the game is private
 * @returns {Promise} - Promise resolving to the created game session
 */
export async function createGame(name, maxPlayers = 10, isPrivate = false) {
    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, maxPlayers, isPrivate })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to create game');
        }
        
        // Store game ID for later use
        gameId = data.gameId;
        
        return data;
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
}

/**
 * Get list of available public games
 * @returns {Promise} - Promise resolving to list of games
 */
export async function getPublicGames() {
    try {
        const response = await fetch('/api/games');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch games');
        }
        
        return data.games;
    } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
    }
}

/**
 * Get information about a specific game
 * @param {string} id - Game ID
 * @returns {Promise} - Promise resolving to game info
 */
export async function getGameInfo(id) {
    try {
        const response = await fetch(`/api/games/${id}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch game information');
        }
        
        return data.game;
    } catch (error) {
        console.error('Error fetching game info:', error);
        throw error;
    }
}

/**
 * Display connection error message to user
 */
function displayConnectionError() {
    // Create error message element
    const errorMsg = document.createElement('div');
    errorMsg.className = 'connection-error';
    errorMsg.innerHTML = `
        <div class="error-content">
            <h2>Connection Lost</h2>
            <p>Unable to connect to the game server after multiple attempts.</p>
            <button id="reconnectBtn">Try Again</button>
        </div>
    `;
    
    // Style the error message
    errorMsg.style.position = 'fixed';
    errorMsg.style.top = '0';
    errorMsg.style.left = '0';
    errorMsg.style.width = '100%';
    errorMsg.style.height = '100%';
    errorMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    errorMsg.style.display = 'flex';
    errorMsg.style.justifyContent = 'center';
    errorMsg.style.alignItems = 'center';
    errorMsg.style.zIndex = '1000';
    
    // Add to document
    document.body.appendChild(errorMsg);
    
    // Add click handler for reconnect button
    document.getElementById('reconnectBtn').addEventListener('click', () => {
        // Remove error message
        document.body.removeChild(errorMsg);
        
        // Reset reconnect attempts
        reconnectAttempts = 0;
        
        // Try to reconnect
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname || 'localhost';
        const port = window.location.port || '3000';
        connectToServer(`${protocol}//${host}:${port}`, gameId);
    });
} 