// Client entry point: initializes the game and connects to the server
import { initNameModal } from './nameModal.js';
import { initRenderer, render, createOrbCollectEffect, createVictoryEffect, updateLeaderboard } from './renderer.js';

// Main game initialization and loop
let socket = null;
let playerId = null;
let playerName = '';
let selectedProjectileType = 'default'; // Add variable for projectile type selection
let gameData = {
    players: {},
    orbs: []
};

// Weapon configurations and descriptions
const weaponTypes = {
    'default': {
        name: 'Default Shot',
        description: 'Balanced damage and speed',
        color: '#FFFFFF',
        icon: '✦'
    },
    'fast': {
        name: 'Fast Shot',
        description: 'Quick but low damage',
        color: '#88CCFF',
        icon: '⟫'
    },
    'powerful': {
        name: 'Powerful Shot',
        description: 'High damage but slow',
        color: '#FF8800',
        icon: '⁂'
    },
    'aoe': {
        name: 'AOE Shot',
        description: 'Area damage effect',
        color: '#CC88FF',
        icon: '◎'
    }
};

// Make weaponTypes accessible globally for the renderer
window.weaponTypes = weaponTypes;
// Share selected weapon type with renderer
window.selectedProjectileType = selectedProjectileType;

// Game elements - wrap in try/catch to debug any DOM issues
let gameContainer, canvas, ctx, chatInput, chatMessages, nameModal, nameInput, submitNameBtn, leaderboardEl;

try {
    gameContainer = document.getElementById('gameContainer');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    chatInput = document.getElementById('chatInput');
    chatMessages = document.getElementById('chatMessages');
    nameModal = document.getElementById('nameModal');
    nameInput = document.getElementById('nameInput');
    submitNameBtn = document.getElementById('submitName');
    leaderboardEl = document.getElementById('leaderboardList');
    
    // Log elements for debugging
    console.log('DOM Elements loaded:', {
        gameContainer: !!gameContainer,
        canvas: !!canvas,
        ctx: !!ctx,
        nameModal: !!nameModal,
        nameInput: !!nameInput
    });
} catch (error) {
    console.error('Error loading DOM elements:', error);
}

// Audio elements
let bgMusic;
let collectSound;
let specialCollectSound;
let victorySound;
let absorptionSound;

// Initialize game
function init() {
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize audio
    initAudio();
    
    // For debugging - log DOM elements state 
    console.log('Name Modal exists:', !!nameModal);
    console.log('Game Container exists:', !!gameContainer);
    
    // Force show name modal with inline styles to bypass CSS issues
    if (nameModal) {
        nameModal.style.display = 'flex';
        nameModal.style.opacity = '1';
        nameModal.classList.add('active');
        console.log('Name modal forced active with inline styles');
        
        // Also add style to modal content for visibility
        const modalContent = nameModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }
    } else {
        console.error('Name modal element not found!');
        // Try to create a fallback modal
        createFallbackModal();
    }
    
    if (gameContainer) {
        gameContainer.classList.add('hidden');
        gameContainer.style.display = 'none';
    } else {
        console.error('Game container element not found!');
    }

    // Handle name submission - moved inside init function
    try {
        if (nameInput && submitNameBtn) {
            nameInput.focus();
            submitNameBtn.addEventListener('click', submitName);
            nameInput.addEventListener('keypress', e => {
                if (e.key === 'Enter') submitName();
            });
        }
        
        // Chat input handling
        if (chatInput) {
            chatInput.addEventListener('keypress', e => {
                if (e.key === 'Enter' && chatInput.value.trim()) {
                    sendChatMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
    } catch (err) {
        console.error("Error setting up input handlers:", err);
    }
    
    // Initialize renderer with canvas
    try {
        if (canvas) {
            initRenderer();
            console.log('Renderer initialized');
        } else {
            console.error('Cannot initialize renderer - canvas element not found');
        }
    } catch (error) {
        console.error('Error initializing renderer:', error);
    }
    
    // Add game UI styles
    addGameStyles();
    
    // Connect to server
    connectToServer();
    console.log('Init complete');
}

function createFallbackModal() {
    console.log('Creating fallback modal');
    const fallbackModal = document.createElement('div');
    fallbackModal.id = 'fallbackNameModal';
    fallbackModal.style.position = 'fixed';
    fallbackModal.style.top = '0';
    fallbackModal.style.left = '0';
    fallbackModal.style.width = '100%';
    fallbackModal.style.height = '100%';
    fallbackModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    fallbackModal.style.display = 'flex';
    fallbackModal.style.justifyContent = 'center';
    fallbackModal.style.alignItems = 'center';
    fallbackModal.style.zIndex = '9999';
    
    fallbackModal.innerHTML = `
        <div style="background: #1E3A8A; padding: 30px; border-radius: 10px; text-align: center; width: 400px;">
            <h2 style="color: gold; margin-bottom: 20px;">Enter Your Wizard Name</h2>
            <input type="text" id="fallbackNameInput" placeholder="Your name here" 
                style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 5px; border: 1px solid gold;">
            <button id="fallbackSubmitBtn" 
                style="background: gold; color: #1E3A8A; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                Enter Game
            </button>
        </div>
    `;
    
    document.body.appendChild(fallbackModal);
    
    // Set up fallback submit handler
    const fallbackInput = document.getElementById('fallbackNameInput');
    const fallbackBtn = document.getElementById('fallbackSubmitBtn');
    
    if (fallbackBtn && fallbackInput) {
        fallbackBtn.addEventListener('click', () => {
            const name = fallbackInput.value.trim();
            if (name) {
                playerName = name;
                fallbackModal.style.display = 'none';
                if (gameContainer) {
                    gameContainer.classList.remove('hidden');
                    gameContainer.style.display = 'flex';
                }
                
                // Send name to server
                if (socket) {
                    socket.send(JSON.stringify({
                        type: 'setName',
                        name: playerName
                    }));
                }
                
                // Start game loop
                requestAnimationFrame(gameLoop);
                setupControls();
                createWeaponSelector();
            }
        });
        
        fallbackInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fallbackBtn.click();
            }
        });
        
        // Focus the input
        fallbackInput.focus();
    }
}

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth - 350; // Leave space for sidebar
        canvas.height = window.innerHeight;
    }
}

