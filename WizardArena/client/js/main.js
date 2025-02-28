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

// Game elements
const gameContainer = document.getElementById('gameContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');
const submitNameBtn = document.getElementById('submitName');
const leaderboardEl = document.getElementById('leaderboardList');

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
    
    // Show name modal first
    nameModal.classList.add('active');
    gameContainer.classList.add('hidden');
    
    // Handle name submission
    nameInput.focus();
    submitNameBtn.addEventListener('click', submitName);
    nameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') submitName();
    });
    
    // Chat input handling
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && chatInput.value.trim()) {
            sendChatMessage(chatInput.value);
            chatInput.value = '';
        }
    });
    
    // Initialize renderer with canvas
    initRenderer();
    
    // Add game UI styles
    addGameStyles();
    
    // Connect to server
    connectToServer();
}

function resizeCanvas() {
    canvas.width = window.innerWidth - 350; // Leave space for sidebar
    canvas.height = window.innerHeight;
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

function addGameStyles() {
    const style = document.createElement('style');
    style.textContent = `
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
    socket = new WebSocket(serverUrl);
    
    // Setup socket event handlers
    socket.onopen = () => {
        console.log('Connected to server');
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        showSystemMessage(`Connection error! Check console for details.`);
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
    
    // Limit reconnection attempts to prevent loops
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 3;
    
    socket.onclose = (event) => {
        console.log('Disconnected from server. Code:', event.code, 'Reason:', event.reason);
        
        // Only attempt to reconnect a few times
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log(`Reconnect attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
            reconnectAttempts++;
            setTimeout(connectToServer, 3000); // Try to reconnect after 3 seconds
        } else {
            console.log('Max reconnect attempts reached. Please refresh the page.');
            showSystemMessage('Connection issues. Please refresh the page to try again.');
        }
    };
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
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        nameModal.classList.remove('active');
        gameContainer.classList.remove('hidden');
        
        // Send name to server
        socket.send(JSON.stringify({
            type: 'setName',
            name: playerName
        }));
        
        // Start game loop
        requestAnimationFrame(gameLoop);
        
        // Setup controls after name is submitted
        setupControls();
        
        // Create weapon selector UI
        createWeaponSelector();
    }
}

function setupControls() {
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
    
    // Add keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    
    // Add projectile type selection with number keys
    document.addEventListener('keydown', (e) => {
        if (e.key === '1') {
            selectWeapon('fast');
        } else if (e.key === '2') {
            selectWeapon('powerful');
        } else if (e.key === '3') {
            selectWeapon('aoe');
        } else if (e.key === '0') {
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
    socket.send(JSON.stringify({
        type: 'shoot',
        dirX: normalizedDirX,
        dirY: normalizedDirY,
        projectileType: selectedProjectileType
    }));
    
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
    
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    
    if (data.isSystem) {
        messageEl.classList.add('system-message');
        messageEl.textContent = data.text;
    } else {
        messageEl.innerHTML = `<span class="sender" style="color: ${data.color || '#ffffff'}">${data.sender || 'Unknown'}: </span>${data.text}`;
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
        selectedProjectileType = type;
        // Update global for renderer access
        window.selectedProjectileType = type;
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

// Start the game
document.addEventListener('DOMContentLoaded', init);