// Manage chat and notifications
const WebSocket = require('ws');
const { players } = require('./playerManager');

// Store chat history to send to new players
const chatHistory = [];
const MAX_CHAT_HISTORY = 50;

function sendToAll(message) {
    const messageObj = {
        type: 'chat',
        ...message
    };
    
    // Add message to history
    chatHistory.push(messageObj);
    
    // Trim history if needed
    if (chatHistory.length > MAX_CHAT_HISTORY) {
        chatHistory.shift();
    }
    
    // Broadcast to all connected clients
    for (const playerId in players) {
        const player = players[playerId];
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(messageObj));
        }
    }
}

function sendChatHistoryToPlayer(ws) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'chatHistory',
            messages: chatHistory
        }));
    }
}

function handleChatMessage(playerId, message) {
    const player = players[playerId];
    if (!player || !player.name) return;
    
    sendToAll({
        sender: player.name,
        text: message,
        color: player.color,
        timestamp: Date.now()
    });
}

function broadcastSystemMessage(text) {
    sendToAll({
        sender: 'System',
        text,
        color: '#9b59b6', // Purple for system messages
        timestamp: Date.now(),
        isSystem: true
    });
}

function handleNameSet(playerId, name) {
    const player = players[playerId];
    if (!player) return;
    
    // Announce the player's arrival
    broadcastSystemMessage(`${name} has entered the Wizard Arena`);
}

module.exports = {
    handleChatMessage,
    broadcastSystemMessage,
    handleNameSet,
    sendChatHistoryToPlayer
}; 