function initAudio() {
    // Create audio elements with empty URLs to avoid missing file errors
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    collectSound = new Audio();
    collectSound.volume = 0.2;
    
    specialCollectSound = new Audio();
    specialCollectSound.volume = 0.3;
    
    victorySound = new Audio();
    victorySound.volume = 0.4;
    
    absorptionSound = new Audio();
    absorptionSound.volume = 0.3;
    
    console.log("Audio initialized (placeholders)");
}

// Create and update connection status indicator
let connectionIndicator = null;

function createConnectionIndicator() {
    // Create the indicator element if it doesn't exist yet
    if (!connectionIndicator) {
        connectionIndicator = document.createElement('div');
        connectionIndicator.className = 'connection-indicator connecting';
        connectionIndicator.dataset.status = 'Connecting...';
        document.body.appendChild(connectionIndicator);
        
        // Add click handler to attempt manual reconnection
        connectionIndicator.addEventListener('click', () => {
            if (connectionIndicator.classList.contains('disconnected')) {
                showSystemMessage('Attempting to reconnect...');
                connectToServer();
            }
        });
    }
    return connectionIndicator;
}

function updateConnectionStatus(status, message) {
    const indicator = createConnectionIndicator();
    
    // Remove all status classes
    indicator.classList.remove('connected', 'connecting', 'disconnected');
    
    // Add appropriate class
    indicator.classList.add(status);
    
    // Update tooltip
    indicator.dataset.status = message;
    
    console.log(`Connection status updated: ${status} - ${message}`);
}

function addGameStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Connection status indicator */
        .connection-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            z-index: 9999;
            cursor: pointer;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        .connection-indicator.connected {
            background-color: #2ecc71; /* Green for connected */
        }
        
        .connection-indicator.connecting {
            background-color: #f39c12; /* Orange for connecting */
            animation: pulse 1s infinite;
        }
        
        .connection-indicator.disconnected {
            background-color: #e74c3c; /* Red for disconnected */
        }
        
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* Tooltip for connection indicator */
        .connection-indicator::after {
            content: attr(data-status);
            position: absolute;
            top: -25px;
            right: 0;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            white-space: nowrap;
            visibility: hidden;
            opacity: 0;
            transition: visibility 0s, opacity 0.3s;
        }
        
        .connection-indicator:hover::after {
            visibility: visible;
            opacity: 1;
        }
        
        .system-notification {
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: 'Press Start 2P', cursive;
            font-size: 16px;
            text-align: center;
            z-index: 1000;
            opacity: 1;
            transition: opacity 1s ease;
        }
        
        .system-notification.fade-out {
            opacity: 0;
        }
        
        .victory-modal .modal-content {
            background-color: rgba(26, 26, 46, 0.95);
            border: 2px solid gold;
            text-shadow: 0 0 10px gold;
        }
        
        .victory-modal h2 {
            color: gold;
            font-size: 32px;
        }
        
        .fireworks {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }
        
        .spark {
            position: absolute;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            animation: spark 1s forwards;
            opacity: 0;
        }
        
        @keyframes spark {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: scale(20) rotate(45deg);
                opacity: 0;
            }
        }
        
        .death-modal .modal-content {
            background-color: rgba(46, 26, 26, 0.95);
            border: 2px solid #e74c3c;
        }
        
        .death-modal h2 {
            color: #e74c3c;
        }
        
        .modal.fade-out {
            opacity: 0;
        }
        
        .mini-map {
            position: absolute;
            bottom: 20px;
            right: 370px;
            width: 150px;
            height: 150px;
            background-color: rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 5px;
        }
        
        .weapon-selector {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            background-color: rgba(14, 17, 40, 0.85);
            padding: 8px;
            border-radius: 50px;
            border: 1px solid rgba(218, 165, 32, 0.5);
            z-index: 100;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .weapon-selector.hidden {
            opacity: 0;
            transform: translateX(-50%) translateY(100px);
            pointer-events: none;
        }
        
        .weapon-option {
            width: 50px;
            height: 50px;
            margin: 0 5px;
            border-radius: 50%;
            background-color: rgba(20, 20, 40, 0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .weapon-option:hover {
            background-color: rgba(40, 40, 80, 0.8);
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .weapon-option.selected {
            background-color: rgba(60, 60, 120, 0.8);
            box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.3);
            transform: translateY(-5px) scale(1.1);
            border-color: rgba(255, 255, 255, 0.5);
        }
        
        .weapon-key {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: rgba(218, 165, 32, 0.9);
            color: black;
            font-size: 10px;
            font-weight: bold;
            width: 16px;
            height: 16px;
            line-height: 16px;
            text-align: center;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }
        
        .weapon-icon {
            font-size: 24px;
            line-height: 1;
            text-shadow: 0 0 5px currentColor;
        }
        
        .weapon-icon.large {
            font-size: 28px;
        }
        
        .weapon-icon.giant {
            font-size: 80px;
            text-shadow: 0 0 20px currentColor;
        }
        
        .current-weapon {
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(14, 17, 40, 0.85);
            padding: 10px 15px;
            border-radius: 40px;
            display: flex;
            align-items: center;
            border: 1px solid rgba(218, 165, 32, 0.3);
            z-index: 99;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(5px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .current-weapon.hidden {
            opacity: 0;
            transform: translateX(-50%) translateY(30px);
            pointer-events: none;
        }
        
        .weapon-info {
            margin-left: 15px;
        }
        
        .weapon-name {
            color: white;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .weapon-desc {
            color: rgba(255, 255, 255, 0.7);
            font-size: 11px;
        }
        
        .weapon-switch-effect {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 0.3s ease-out;
            z-index: 200;
        }
        
        .weapon-switch-effect.active {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .weapon-switch-effect.fade-out {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
        }
        
        .weapon-switch-name {
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-top: 10px;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .weapon-toggle-btn {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(0);
            width: 40px;
            height: 40px;
            background-color: rgba(14, 17, 40, 0.85);
            border: 1px solid rgba(218, 165, 32, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 101;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .weapon-toggle-btn.hidden {
            transform: translateX(-50%) translateY(70px);
        }
        
        .weapon-toggle-btn::before {
            content: "⚔️";
            font-size: 20px;
        }
        
        .weapon-toggle-btn:hover {
            transform: translateX(-50%) translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
        }
        
        .weapon-toggle-btn.active {
            background-color: rgba(60, 60, 120, 0.8);
        }
        
        .weapon-toggle-btn.active::before {
            content: "✕";
            color: rgba(255, 255, 255, 0.9);
        }
        
        .key-hint {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.6);
            font-size: 10px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .weapon-toggle-btn:hover .key-hint {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

function connectToServer() {
    // Connect to WebSocket server
    let serverUrl;
    
    // Get gameId from URL or use a default
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game') || 'default';
    
    // Add debug mode
    const debugMode = urlParams.get('debug') === 'true';
    if (debugMode) {
        console.log('Debug mode enabled');
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('JavaScript error:', message, 'at', source, lineno, colno);
            console.error('Error object:', error);
            showSystemMessage(`JS Error: ${message}`);
            return true;
        };
    }
    
    // Check if we're in production (Vercel) or development (localhost)
    if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('localhost') === false) {
        // Production environment - use the network server URL with gameId parameter
        // Railway.app deployment - use standard URL without port
        serverUrl = `wss://blu3-production.up.railway.app?gameId=${gameId}`;
        
        // Fallback options if needed
        if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
            // Local development - connect to local server
            serverUrl = `ws://localhost:3000?gameId=${gameId}`;
        }
        
        // If we're on a different domain than the WebSocket server, update the protocol
        if (window.location.protocol === 'https:') {
            // Make sure we're using secure WebSockets with HTTPS
            if (!serverUrl.startsWith('wss://')) {
                serverUrl = serverUrl.replace('ws://', 'wss://');
                if (!serverUrl.startsWith('wss://')) {
                    serverUrl = 'wss://' + serverUrl.replace('https://', '').replace('http://', '');
                }
            }
        }
    } else {
        // Local development environment
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = 'localhost';
        const port = '3000';
        serverUrl = `${protocol}//${host}:${port}`;
    }
    
    console.log('Connecting to server:', serverUrl);
    updateConnectionStatus('connecting', 'Connecting to game server...');
    socket = new WebSocket(serverUrl);
    
    // Setup socket event handlers
    socket.onopen = () => {
        console.log('Connected to server');
        updateConnectionStatus('connected', 'Connected to game server');
        showSystemMessage('Connected to server');
        
        // Reset reconnect attempts on successful connection
        reconnectAttempts = 0;
        
        // Start periodic ping to keep connection alive and detect disconnects quickly
        startPingInterval();
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateConnectionStatus('disconnected', 'Connection error');
        showSystemMessage(`Connection error! Attempting to recover...`);
        
        // Log more detailed error information
        console.log('WebSocket error details:');
        console.log('- Socket state:', socket ? socket.readyState : 'null');
        console.log('- Socket URL:', serverUrl);
        console.log('- Navigator online:', navigator.onLine);
        
        // Try to force reconnection after error
        try {
            // Gracefully close socket if possible
            if (socket && socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
                socket.close(1000, 'Closing due to error');
            }
        } catch (closeError) {
            console.error('Error while closing socket after error:', closeError);
        }
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
            case 'init':
                playerId = data.id;
                break;
                
            case 'update':
                gameData = data.state;
                break;
                
            case 'chat':
            case 'chatMessage':
                console.log('Received chat message:', data);
                addChatMessage(data);
                break;
                
            case 'chatHistory':
                // Load chat history
                data.messages.forEach(msg => addChatMessage(msg));
                break;
                
            case 'collectOrb':
                // Create a visual effect when collecting an orb
                if (data.position) {
                    createOrbCollectEffect(data.position.x, data.position.y, data.isSpecial);
                    
                    // Play sound effect (with try/catch for safety)
                    try {
                        if (data.isSpecial) {
                            specialCollectSound.currentTime = 0;
                            specialCollectSound.play().catch(e => console.log('Audio play prevented:', e));
                            
                            // Show speed boost notification
                            showSystemMessage('Speed boost activated! (5 seconds)');
                        } else {
                            collectSound.currentTime = 0;
                            collectSound.play().catch(e => console.log('Audio play prevented:', e));
                        }
                    } catch (e) {
                        console.log("Sound error:", e);
                    }
                }
                break;
                
            case 'speedBoostEnded':
                // Speed boost has ended
                showSystemMessage('Speed boost ended');
                break;
                
            case 'victory':
                // Player won the game
                victorySound.currentTime = 0;
                victorySound.play().catch(e => console.log('Audio play prevented:', e));
                
                // Create victory visual effect
                if (gameData.players && gameData.players[playerId]) {
                    const player = gameData.players[playerId];
                    createVictoryEffect(player.position.x, player.position.y);
                }
                
                // Show victory message
                showVictoryModal();
                break;
                
            case 'hit':
                // Player was hit by a projectile
                const hitMessage = data.isAoe 
                    ? `You were hit by an AOE blast! Lost ${Math.floor(data.damage)} size` 
                    : `You were hit! Lost ${Math.floor(data.damage)} size`;
                showSystemMessage(hitMessage);
                // Play hit sound
                try {
                    absorptionSound.currentTime = 0;
                    absorptionSound.play().catch(e => console.log('Audio play prevented:', e));
                } catch (e) {}
                break;
                
            case 'hitConfirmed':
                // Player hit someone with their projectile
                const hitConfirmMessage = data.isAoe 
                    ? `AOE hit confirmed! Damaged player by ${Math.floor(data.damage)} size` 
                    : `Hit confirmed! Damaged player by ${Math.floor(data.damage)} size`;
                showSystemMessage(hitConfirmMessage);
                break;
                
            case 'projectileCreated':
                // Show successful shoot message
                console.log('Projectile created with type:', data.projectileType || 'unknown');
                showSystemMessage(`${data.projectileType || 'Default'} projectile fired!`);
                break;
                
            case 'absorbed':
                // Player was absorbed by another player
                absorptionSound.currentTime = 0;
                absorptionSound.play().catch(e => console.log('Audio play prevented:', e));
                showDeathModal(data.by);
                break;
                
            case 'gameReset':
                // Game was reset after a victory
                showSystemMessage('The game has been reset! A new battle begins!');
                break;
                
            case 'systemMessage':
                // Display system message
                showSystemMessage(data.message);
                break;
        }
    };
    
    // Configure reconnection behavior
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5; // Increased from 3 to 5
    const RECONNECT_DELAY = 3000; // 3 seconds
    
    // Initialize a variable to track if a reconnection is already in progress
    let isReconnecting = false;
    
    socket.onclose = (event) => {
        console.log('Disconnected from server. Code:', event.code, 'Reason:', event.reason);
        updateConnectionStatus('disconnected', 'Disconnected - Click to reconnect');
        
        // Stop ping interval
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
            console.log('Ping interval cleared due to socket close');
        }
        
        // Prevent multiple simultaneous reconnection attempts
        if (isReconnecting) {
            console.log('Reconnection already in progress, skipping new attempt');
            return;
        }
        
        // Only attempt to reconnect a few times
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            isReconnecting = true;
            const delay = RECONNECT_DELAY * (reconnectAttempts + 1); // Exponential backoff
            reconnectAttempts++;
            
            console.log(`Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
            showSystemMessage(`Connection lost. Reconnecting in ${delay/1000} seconds...`);
            updateConnectionStatus('connecting', `Reconnecting in ${delay/1000}s (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            
            setTimeout(() => {
                console.log('Attempting to reconnect now...');
                connectToServer();
                isReconnecting = false;
            }, delay);
        } else {
            console.log('Max reconnect attempts reached. Please refresh the page.');
            showSystemMessage('Connection issues. Please refresh the page to try again. (Max reconnect attempts reached)');
            updateConnectionStatus('disconnected', 'Failed to connect - Refresh page');
        }
    };
    
    // Also handle pong responses
    socket.addEventListener('message', function(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'pong') {
                // Update last pong time for connection monitoring
                lastPongTime = Date.now();
                console.log('Received pong from server, updated lastPongTime:', lastPongTime);
            }
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });
}

// Show system message
function showSystemMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'system-notification';
    messageContainer.textContent = message;
    
    document.body.appendChild(messageContainer);
    
    // Fade out after a few seconds
    setTimeout(() => {
        messageContainer.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 1000);
    }, 4000);
}

// Show victory modal
function showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active victory-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Victory!</h2>
            <p>You have won this magical battle!</p>
            <p>The game will reset for a new battle.</p>
            <div class="fireworks"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add fireworks animation
    const fireworks = modal.querySelector('.fireworks');
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.left = Math.random() * 100 + '%';
            spark.style.top = Math.random() * 100 + '%';
            spark.style.backgroundColor = ['#FFD700', '#FF6347', '#00FFFF', '#FF00FF', '#7FFF00'][Math.floor(Math.random() * 5)];
            fireworks.appendChild(spark);
            
            // Remove spark after animation
            setTimeout(() => {
                fireworks.removeChild(spark);
            }, 1000);
        }, i * 300);
    }
    
    // Remove modal after a few seconds
    setTimeout(() => {
        modal.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 1000);
    }, 5000);
}

