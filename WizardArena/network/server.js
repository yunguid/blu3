const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const dotenv = require('dotenv');
const { createGameSession, getGameSession, getAllGameSessions, deleteGameSession } = require('./gameSessionManager');
const errorLogger = require('../server/errorLogger');

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
    // Get connection info
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Get gameId from URL parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const gameId = url.searchParams.get('gameId');
    
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
    
    // Check if game exists
    let gameSession = null;
    if (gameId) {
        gameSession = getGameSession(gameId);
        if (!gameSession) {
            // Game doesn't exist
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Game not found'
            }));
            ws.close();
            return;
        }
        
        // Add connection to the game's connections set
        if (!gameConnections.has(gameId)) {
            gameConnections.set(gameId, new Set());
        }
        gameConnections.get(gameId).add(ws);
        
        // Initialize the player in the game session
        gameSession.players[playerId] = {
            id: playerId,
            name: '',
            position: generateRandomPosition(),
            color: getRandomColor(),
            size: 15,
            score: 0,
            velocityX: 0,
            velocityY: 0
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
        gameId
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Process messages based on their type
            switch (data.type) {
                case 'setName':
                    if (gameSession) {
                        // Update player name in game session
                        if (gameSession.players[playerId]) {
                            gameSession.players[playerId].name = data.name;
                            ws.clientInfo.name = data.name;
                            
                            // Broadcast player joined message
                            broadcastToGame(gameId, {
                                type: 'system',
                                content: `${data.name} has joined the game!`
                            });
                            
                            // Send current game state to the player
                            ws.send(JSON.stringify({
                                type: 'update',
                                state: createGameState(gameSession)
                            }));
                        }
                    }
                    break;
                
                case 'move':
                    if (gameSession && gameSession.players[playerId]) {
                        // Update player position
                        gameSession.players[playerId].position = data.position;
                    }
                    break;
                
                case 'direction':
                    if (gameSession && gameSession.players[playerId]) {
                        // Set player velocity based on direction and speed
                        const player = gameSession.players[playerId];
                        player.velocityX = data.dirX * data.speed;
                        player.velocityY = data.dirY * data.speed;
                    }
                    break;
                
                case 'shoot':
                    if (gameSession && gameSession.players[playerId]) {
                        // Create a projectile
                        handlePlayerShoot(gameSession, playerId, data.dirX, data.dirY);
                    }
                    break;
                
                case 'chat':
                    if (gameSession) {
                        // Broadcast chat message to all players in game
                        broadcastToGame(gameId, {
                            type: 'chatMessage',
                            sender: data.sender || gameSession.players[playerId]?.name || 'Anonymous',
                            content: data.message,
                            color: gameSession.players[playerId]?.color || '#ffffff'
                        });
                    }
                    break;
                
                case 'client_error':
                    // Handle client error reporting
                    errorLogger.handleClientError(data, ws.clientInfo);
                    break;
                
                case 'client_log':
                    // Handle client console log reporting
                    errorLogger.handleClientLog(data, ws.clientInfo);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
    
    // Handle disconnect
    ws.on('close', () => {
        if (gameId && gameSession) {
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
                        content: `${playerName} has left the arena`
                    });
                }
            }
        } else {
            console.log(`Player ${playerId} disconnected (no game)`);
        }
    });
});

// Broadcast a message to all clients in a specific game
function broadcastToGame(gameId, message) {
    if (!gameConnections.has(gameId)) return;
    
    const connections = gameConnections.get(gameId);
    connections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
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
    
    // Update player positions based on velocity
    Object.values(gameSession.players).forEach(player => {
        if (player.velocityX || player.velocityY) {
            player.position.x += player.velocityX;
            player.position.y += player.velocityY;
            
            // Ensure player stays within map bounds
            const mapWidth = 5000;
            const mapHeight = 5000;
            player.position.x = Math.max(0, Math.min(mapWidth, player.position.x));
            player.position.y = Math.max(0, Math.min(mapHeight, player.position.y));
        }
    });
    
    // Update projectiles
    if (gameSession.projectiles) {
        for (let i = gameSession.projectiles.length - 1; i >= 0; i--) {
            const projectile = gameSession.projectiles[i];
            
            // Move projectile
            projectile.position.x += projectile.velocity.x;
            projectile.position.y += projectile.velocity.y;
            
            // Reduce time to live
            projectile.timeToLive--;
            
            // Check for map boundaries
            const mapWidth = 5000;
            const mapHeight = 5000;
            if (
                projectile.position.x < 0 || 
                projectile.position.x > mapWidth || 
                projectile.position.y < 0 || 
                projectile.position.y > mapHeight ||
                projectile.timeToLive <= 0
            ) {
                // Remove projectile
                gameSession.projectiles.splice(i, 1);
                continue;
            }
            
            // Check for collisions with players
            Object.entries(gameSession.players).forEach(([id, player]) => {
                // Skip collision with the player who fired the projectile
                if (id === projectile.playerId) return;
                
                // Calculate distance between projectile and player
                const dx = projectile.position.x - player.position.x;
                const dy = projectile.position.y - player.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Check if collision occurred
                if (distance < player.size + projectile.size) {
                    // Player hit!
                    
                    // Damage player (decrease size)
                    const damage = projectile.damage;
                    player.size -= damage;
                    
                    // Increase shooter's score
                    const shooter = gameSession.players[projectile.playerId];
                    if (shooter) {
                        shooter.score += damage;
                    }
                    
                    // Remove projectile
                    gameSession.projectiles.splice(i, 1);
                    
                    // Notify the hit player
                    const hitPlayerConn = findPlayerConnection(id, gameSession.id);
                    if (hitPlayerConn) {
                        hitPlayerConn.send(JSON.stringify({
                            type: 'hit',
                            damage: damage,
                            by: shooter ? shooter.name : 'Unknown'
                        }));
                    }
                    
                    // Notify the shooter
                    const shooterConn = findPlayerConnection(projectile.playerId, gameSession.id);
                    if (shooterConn) {
                        shooterConn.send(JSON.stringify({
                            type: 'hitConfirmed',
                            damage: damage,
                            target: player.name
                        }));
                    }
                    
                    // Check if player was "killed" (size too small)
                    if (player.size < 10) {
                        // Player is absorbed
                        
                        // Increase shooter size
                        if (shooter) {
                            shooter.size += 10;
                            shooter.score += 50;
                        }
                        
                        // Notify player of death
                        if (hitPlayerConn) {
                            hitPlayerConn.send(JSON.stringify({
                                type: 'absorbed',
                                by: shooter ? shooter.name : 'Unknown'
                            }));
                        }
                        
                        // Reset player
                        player.position = generateRandomPosition();
                        player.size = 15;
                        player.score = 0;
                        
                        // Broadcast system message
                        broadcastToGame(gameSession.id, {
                            type: 'system',
                            content: `${player.name} was absorbed by ${shooter ? shooter.name : 'an unknown force'}!`
                        });
                    }
                    
                    // We processed the collision, exit the loop
                    return;
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
setInterval(() => {
    getAllGameSessions().forEach(session => {
        updateGame(session);
        
        // Broadcast game state to all clients in the game
        if (gameConnections.has(session.id)) {
            const gameState = createGameState(session);
            
            gameConnections.get(session.id).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'update',
                        state: gameState
                    }));
                }
            });
        }
    });
}, 1000 / 30); // 30 FPS game loop

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Game server ready at: http://localhost:${PORT}`);
    console.log(`Admin logs available at: http://localhost:${PORT}/admin/logs`);
});