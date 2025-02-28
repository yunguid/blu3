const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const dotenv = require('dotenv');
const { createGameSession, getGameSession, getAllGameSessions, deleteGameSession } = require('./gameSessionManager');

// Create a simple fallback error logger that's compatible with Edge Runtime
const errorLogger = {
    handleClientError: (data, clientInfo) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            client: clientInfo,
            error: data
        };
        console.error('Client error:', logEntry);
    },
    handleClientLog: (data, clientInfo) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            client: clientInfo,
            log: data
        };
        console.log('Client log:', logEntry);
    },
    getClientErrorLogs: (limit) => [],
    getClientConsoleLogs: (limit) => []
};

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
app.use(express.json());
app.use(cors());

// Enable parsing of JSON bodies
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ 
    server,
    // Enable client tracking
    clientTracking: true
});

// Store active connections by game session
const gameConnections = new Map();

// Admin dashboard route for viewing client errors
app.get('/admin/logs', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/admin.html'));
});

// API endpoints for logs
app.get('/api/logs/errors', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json(errorLogger.getClientErrorLogs(limit));
});

app.get('/api/logs/console', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json(errorLogger.getClientConsoleLogs(limit));
});

// API endpoint to create a new game
app.post('/api/games', (req, res) => {
    try {
        // Create a new game with unique ID
        const gameId = uuidv4();
        const gameName = req.body.name || `Game ${gameId.substring(0, 6)}`;
        const maxPlayers = req.body.maxPlayers || 10;
        const isPrivate = req.body.isPrivate || false;
        
        // Create the game session
        const gameSession = createGameSession(gameId, {
            name: gameName,
            maxPlayers,
            isPrivate,
            createdAt: new Date().toISOString(),
            players: {}
        });
        
        // Initialize connections for this game
        gameConnections.set(gameId, new Set());
        
        // Return the game session data with shareable link
        res.status(201).json({
            success: true,
            gameId,
            gameUrl: `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`}/game/${gameId}`,
            session: gameSession
        });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ success: false, error: 'Failed to create game' });
    }
});

// API endpoint to list public games
app.get('/api/games', (req, res) => {
    try {
        // Get all game sessions
        const allSessions = getAllGameSessions();
        
        // Filter out private games and add player counts
        const publicGames = Object.entries(allSessions)
            .filter(([id, session]) => !session.isPrivate)
            .map(([id, session]) => {
                const connections = gameConnections.get(id) || new Set();
                return {
                    id,
                    name: session.name,
                    playerCount: Object.keys(session.players).length,
                    maxPlayers: session.maxPlayers,
                    createdAt: session.createdAt
                };
            });
        
        res.json({ success: true, games: publicGames });
    } catch (error) {
        console.error('Error listing games:', error);
        res.status(500).json({ success: false, error: 'Failed to list games' });
    }
});

// API endpoint to get a specific game
app.get('/api/games/:gameId', (req, res) => {
    try {
        const { gameId } = req.params;
        const gameSession = getGameSession(gameId);
        
        if (!gameSession) {
            return res.status(404).json({ success: false, error: 'Game not found' });
        }
        
        const connections = gameConnections.get(gameId) || new Set();
        
        res.json({
            success: true,
            game: {
                id: gameId,
                name: gameSession.name,
                playerCount: Object.keys(gameSession.players).length,
                maxPlayers: gameSession.maxPlayers,
                isPrivate: gameSession.isPrivate,
                createdAt: gameSession.createdAt
            }
        });
    } catch (error) {
        console.error('Error getting game:', error);
        res.status(500).json({ success: false, error: 'Failed to get game information' });
    }
});

// Client redirect for game links
app.get('/game/:gameId', (req, res) => {
    // Serve the index.html but with gameId injected as a variable
    const { gameId } = req.params;
    res.redirect(`/?game=${gameId}`);
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    try {
        // Get connection info
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        // Get gameId from URL parameters - handle malformed URLs gracefully
        let gameId = null;
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            gameId = url.searchParams.get('gameId');
        } catch (error) {
            console.warn('Invalid URL in WebSocket connection:', req.url);
            
            // Try a simpler parsing approach as fallback
            const urlParts = req.url.split('?');
            if (urlParts.length > 1) {
                const searchParams = new URLSearchParams(urlParts[1]);
                gameId = searchParams.get('gameId');
            }
        }
        
        // Generate a unique player ID
        const playerId = uuidv4();
        
        // Store client info with the websocket
        ws.clientInfo = {
            ip,
            id: playerId,
            gameId,
            userAgent,
            connectedAt: new Date().toISOString()
        };
        
        // Check player limit before adding to game
        const MAX_PLAYERS_PER_GAME = 20; // Define a reasonable limit
        
        // Check if game exists
        let gameSession = null;
        if (gameId) {
            gameSession = getGameSession(gameId);
            if (!gameSession) {
                // Game doesn't exist
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Game not found. The game may have expired or been deleted.'
                }));
                ws.close();
                return;
            }
            
            // Check if game is full
            if (Object.keys(gameSession.players).length >= (gameSession.maxPlayers || MAX_PLAYERS_PER_GAME)) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Game is full. Please try another game or create a new one.'
                }));
                ws.close();
                return;
            }
            
            // Add connection to the game's connections set
            if (!gameConnections.has(gameId)) {
                gameConnections.set(gameId, new Set());
            }
            gameConnections.get(gameId).add(ws);
            
            // Initialize the player in the game session with safe starting values
            gameSession.players[playerId] = {
                id: playerId,
                name: '',
                position: generateRandomPosition(),
                color: getRandomColor(),
                size: 15,
                score: 0,
                velocityX: 0,
                velocityY: 0,
                lastActive: Date.now()
            };
            
            console.log(`Player ${playerId} connected to game ${gameId} from ${ip}`);
        } else {
            // No gameId provided - this is a general connection
            console.log(`Player ${playerId} connected without a game ID from ${ip}`);
        }
        
        // Send initial data to the player
        ws.send(JSON.stringify({
            type: 'init',
            id: playerId,
            gameId,
            timestamp: Date.now(),
            message: gameId ? 'Connected to game' : 'Connected to server'
        }));
    } catch (error) {
        console.error('Error handling WebSocket connection:', error);
        
        // Try to send error to client
        try {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Server error occurred during connection. Please try again.'
            }));
        } catch (sendError) {
            console.error('Could not send error message to client:', sendError);
        }
        
        // Close connection
        try {
            ws.close();
        } catch (closeError) {
            console.error('Error closing WebSocket:', closeError);
        }
    }
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            // Safety checks
            if (!ws.clientInfo) {
                console.error('WebSocket missing clientInfo');
                return;
            }
            
            const playerId = ws.clientInfo.id;
            const gameId = ws.clientInfo.gameId;
            let gameSession = null;
            
            // Get the latest game session if we have a gameId
            if (gameId) {
                gameSession = getGameSession(gameId);
                if (!gameSession) {
                    // Game was deleted or expired
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game no longer exists'
                    }));
                    ws.close();
                    return;
                }
            }
            
            // Update player's last active timestamp if they exist in a game
            if (gameSession && gameSession.players[playerId]) {
                gameSession.players[playerId].lastActive = Date.now();
            }
            
            // Parse message data
            let data;
            try {
                data = JSON.parse(message);
                
                // Validate data has a type
                if (!data.type) {
                    throw new Error('Message missing type property');
                }
            } catch (parseError) {
                console.error('Invalid message format:', message.toString().substring(0, 100));
                return;
            }
            
            // Process messages based on their type
            switch (data.type) {
                case 'setName':
                    if (gameSession && gameSession.players[playerId]) {
                        // Sanitize name - prevent HTML injection and limit length
                        const sanitizedName = (data.name || '')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/&/g, '&amp;')
                            .trim()
                            .substring(0, 20); // Enforce reasonable name length
                        
                        if (!sanitizedName) {
                            // Don't accept empty names
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Name cannot be empty'
                            }));
                            return;
                        }
                        
                        // Update player name in game session
                        gameSession.players[playerId].name = sanitizedName;
                        ws.clientInfo.name = sanitizedName;
                        
                        // Broadcast player joined message
                        broadcastToGame(gameId, {
                            type: 'system',
                            content: `${sanitizedName} has joined the game!`
                        });
                        
                        // Send current game state to the player
                        ws.send(JSON.stringify({
                            type: 'update',
                            state: createGameState(gameSession)
                        }));
                    }
                    break;
                
                case 'move':
                    if (gameSession && gameSession.players[playerId]) {
                        // Validate position data
                        if (data.position && 
                            typeof data.position.x === 'number' && 
                            typeof data.position.y === 'number' &&
                            isFinite(data.position.x) && 
                            isFinite(data.position.y)) {
                            
                            // Enforce map boundaries
                            const mapWidth = 5000;
                            const mapHeight = 5000;
                            
                            // Update player position with boundary checks
                            gameSession.players[playerId].position = {
                                x: Math.max(0, Math.min(mapWidth, data.position.x)),
                                y: Math.max(0, Math.min(mapHeight, data.position.y))
                            };
                        }
                    }
                    break;
                
                case 'direction':
                    if (gameSession && gameSession.players[playerId]) {
                        // Validate direction data
                        if (typeof data.dirX === 'number' && 
                            typeof data.dirY === 'number' && 
                            typeof data.speed === 'number' &&
                            isFinite(data.dirX) && 
                            isFinite(data.dirY) && 
                            isFinite(data.speed)) {
                            
                            // Normalize direction vector if it's too large
                            let dirX = data.dirX;
                            let dirY = data.dirY;
                            const length = Math.sqrt(dirX * dirX + dirY * dirY);
                            if (length > 1) {
                                dirX /= length;
                                dirY /= length;
                            }
                            
                            // Cap speed to reasonable maximum
                            const MAX_SPEED = 10;
                            const speed = Math.min(Math.abs(data.speed), MAX_SPEED);
                            
                            // Set player velocity based on direction and speed
                            const player = gameSession.players[playerId];
                            player.velocityX = dirX * speed;
                            player.velocityY = dirY * speed;
                        }
                    }
                    break;
                
                case 'shoot':
                    if (gameSession && gameSession.players[playerId]) {
                        // Validate direction data
                        if (typeof data.dirX === 'number' && 
                            typeof data.dirY === 'number' &&
                            isFinite(data.dirX) && 
                            isFinite(data.dirY)) {
                            
                            // Normalize direction vector
                            let dirX = data.dirX;
                            let dirY = data.dirY;
                            const length = Math.sqrt(dirX * dirX + dirY * dirY);
                            if (length > 0) { // Avoid division by zero
                                dirX /= length;
                                dirY /= length;
                                
                                // Rate limit shooting (once per second)
                                const player = gameSession.players[playerId];
                                const now = Date.now();
                                
                                if (!player.lastShootTime || now - player.lastShootTime >= 2000) {
                                    player.lastShootTime = now;
                                    handlePlayerShoot(gameSession, playerId, dirX, dirY);
                                }
                            }
                        }
                    }
                    break;
                
                case 'chat':
                    if (gameSession) {
                        // Rate limit chat messages (1 per second)
                        const now = Date.now();
                        if (ws.clientInfo.lastChatTime && now - ws.clientInfo.lastChatTime < 1000) {
                            return; // Silent rate limiting
                        }
                        ws.clientInfo.lastChatTime = now;
                        
                        // Sanitize message content
                        const sanitizedMessage = (data.message || '')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/&/g, '&amp;')
                            .trim()
                            .substring(0, 200); // Limit message length
                        
                        if (sanitizedMessage) {
                            // Get player name (sanitized)
                            const senderName = (data.sender || gameSession.players[playerId]?.name || 'Anonymous')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/&/g, '&amp;');
                            
                            // Broadcast chat message to all players in game
                            broadcastToGame(gameId, {
                                type: 'chatMessage',
                                sender: senderName,
                                content: sanitizedMessage,
                                color: gameSession.players[playerId]?.color || '#ffffff',
                                timestamp: now
                            });
                        }
                    }
                    break;
                
                case 'ping':
                    // Handle ping requests for connection health checks
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now(),
                        echo: data.timestamp || null
                    }));
                    break;
                
                case 'client_error':
                    // Handle client error reporting
                    errorLogger.handleClientError(data, ws.clientInfo);
                    break;
                
                case 'client_log':
                    // Handle client console log reporting
                    errorLogger.handleClientLog(data, ws.clientInfo);
                    break;
                    
                default:
                    console.warn(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            
            // Try to send error back to client
            try {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Server error processing your request'
                }));
            } catch (sendError) {
                // Log and continue
                console.error('Could not send error response:', sendError);
            }
        }
    });
    
    // Handle disconnect
    ws.on('close', () => {
        try {
            // Safety checks
            if (!ws.clientInfo) {
                console.error('Websocket disconnected but no clientInfo available');
                return;
            }
            
            const playerId = ws.clientInfo.id;
            const gameId = ws.clientInfo.gameId;
            
            if (gameId) {
                // Get the latest game session
                const gameSession = getGameSession(gameId);
                
                if (gameSession) {
                    console.log(`Player ${playerId} disconnected from game ${gameId}`);
                    
                    // Get the player's name before removing them
                    const playerName = gameSession.players[playerId]?.name;
                    
                    // Remove player from game session
                    if (gameSession.players[playerId]) {
                        delete gameSession.players[playerId];
                    }
                    
                    // Remove from game connections
                    if (gameConnections.has(gameId)) {
                        gameConnections.get(gameId).delete(ws);
                        
                        // If no players left in game, clean up the game
                        if (gameConnections.get(gameId).size === 0) {
                            console.log(`Game ${gameId} has no players left, cleaning up`);
                            gameConnections.delete(gameId);
                            deleteGameSession(gameId);
                        } else if (playerName) {
                            // Notify remaining players
                            broadcastToGame(gameId, {
                                type: 'system',
                                content: `${playerName} has left the arena`,
                                timestamp: Date.now()
                            });
                        }
                    }
                } else {
                    console.log(`Player ${playerId} disconnected from non-existent game ${gameId}`);
                }
            } else {
                console.log(`Player ${playerId} disconnected (no game)`);
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
    
    // Error handling for the WebSocket connection
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        
        // Try to close the connection cleanly
        try {
            ws.close();
        } catch (closeError) {
            console.error('Error closing WebSocket after error:', closeError);
        }
    });
});

// Broadcast a message to all clients in a specific game
function broadcastToGame(gameId, message) {
    if (!gameId || !gameConnections.has(gameId)) return;
    
    const connections = gameConnections.get(gameId);
    let failedConnections = 0;
    
    connections.forEach(client => {
        try {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            } else if (client.readyState === WebSocket.CLOSED || client.readyState === WebSocket.CLOSING) {
                // Count but don't try to send to already closed connections
                failedConnections++;
            }
        } catch (error) {
            console.error(`Error broadcasting to client in game ${gameId}:`, error);
            failedConnections++;
            
            // Try to close problematic connections
            try {
                client.close();
            } catch (closeError) {
                // Just log and continue
                console.error('Error closing problematic connection:', closeError);
            }
        }
    });
    
    // Log if there were a significant number of failed sends
    if (failedConnections > 0 && failedConnections > connections.size / 4) { // More than 25% failed
        console.warn(`Game ${gameId}: ${failedConnections}/${connections.size} failed broadcasts`);
    }
}

// Generate a random position for new players
function generateRandomPosition() {
    const mapWidth = 5000;
    const mapHeight = 5000;
    const margin = 200;
    
    return {
        x: margin + Math.random() * (mapWidth - 2 * margin),
        y: margin + Math.random() * (mapHeight - 2 * margin)
    };
}

// Generate a random color for player
function getRandomColor() {
    const colors = [
        '#FF5252', // Red
        '#FF4081', // Pink
        '#E040FB', // Purple
        '#7C4DFF', // Deep Purple
        '#536DFE', // Indigo
        '#448AFF', // Blue
        '#40C4FF', // Light Blue
        '#18FFFF', // Cyan
        '#64FFDA', // Teal
        '#69F0AE', // Green
        '#B2FF59', // Light Green
        '#EEFF41', // Lime
        '#FFFF00', // Yellow
        '#FFD740', // Amber
        '#FFAB40', // Orange
        '#FF6E40'  // Deep Orange
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Handle player shooting
function handlePlayerShoot(gameSession, playerId, dirX, dirY) {
    const player = gameSession.players[playerId];
    if (!player) return;
    
    // Check if player is large enough to shoot
    if (player.size < 15) {
        return;
    }
    
    // Reduce player size when shooting
    player.size -= 5;
    
    // Initialize projectiles array if it doesn't exist
    if (!gameSession.projectiles) {
        gameSession.projectiles = [];
    }
    
    // Create new projectile
    const projectileId = uuidv4();
    const projectileSpeed = 12;
    const projectileSize = 8;
    
    const projectile = {
        id: projectileId,
        playerId: playerId,
        playerColor: player.color,
        position: { 
            x: player.position.x + (dirX * (player.size + 10)), 
            y: player.position.y + (dirY * (player.size + 10))
        },
        velocity: {
            x: dirX * projectileSpeed,
            y: dirY * projectileSpeed
        },
        size: projectileSize,
        damage: 10,
        timeToLive: 120 // 4 seconds at 30fps
    };
    
    gameSession.projectiles.push(projectile);
    
    // Notify player that projectile was created
    const targetConn = findPlayerConnection(playerId, gameSession.id);
    if (targetConn) {
        targetConn.send(JSON.stringify({
            type: 'projectileCreated'
        }));
    }
}

// Find player connection
function findPlayerConnection(playerId, gameId) {
    if (!gameConnections.has(gameId)) return null;
    
    for (const conn of gameConnections.get(gameId)) {
        if (conn.clientInfo && conn.clientInfo.id === playerId) {
            return conn;
        }
    }
    
    return null;
}

// Create a game state snapshot for sending to clients
function createGameState(gameSession) {
    return {
        players: gameSession.players,
        projectiles: gameSession.projectiles || [],
        orbs: gameSession.orbs || [],
        timestamp: Date.now()
    };
}

// Update game logic (movement, collisions, etc.)
function updateGame(gameSession) {
    if (!gameSession) return;
    
    // Game constants
    const MAP_WIDTH = 5000;
    const MAP_HEIGHT = 5000;
    const MIN_PLAYER_SIZE = 10;  // Minimum size before being "absorbed"
    const INITIAL_PLAYER_SIZE = 15;
    const PLAYER_ABSORB_BONUS = 10;
    const PLAYER_ABSORB_SCORE = 50;
    
    // Get current timestamp for activity checking
    const now = Date.now();
    const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    
    // Check for inactive players and remove them
    Object.entries(gameSession.players).forEach(([id, player]) => {
        if (player.lastActive && now - player.lastActive > INACTIVE_TIMEOUT) {
            console.log(`Removing inactive player ${player.name || id} from game ${gameSession.id}`);
            
            // Broadcast system message about inactive player
            if (player.name) {
                broadcastToGame(gameSession.id, {
                    type: 'system',
                    content: `${player.name} has been removed due to inactivity`,
                    timestamp: now
                });
            }
            
            // Remove the player
            delete gameSession.players[id];
            
            // Find and close their connection
            const playerConn = findPlayerConnection(id, gameSession.id);
            if (playerConn) {
                try {
                    playerConn.close();
                } catch (error) {
                    console.error(`Error closing inactive player connection:`, error);
                }
            }
        }
    });
    
    // Update player positions based on velocity
    Object.values(gameSession.players).forEach(player => {
        if (!isNaN(player.velocityX) && !isNaN(player.velocityY) && 
            (player.velocityX !== 0 || player.velocityY !== 0)) {
            
            // Move player by velocity
            if (!isNaN(player.position.x) && !isNaN(player.position.y)) {
                player.position.x += player.velocityX;
                player.position.y += player.velocityY;
                
                // Ensure player stays within map bounds
                player.position.x = Math.max(0, Math.min(MAP_WIDTH, player.position.x));
                player.position.y = Math.max(0, Math.min(MAP_HEIGHT, player.position.y));
            } else {
                // Reset invalid position
                console.warn(`Resetting invalid position for player ${player.id}`);
                player.position = generateRandomPosition();
            }
        }
    });
    
    // Update projectiles
    if (gameSession.projectiles) {
        for (let i = gameSession.projectiles.length - 1; i >= 0; i--) {
            const projectile = gameSession.projectiles[i];
            
            // Safety check for invalid projectile
            if (!projectile || !projectile.position || !projectile.velocity) {
                gameSession.projectiles.splice(i, 1);
                continue;
            }
            
            // Move projectile
            projectile.position.x += projectile.velocity.x;
            projectile.position.y += projectile.velocity.y;
            
            // Reduce time to live
            projectile.timeToLive--;
            
            // Check for map boundaries
            if (
                projectile.position.x < 0 || 
                projectile.position.x > MAP_WIDTH || 
                projectile.position.y < 0 || 
                projectile.position.y > MAP_HEIGHT ||
                projectile.timeToLive <= 0
            ) {
                // Remove projectile
                gameSession.projectiles.splice(i, 1);
                continue;
            }
            
            // Check for collisions with players
            let collisionOccurred = false;
            
            Object.entries(gameSession.players).forEach(([id, player]) => {
                // Skip if collision already occurred or invalid player data
                if (collisionOccurred || !player || !player.position) return;
                
                // Skip collision with the player who fired the projectile
                if (id === projectile.playerId) return;
                
                // Calculate distance between projectile and player
                const dx = projectile.position.x - player.position.x;
                const dy = projectile.position.y - player.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Check if collision occurred
                if (distance < player.size + projectile.size) {
                    collisionOccurred = true;
                    
                    // Get the shooter info
                    const shooter = gameSession.players[projectile.playerId];
                    if (!shooter) return; // Shooter left the game
                    
                    // Damage player (decrease size) with bounds check
                    const damage = projectile.damage || 1;
                    player.size = Math.max(0, player.size - damage);
                    
                    // Increase shooter's score
                    shooter.score += damage;
                    
                    // Remove projectile
                    gameSession.projectiles.splice(i, 1);
                    
                    // Notify the hit player
                    const hitPlayerConn = findPlayerConnection(id, gameSession.id);
                    if (hitPlayerConn && hitPlayerConn.readyState === WebSocket.OPEN) {
                        try {
                            hitPlayerConn.send(JSON.stringify({
                                type: 'hit',
                                damage: damage,
                                by: shooter ? shooter.name || 'Unknown Wizard' : 'Unknown',
                                timestamp: now
                            }));
                        } catch (error) {
                            console.error('Error sending hit notification:', error);
                        }
                    }
                    
                    // Notify the shooter
                    const shooterConn = findPlayerConnection(projectile.playerId, gameSession.id);
                    if (shooterConn && shooterConn.readyState === WebSocket.OPEN) {
                        try {
                            shooterConn.send(JSON.stringify({
                                type: 'hitConfirmed',
                                damage: damage,
                                target: player.name || 'Unknown Wizard',
                                timestamp: now
                            }));
                        } catch (error) {
                            console.error('Error sending hit confirmation:', error);
                        }
                    }
                    
                    // Check if player was "killed" (size too small)
                    if (player.size < MIN_PLAYER_SIZE) {
                        // Player is absorbed
                        
                        // Increase shooter size and score
                        shooter.size += PLAYER_ABSORB_BONUS;
                        shooter.score += PLAYER_ABSORB_SCORE;
                        
                        // Notify player of death
                        if (hitPlayerConn && hitPlayerConn.readyState === WebSocket.OPEN) {
                            try {
                                hitPlayerConn.send(JSON.stringify({
                                    type: 'absorbed',
                                    by: shooter.name || 'Unknown Wizard',
                                    timestamp: now
                                }));
                            } catch (error) {
                                console.error('Error sending absorbed notification:', error);
                            }
                        }
                        
                        // Reset player
                        player.position = generateRandomPosition();
                        player.size = INITIAL_PLAYER_SIZE;
                        player.score = 0;
                        player.velocityX = 0;
                        player.velocityY = 0;
                        
                        // Broadcast system message
                        broadcastToGame(gameSession.id, {
                            type: 'system',
                            content: `${player.name || 'An unnamed wizard'} was absorbed by ${shooter.name || 'an unknown force'}!`,
                            timestamp: now
                        });
                    }
                }
            });
        }
    }
    
    // Ensure orbs exist
    if (!gameSession.orbs) {
        gameSession.orbs = generateInitialOrbs();
    }
    
    // Check for orb collection
    Object.entries(gameSession.players).forEach(([id, player]) => {
        for (let i = gameSession.orbs.length - 1; i >= 0; i--) {
            const orb = gameSession.orbs[i];
            
            // Calculate distance between player and orb
            const dx = player.position.x - orb.position.x;
            const dy = player.position.y - orb.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if player collected the orb
            if (distance < player.size + orb.size) {
                // Collect orb
                if (orb.isSpecial) {
                    // Special orb gives speed boost and more points
                    player.score += 10;
                    
                    // Notify player of speed boost
                    const playerConn = findPlayerConnection(id, gameSession.id);
                    if (playerConn) {
                        playerConn.send(JSON.stringify({
                            type: 'collectOrb',
                            position: orb.position,
                            isSpecial: true
                        }));
                    }
                } else {
                    // Regular orb just increases size
                    player.size += 1;
                    player.score += 1;
                    
                    // Notify player of orb collection
                    const playerConn = findPlayerConnection(id, gameSession.id);
                    if (playerConn) {
                        playerConn.send(JSON.stringify({
                            type: 'collectOrb',
                            position: orb.position,
                            isSpecial: false
                        }));
                    }
                }
                
                // Remove collected orb
                gameSession.orbs.splice(i, 1);
                
                // Add a new orb
                gameSession.orbs.push(generateOrb());
            }
        }
    });
    
    // Check for victory condition
    const victorySize = 100;
    let winner = null;
    
    Object.entries(gameSession.players).forEach(([id, player]) => {
        if (player.size >= victorySize) {
            winner = player;
        }
    });
    
    if (winner) {
        // We have a winner!
        broadcastToGame(gameSession.id, {
            type: 'system',
            content: `${winner.name} has won the game with a score of ${winner.score}!`
        });
        
        // Notify the winning player
        const winnerConn = findPlayerConnection(winner.id, gameSession.id);
        if (winnerConn) {
            winnerConn.send(JSON.stringify({
                type: 'victory'
            }));
        }
        
        // Reset the game after 5 seconds
        setTimeout(() => {
            resetGame(gameSession);
        }, 5000);
    }
}

// Generate a single random orb
function generateOrb() {
    const mapWidth = 5000;
    const mapHeight = 5000;
    const margin = 50;
    
    const isSpecial = Math.random() < 0.1; // 10% chance for special orb
    
    return {
        id: uuidv4(),
        position: {
            x: margin + Math.random() * (mapWidth - 2 * margin),
            y: margin + Math.random() * (mapHeight - 2 * margin)
        },
        color: isSpecial ? getRandomSpecialOrbColor() : getRandomOrbColor(),
        size: isSpecial ? 15 : 8,
        isSpecial
    };
}

// Generate initial set of orbs
function generateInitialOrbs() {
    const orbCount = 200;
    const orbs = [];
    
    for (let i = 0; i < orbCount; i++) {
        orbs.push(generateOrb());
    }
    
    return orbs;
}

// Get random orb color
function getRandomOrbColor() {
    const colors = [
        '#FFD700', // Gold
        '#EEFF41', // Lime
        '#40C4FF', // Light Blue
        '#FF4081', // Pink
        '#B2FF59', // Light Green
        '#FFAB40'  // Orange
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get random special orb color
function getRandomSpecialOrbColor() {
    const colors = [
        '#FF1493', // Deep Pink
        '#00FFFF', // Cyan
        '#7FFF00', // Chartreuse
        '#FF00FF', // Magenta
        '#1E90FF'  // Dodger Blue
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Reset game after victory
function resetGame(gameSession) {
    // Reset all players
    Object.values(gameSession.players).forEach(player => {
        player.position = generateRandomPosition();
        player.size = 15;
        player.score = 0;
        player.velocityX = 0;
        player.velocityY = 0;
    });
    
    // Regenerate orbs
    gameSession.orbs = generateInitialOrbs();
    
    // Clear projectiles
    gameSession.projectiles = [];
    
    // Notify all clients
    broadcastToGame(gameSession.id, {
        type: 'gameReset'
    });
}

// Game loop to update all active game sessions
let lastUpdateTime = Date.now();
let gameLoopInterval = null;

function startGameLoop() {
    // Clear any existing interval to prevent duplicates
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }
    
    const TARGET_FPS = 30;
    const FRAME_TIME = 1000 / TARGET_FPS;
    let frameCount = 0;
    let lastFpsTime = Date.now();
    
    // Start game loop
    gameLoopInterval = setInterval(() => {
        const now = Date.now();
        const dt = now - lastUpdateTime;
        lastUpdateTime = now;
        
        // FPS monitoring
        frameCount++;
        if (now - lastFpsTime > 5000) {  // Log FPS every 5 seconds
            const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
            console.log(`Game loop running at ${fps} FPS`);
            frameCount = 0;
            lastFpsTime = now;
        }
        
        try {
            // Get all active game sessions
            const sessions = getAllGameSessions();
            
            // Log active game count occasionally
            if (frameCount % 150 === 0) {  // Every 5 seconds at 30fps
                console.log(`Active games: ${Object.keys(sessions).length}`);
            }
            
            // Update each game session
            Object.values(sessions).forEach(session => {
                try {
                    // Only process games with connections
                    if (!gameConnections.has(session.id)) return;
                    
                    // Update game state
                    updateGame(session);
                    
                    // Create state snapshot
                    const gameState = createGameState(session);
                    
                    // Send updates to clients
                    const updateMessage = JSON.stringify({
                        type: 'update',
                        state: gameState,
                        timestamp: now
                    });
                    
                    // Broadcast to all clients
                    gameConnections.get(session.id).forEach(client => {
                        try {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(updateMessage);
                            }
                        } catch (clientError) {
                            console.error(`Error sending update to client:`, clientError);
                        }
                    });
                } catch (sessionError) {
                    console.error(`Error updating game session ${session.id}:`, sessionError);
                }
            });
        } catch (error) {
            console.error('Game loop error:', error);
        }
    }, FRAME_TIME);
    
    console.log(`Game loop started at target ${TARGET_FPS} FPS`);
}

// Start game loop
startGameLoop();

// Add error handler for uncaught exceptions to prevent server crash
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    // Don't exit process, just log error
});

// Add error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED PROMISE REJECTION:', reason);
    // Don't exit process, just log error
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Game server ready at: http://localhost:${PORT}`);
    console.log(`Admin logs available at: http://localhost:${PORT}/admin/logs`);
    console.log(`WebSocket server ready at: ws://localhost:${PORT}`);
    
    // Log Railway.app specific information if deployed there
    if (process.env.RAILWAY_STATIC_URL) {
        console.log(`Railway deployment detected at: ${process.env.RAILWAY_STATIC_URL}`);
        console.log(`WebSocket URL: ${process.env.RAILWAY_STATIC_URL.replace('https://', 'wss://')}`);
    }
});