// Show death modal when player is absorbed
function showDeathModal(killerName) {
    const modal = document.createElement('div');
    modal.className = 'modal active death-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>You were absorbed!</h2>
            <p>${killerName} has absorbed your magical power.</p>
            <p>Click anywhere to respawn.</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Remove modal on click
    document.addEventListener('click', () => {
        modal.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 1000);
    }, { once: true });
}

function submitName() {
    console.log('Submit name called');
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        
        // Hide the modal with inline styles for extra certainty
        if (nameModal) {
            nameModal.classList.remove('active');
            nameModal.style.display = 'none';
            console.log('Name modal hidden');
        }
        
        // Show the game container with inline styles
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            gameContainer.style.display = 'flex';
            console.log('Game container shown');
        }
        
        // Check if socket is connected before sending
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('Sending name to server:', playerName);
            try {
                socket.send(JSON.stringify({
                    type: 'setName',
                    name: playerName
                }));
            } catch (error) {
                console.error('Error sending name to server:', error);
                showSystemMessage('Connection error! Could not send name to server.');
            }
        } else {
            console.error('Socket not connected! ReadyState:', socket ? socket.readyState : 'null');
            showSystemMessage('Connection error! Not connected to server.');
            
            // Try reconnecting
            if (socket && socket.readyState !== WebSocket.CONNECTING) {
                console.log('Attempting to reconnect...');
                connectToServer();
            }
        }
        
        // Start game loop
        requestAnimationFrame(gameLoop);
        
        // Setup controls after name is submitted
        setupControls();
        
        // Create weapon selector UI
        createWeaponSelector();
    }
}

