// Handles chat functionality
import { sendToServer } from './network.js';

let playerName = '';
const maxMessages = 50;
let messages = [];

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
    
    // Add system message acknowledging player's name
    addMessage({
        type: 'system',
        content: `You've joined as ${playerName}!`
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
    messages.push(data);
    
    // Trim messages if we have too many
    if (messages.length > maxMessages) {
        messages = messages.slice(messages.length - maxMessages);
    }
    
    // Update the display
    renderMessages();
}

function renderMessages() {
    const chatMessages = document.getElementById('chatMessages');
    
    // Create HTML for messages
    let messagesHTML = '';
    
    messages.forEach(msg => {
        if (msg.type === 'system') {
            messagesHTML += `<div class="chatMessage system"><em>${msg.content}</em></div>`;
        } else {
            messagesHTML += `<div class="chatMessage"><span class="chatName" style="color: ${msg.color || '#FFFFFF'}">${msg.name}:</span> ${msg.message}</div>`;
        }
    });
    
    chatMessages.innerHTML = messagesHTML;
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to get all current messages (for new players)
export function getChatHistory() {
    return messages;
} 