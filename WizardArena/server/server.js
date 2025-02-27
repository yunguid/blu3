const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const playerManager = require('./playerManager');
const chatManager = require('./chatManager');
const gameManager = require('./gameManager');
const errorLogger = require('./errorLogger');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Initialize the game
gameManager.initOrbs();

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

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    // Get client IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Add player and get their ID
    const playerId = playerManager.addPlayer(ws);
    
    // Store client info with the websocket
    ws.clientInfo = {
        ip: ip,
        id: playerId,
        userAgent: req.headers['user-agent'] || 'Unknown',
        connectedAt: new Date().toISOString()
    };
    
    console.log(`Player ${playerId} connected from ${ip}`);
    
    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'setName':
                    playerManager.updatePlayerName(playerId, data.name);
                    // Store name in client info
                    ws.clientInfo.name = data.name;
                    // Send the existing chat history to the new player
                    chatManager.sendChatHistoryToPlayer(ws);
                    // Notify other players that someone joined
                    chatManager.handleNameSet(playerId, data.name);
                    break;
                
                case 'move':
                    playerManager.handlePlayerInput(playerId, data.position);
                    break;
                    
                case 'direction':
                    playerManager.handlePlayerDirection(playerId, data.dirX, data.dirY, data.speed);
                    break;
                    
                case 'shoot':
                    playerManager.handlePlayerShoot(playerId, data.dirX, data.dirY, data.projectileType);
                    break;
                
                case 'chat':
                    chatManager.handleChatMessage(playerId, data.message);
                    break;
                    
                case 'client_error':
                    // Handle client error
                    errorLogger.handleClientError(data, ws.clientInfo);
                    break;
                    
                case 'client_log':
                    // Handle client console logs
                    errorLogger.handleClientLog(data, ws.clientInfo);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
    
    // Handle disconnect
    ws.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        
        // Get the player's name before removing them
        const playerName = playerManager.players[playerId]?.name;
        
        // Remove the player
        playerManager.removePlayer(playerId);
        
        // Notify chat if they had a name
        if (playerName) {
            chatManager.broadcastSystemMessage(`${playerName} has left the arena`);
        }
    });
});

// Game loop
const FPS = 30;
const FRAME_TIME = 1000 / FPS;

setInterval(() => {
    // Update game state
    const state = gameManager.update();
    
    // Broadcast state to all clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
                type: 'update', 
                state 
            }));
        }
    });
}, FRAME_TIME);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin logs available at http://localhost:${PORT}/admin/logs`);
}); 