function setupControls() {
    console.log('Setting up controls');
    try {
        // Check if canvas exists before adding event listeners
        if (canvas) {
            // Mouse movement
            canvas.addEventListener('mousemove', handleMouseMove);
            
            // Mobile touch controls
            canvas.addEventListener('touchmove', handleTouchMove);
            
            // Mouse up and down
            canvas.addEventListener('mousedown', () => isMoving = true);
            canvas.addEventListener('mouseup', () => isMoving = false);
            canvas.addEventListener('mouseout', () => isMoving = false);
            
            // Touch start and end
            canvas.addEventListener('touchstart', () => isMoving = true);
            canvas.addEventListener('touchend', () => isMoving = false);
            
            // Add zoom controls (mousewheel)
            canvas.addEventListener('wheel', handleZoom);
            
            console.log('Canvas event listeners added');
        } else {
            console.error('Cannot set up canvas controls - canvas element not found!');
            showSystemMessage('Error: Game canvas not found!');
        }
    } catch (error) {
        console.error('Error setting up controls:', error);
    }
    
    // Add keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    
    // Add projectile type selection with number keys
    document.addEventListener('keydown', (e) => {
        console.log('Key pressed:', e.key);
        if (e.key === '1') {
            console.log('Selecting fast projectile');
            selectWeapon('fast');
        } else if (e.key === '2') {
            console.log('Selecting powerful projectile');
            selectWeapon('powerful');
        } else if (e.key === '3') {
            console.log('Selecting aoe projectile');
            selectWeapon('aoe');
        } else if (e.key === '0') {
            console.log('Selecting default projectile');
            selectWeapon('default');
        } else if (e.key === 'Tab') {
            // Toggle weapon selector when Tab is pressed
            e.preventDefault(); // Prevent focus switching
            toggleWeaponSelector();
        }
    });
    
    // Start continuous movement loop
    startContinuousMovement();
}

// Store last cursor position to allow continuous movement
let lastCursorX = 0;
let lastCursorY = 0;
let isMoving = false;

function handleMouseMove(e) {
    if (!socket || !playerId || !gameData.players || !gameData.players[playerId]) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Always store the last cursor position
    lastCursorX = mouseX;
    lastCursorY = mouseY;
    
    // Calculate direction vector (from center of screen)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Direction from center of screen
    const dirX = mouseX - centerX;
    const dirY = mouseY - centerY;
    
    // Calculate distance from center
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // Smaller deadzone for responsiveness
    const deadzone = 10;
    
    // Update movement state
    if (length > deadzone) {
        if (!isMoving) {
            isMoving = true;
            // Start continuous movement
            startContinuousMovement();
        }
    } else {
        isMoving = false;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!socket || !playerId || !e.touches[0] || !gameData.players || !gameData.players[playerId]) return;
    
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;
    
    // Store the last touch position for continuous movement
    lastCursorX = touchX;
    lastCursorY = touchY;
    
    // Calculate direction vector from center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Direction from center of screen
    const dirX = touchX - centerX;
    const dirY = touchY - centerY;
    
    // Calculate distance from center
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // Smaller deadzone for responsiveness
    const deadzone = 10;
    
    // Update movement state
    if (length > deadzone) {
        if (!isMoving) {
            isMoving = true;
            // Start continuous movement
            startContinuousMovement();
        }
    } else {
        isMoving = false;
    }
}

