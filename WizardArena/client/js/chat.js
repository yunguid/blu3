// Handles chat functionality
import { sendToServer } from './network.js';

let playerName = '';
const maxMessages = 50;
let messages = [];
const chatMessages = document.getElementById('chatMessages');

// Escapes special HTML characters to prevent XSS
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

export function initChat() {
    // Add chat event listeners
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    sendButton.addEventListener('click', sendChatMessage);
    
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Add system message
    addMessage({
        type: 'system',
        content: 'Welcome to Wizard Arena! Type to chat with other players.'
    });
}

export function setPlayerName(name) {
    playerName = name;
    
    // Send initial name to server
    sendToServer({ type: 'setName', name: playerName });
    
    // Add system message acknowledging player's name with escaped input
    addMessage({
        type: 'system',
        content: `You've joined as ${escapeHTML(playerName)}!`
    });
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message) {
        sendToServer({
            type: 'chatMessage',
            name: playerName,
            message: message
        });
        chatInput.value = '';
    }
}

export function receiveMessage(data) {
    addMessage(data);
}

function addMessage(data) {
    // Remove oldest message if limit is reached
    if (messages.length >= maxMessages) {
        messages.shift();
        chatMessages.removeChild(chatMessages.firstChild);
    }
    messages.push(data);
    
    // Create and append new message element
    const messageEl = document.createElement('div');
    messageEl.className = 'chatMessage';
    if (data.type === 'system') {
        messageEl.innerHTML = `<em>${escapeHTML(data.content)}</em>`;
    } else {
        messageEl.innerHTML = `<span class="chatName" style="color: ${data.color || '#FFFFFF'}">${escapeHTML(data.name)}:</span> ${escapeHTML(data.message)}`;
    }
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to get all current messages (for new players)
export function getChatHistory() {
    return messages;
}