// Movement and camera control variables
let targetZoom = 1;
const zoomSmoothness = 0.1; // Lower value = smoother but slower
window.cameraZoom = 1; // Initialize global zoom
const movementUpdateInterval = 33; // ~30fps for movement updates

// Continuous movement function that sends updates at a fixed rate
function startContinuousMovement() {
    // Clear any existing intervals
    if (window.movementInterval) {
        clearInterval(window.movementInterval);
    }
    
    // Set up interval for movement updates
    window.movementInterval = setInterval(() => {
        if (!isMoving || !socket || !playerId || !gameData.players || !gameData.players[playerId]) return;
        
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate direction based on last cursor position
        const dirX = lastCursorX - centerX;
        const dirY = lastCursorY - centerY;
        
        // Calculate distance from center
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Only move if we have a direction
        if (length > 0) {
            // Normalized direction
            const normalizedDirX = dirX / length;
            const normalizedDirY = dirY / length;
            
            // Increased base speed for faster movement
            let baseSpeed = 2.0;
            
            // Speed proportional to distance from center with a softer curve
            // min: baseSpeed, max: baseSpeed + 5
            let speedFactor = Math.min(length / 200, 1);
            let speed = baseSpeed + (speedFactor * 5);
            
            // We'll let the server handle the speed boost now
            // by not applying it client-side to avoid conflicts
            
            // Send direction to server
            socket.send(JSON.stringify({
                type: 'direction',
                dirX: normalizedDirX,
                dirY: normalizedDirY,
                speed: speed
            }));
        }
    }, movementUpdateInterval);
}

function handleZoom(e) {
    // Zoom is handled client-side for better performance
    e.preventDefault();
    const zoomFactor = 0.05; // Reduced from 0.1 for finer control
    
    // Initialize if not set
    if (typeof window.cameraZoom === 'undefined') {
        window.cameraZoom = 1;
        targetZoom = 1;
    }
    
    if (e.deltaY < 0) {
        // Zoom in - update target but not actual zoom
        targetZoom = Math.min(2, targetZoom + zoomFactor);
    } else {
        // Zoom out - update target but not actual zoom
        targetZoom = Math.max(0.5, targetZoom - zoomFactor);
    }
    
    // Actual zoom update happens in the animation loop
    if (!window.zoomAnimationActive) {
        window.zoomAnimationActive = true;
        requestAnimationFrame(updateZoom);
    }
}

function updateZoom() {
    // Smoothly interpolate towards target zoom
    if (Math.abs(window.cameraZoom - targetZoom) > 0.001) {
        window.cameraZoom += (targetZoom - window.cameraZoom) * zoomSmoothness;
        requestAnimationFrame(updateZoom);
    } else {
        window.cameraZoom = targetZoom; // Snap to exact value when close enough
        window.zoomAnimationActive = false;
    }
}

function handleKeyDown(e) {
    // Add keyboard shortcuts
    if (e.key === 'c' || e.key === 'C') {
        // Focus chat input
        chatInput.focus();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        // Shoot projectile when space is pressed
        shootProjectile();
    }
}

// Connection monitoring variables
let pingInterval = null;
let lastPongTime = 0;
const PING_INTERVAL = 10000; // 10 seconds
const PONG_TIMEOUT = 15000; // 15 seconds

// Function to start pinging the server periodically
function startPingInterval() {
    // Clear any existing interval
    if (pingInterval) {
        clearInterval(pingInterval);
        console.log('Cleared existing ping interval');
    }
    
    // Reset last pong time
    lastPongTime = Date.now();
    console.log('Starting ping interval with initial lastPongTime:', lastPongTime);
    
    // Start the interval
    pingInterval = setInterval(() => {
        if (!socket) {
            console.warn('Socket is null, clearing ping interval');
            clearInterval(pingInterval);
            return;
        }
        
        if (socket.readyState !== WebSocket.OPEN) {
            console.warn('Socket not open, state:', socket.readyState, 'clearing ping interval');
            clearInterval(pingInterval);
            return;
        }
        
        // Check if we've received a pong recently
        const now = Date.now();
        console.log('Checking pong status. Last pong:', lastPongTime, 'Now:', now, 'Diff:', now - lastPongTime);
        
        if (now - lastPongTime > PONG_TIMEOUT) {
            console.warn('No pong received in', PONG_TIMEOUT, 'ms. Connection may be dead.');
            
            // Update UI to indicate connection issues
            showSystemMessage("Connection issues detected. Attempting to reconnect...");
            
            // Try to close gracefully before reconnecting
            try {
                console.log('Attempting to close socket before reconnecting');
                socket.close(1000, 'Connection timeout - reconnecting');
            } catch (e) {
                console.error('Error closing socket:', e);
            }
            
            // Reconnection will happen in the onclose handler
            return;
        }
        
        // Send ping
        try {
            console.log('Sending ping to server');
            socket.send(JSON.stringify({
                type: 'ping',
                timestamp: now
            }));
        } catch (e) {
            console.error('Error sending ping:', e);
            // Try to reconnect if ping sending fails
            try {
                socket.close();
            } catch (closeErr) {
                console.error('Error closing socket after ping failure:', closeErr);
            }
        }
    }, PING_INTERVAL);
    
    console.log('Ping interval started with frequency:', PING_INTERVAL, 'ms');
}

// Shooting mechanism
let lastShootTime = 0;
const SHOOT_COOLDOWN = 2000; // 2 seconds cooldown

function shootProjectile() {
    if (!socket || !playerId || !gameData.players || !gameData.players[playerId]) return;
    
    // Check cooldown
    const now = Date.now();
    if (now - lastShootTime < SHOOT_COOLDOWN) {
        // Still on cooldown
        const remainingCooldown = Math.ceil((SHOOT_COOLDOWN - (now - lastShootTime)) / 1000);
        showSystemMessage(`Shooting on cooldown (${remainingCooldown}s)`);
        return;
    }
    
    const player = gameData.players[playerId];
    
    // Minimum size check - can't shoot if too small
    if (player.size < 15) {
        showSystemMessage("You're too small to shoot!");
        return;
    }
    
    // Get current cursor direction
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dirX = lastCursorX - centerX;
    const dirY = lastCursorY - centerY;
    
    // Normalize direction
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    if (length === 0) return; // No direction
    
    const normalizedDirX = dirX / length;
    const normalizedDirY = dirY / length;
    
    // Update cooldown
    lastShootTime = now;
    window.lastShootTime = now; // Share with renderer
    
    // Send shoot command to server with projectile type
    // Ensure we're using the current selectedProjectileType
    // and update the window global variable to stay in sync
    console.log('Before sync - selectedProjectileType:', selectedProjectileType);
    console.log('Before sync - window.selectedProjectileType:', window.selectedProjectileType);
    
    window.selectedProjectileType = selectedProjectileType;
    
    console.log('After sync - selectedProjectileType:', selectedProjectileType);
    console.log('After sync - window.selectedProjectileType:', window.selectedProjectileType);
    
    // Create payload and log what's actually being sent
    const payload = {
        type: 'shoot',
        dirX: normalizedDirX,
        dirY: normalizedDirY,
        projectileType: selectedProjectileType
    };
    
    console.log('Sending payload to server:', payload);
    
    socket.send(JSON.stringify(payload));
    
    // Show visual feedback
    showSystemMessage(`Firing ${selectedProjectileType} shot!`);
}

function sendChatMessage(message) {
    if (!socket || !playerId) return;
    
    // Send chat message to server
    socket.send(JSON.stringify({
        type: 'chat',
        message,
        sender: playerName,
        color: gameData.players && gameData.players[playerId] ? gameData.players[playerId].color : '#ffffff'
    }));
}

function addChatMessage(data) {
    console.log("Received chat message:", data);
    
    if (!chatMessages) {
        console.error("Chat messages container not found");
        return;
    }
    
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    
    if (data.isSystem || data.type === 'system') {
        messageEl.classList.add('system-message');
        messageEl.textContent = data.text || data.content || 'System message';
    } else {
        // Handle both the client's format and the server's format
        const sender = data.sender || 'Unknown';
        const color = data.color || '#ffffff';
        const content = data.text || data.content || '';
        
        messageEl.innerHTML = `<span class="sender" style="color: ${color}">${sender}: </span>${content}`;
    }
    
    // Add to chat container with a slide-in animation
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(20px)';
    chatMessages.appendChild(messageEl);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animate in
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
    }, 10);
    
    // Limit chat messages
    while (chatMessages.children.length > 100) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

function updateGameLeaderboard() {
    if (!gameData || !gameData.players) return;
    
    // Update leaderboard using the imported function
    updateLeaderboard(gameData.players);
}

function gameLoop() {
    // Update leaderboard
    updateGameLeaderboard();
    
    // Render game
    render(gameData, playerId);
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Add weapon selection UI elements
function createWeaponSelector() {
    // Create the weapon selector
    const weaponSelector = document.createElement('div');
    weaponSelector.id = 'weaponSelector';
    weaponSelector.className = 'weapon-selector hidden'; // Start hidden
    
    // Add weapon type options
    const weaponTypes = ['default', 'fast', 'powerful', 'aoe'];
    const keyBindings = ['0', '1', '2', '3'];
    
    weaponTypes.forEach((type, index) => {
        const weaponOption = document.createElement('div');
        weaponOption.className = 'weapon-option';
        weaponOption.dataset.type = type;
        
        weaponOption.innerHTML = `
            <div class="weapon-key">${keyBindings[index]}</div>
            <div class="weapon-icon" style="color: ${getWeaponColor(type)}">${getWeaponIcon(type)}</div>
        `;
        
        // Add click handler
        weaponOption.addEventListener('click', () => {
            selectWeapon(type);
        });
        
        weaponSelector.appendChild(weaponOption);
    });
    
    document.body.appendChild(weaponSelector);
    
    // Create current weapon indicator
    const weaponIndicator = document.createElement('div');
    weaponIndicator.id = 'currentWeapon';
    weaponIndicator.className = 'current-weapon hidden'; // Start hidden
    document.body.appendChild(weaponIndicator);
    
    // Create toggle button
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'weaponToggleBtn';
    toggleBtn.className = 'weapon-toggle-btn';
    toggleBtn.innerHTML = `<span class="key-hint">Tab</span>`;
    toggleBtn.addEventListener('click', toggleWeaponSelector);
    document.body.appendChild(toggleBtn);
    
    // Initial update
    updateWeaponIndicator();
    
    // Show initially after short delay
    setTimeout(() => {
        toggleWeaponSelector(true);
        
        // Auto-hide after 5 seconds if no interaction
        setTimeout(() => {
            if (document.getElementById('weaponSelector') && 
                !document.getElementById('weaponSelector').classList.contains('hidden')) {
                toggleWeaponSelector(false);
            }
        }, 5000);
    }, 1000);
}

// Toggle weapon selector visibility
function toggleWeaponSelector(forceState) {
    const weaponSelector = document.getElementById('weaponSelector');
    const currentWeapon = document.getElementById('currentWeapon');
    const toggleBtn = document.getElementById('weaponToggleBtn');
    
    if (!weaponSelector || !currentWeapon || !toggleBtn) return;
    
    const shouldShow = forceState !== undefined ? 
        forceState : 
        weaponSelector.classList.contains('hidden');
    
    if (shouldShow) {
        weaponSelector.classList.remove('hidden');
        currentWeapon.classList.remove('hidden');
        toggleBtn.classList.add('active');
    } else {
        weaponSelector.classList.add('hidden');
        currentWeapon.classList.add('hidden');
        toggleBtn.classList.remove('active');
    }
}

function getWeaponColor(type) {
    return weaponTypes[type]?.color || '#FFFFFF';
}

function getWeaponIcon(type) {
    return weaponTypes[type]?.icon || '✦';
}

function getWeaponName(type) {
    return weaponTypes[type]?.name || 'Default Shot';
}

function getWeaponDescription(type) {
    return weaponTypes[type]?.description || 'Balanced damage and speed';
}

function selectWeapon(type) {
    if (weaponTypes[type]) {
        console.log('Selecting weapon type:', type);
        
        // Update both the local variable and the window global variable
        selectedProjectileType = type;
        window.selectedProjectileType = type;
        
        // Add more debugging to verify the update
        console.log('Updated selectedProjectileType:', selectedProjectileType);
        console.log('Updated window.selectedProjectileType:', window.selectedProjectileType);
        
        updateWeaponIndicator();
        
        // Add visual effect for weapon switch
        showWeaponSwitchEffect(type);
        
        // Show the selector UI if hidden
        const weaponSelector = document.getElementById('weaponSelector');
        const currentWeapon = document.getElementById('currentWeapon');
        if (weaponSelector && weaponSelector.classList.contains('hidden')) {
            weaponSelector.classList.remove('hidden');
            if (currentWeapon) currentWeapon.classList.remove('hidden');
            
            // Auto hide after 2.5 seconds
            setTimeout(() => {
                if (weaponSelector && !weaponSelector.classList.contains('hidden')) {
                    weaponSelector.classList.add('hidden');
                    if (currentWeapon) currentWeapon.classList.add('hidden');
                    if (document.getElementById('weaponToggleBtn')) {
                        document.getElementById('weaponToggleBtn').classList.remove('active');
                    }
                }
            }, 2500);
        }
    }
}

function updateWeaponIndicator() {
    const indicator = document.getElementById('currentWeapon');
    if (indicator) {
        indicator.innerHTML = `
            <div class="weapon-icon large" style="color: ${getWeaponColor(selectedProjectileType)}">${getWeaponIcon(selectedProjectileType)}</div>
            <div class="weapon-info">
                <div class="weapon-name">${getWeaponName(selectedProjectileType)}</div>
                <div class="weapon-desc">${getWeaponDescription(selectedProjectileType)}</div>
            </div>
        `;
        
        // Highlight the selected weapon in the selector
        const options = document.querySelectorAll('.weapon-option');
        options.forEach(option => {
            if (option.dataset.type === selectedProjectileType) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
}

function showWeaponSwitchEffect(type) {
    // Create a large icon that fades out for weapon switching
    const switchEffect = document.createElement('div');
    switchEffect.className = 'weapon-switch-effect';
    switchEffect.innerHTML = `
        <div class="weapon-icon giant" style="color: ${getWeaponColor(type)}">${getWeaponIcon(type)}</div>
        <div class="weapon-switch-name">${getWeaponName(type)}</div>
    `;
    
    document.body.appendChild(switchEffect);
    
    // Animate
    setTimeout(() => {
        switchEffect.classList.add('active');
        
        // Remove after animation
        setTimeout(() => {
            switchEffect.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(switchEffect);
            }, 500);
        }, 1000);
    }, 10);
}

// Handle page unload (tab closed, refresh, etc.)
window.addEventListener('beforeunload', () => {
    // Attempt to close the WebSocket connection cleanly
    if (socket && socket.readyState === WebSocket.OPEN) {
        // Send a close message first
        try {
            socket.send(JSON.stringify({
                type: 'userDisconnect',
                message: 'User closed the page'
            }));
        } catch (e) {
            console.error('Error sending disconnect message:', e);
        }
        
        // Then close the socket
        try {
            socket.close(1000, 'User closed the page');
        } catch (e) {
            console.error('Error closing socket on page unload:', e);
        }
    }
    
    // Clear any intervals
    if (pingInterval) {
        clearInterval(pingInterval);
    }
    
    if (window.movementInterval) {
        clearInterval(window.movementInterval);
    }
});

// Start the game
document.addEventListener('DOMContentLoaded', init);