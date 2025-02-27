// Manages game state
const { players, increasePlayerScore, getPlayersForBroadcast, removePlayer } = require('./playerManager');
const chatManager = require('./chatManager');
const orbs = [];
const MAP_WIDTH = 5000;  // Much larger map
const MAP_HEIGHT = 5000; // Much larger map
const ORB_COUNT = 300;   // More orbs
const ORB_POINTS = 10;
const VICTORY_SIZE = 100; // Size at which player wins
const SPECIAL_ORB_CHANCE = 0.1; // 10% chance for special orbs

// Initialize orbs
function initOrbs() {
    for (let i = 0; i < ORB_COUNT; i++) {
        addOrb();
    }
}

function addOrb() {
    // Special orbs are larger, worth more points, and have special colors
    const isSpecial = Math.random() < SPECIAL_ORB_CHANCE;
    
    const orb = {
        id: Date.now().toString() + Math.random().toString().slice(2, 8),
        position: {
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT
        },
        // Magic-themed orb colors with special colors
        color: isSpecial ? 
            ['#ff1493', '#00ffff', '#7fff00', '#ff00ff'][Math.floor(Math.random() * 4)] : // Special orb colors
            ['#f39c12', '#f1c40f', '#e67e22', '#d35400'][Math.floor(Math.random() * 4)],  // Regular orb colors
        size: isSpecial ? 10 : 5,
        points: isSpecial ? 50 : 10,
        isSpecial: isSpecial
    };
    orbs.push(orb);
    return orb;
}

function removeOrb(index) {
    orbs.splice(index, 1);
}

// Add a custom orb to the game (for player fragments)
function addCustomOrb(orb) {
    orbs.push(orb);
}

// Update game state
function update() {
    // Update projectiles first
    if (require('./playerManager').updateProjectiles) {
        require('./playerManager').updateProjectiles();
    }
    
    checkCollisions();
    checkVictoryConditions();
    checkPlayerVsPlayer();
    
    // Ensure we always have ORB_COUNT orbs
    while (orbs.length < ORB_COUNT) {
        addOrb();
    }
    
    return {
        players: getPlayersForBroadcast(),
        orbs,
        projectiles: require('./playerManager').projectiles || [],
        mapWidth: MAP_WIDTH,
        mapHeight: MAP_HEIGHT
    };
}

// Check for collisions between players and orbs
function checkCollisions() {
    // Check player-orb collisions
    for (const playerId in players) {
        const player = players[playerId];
        
        for (let i = orbs.length - 1; i >= 0; i--) {
            const orb = orbs[i];
            const dx = player.position.x - orb.position.x;
            const dy = player.position.y - orb.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If player collides with orb
            if (distance < player.size + orb.size) {
                // Increase player size and score based on orb value
                increasePlayerScore(playerId, orb.points || ORB_POINTS);
                
                // Special orbs give bigger size boost and speed boost
                if (orb.isSpecial) {
                    player.size += 2;
                    
                    // Set a simpler speed boost without timeout
                    player.speedBoost = 2.0; // Double speed
                    
                    // Broadcast a notification to all players
                    if (player.name && player.ws) {
                        broadcastSystemMessage(`${player.name} got a speed boost!`);
                    }
                    
                } else {
                    // Regular orbs
                    player.size += 0.5;
                }
                
                // Remove the orb and add a new one
                removeOrb(i);
                addOrb();
                
                // Broadcast a special event for the frontend to show effects
                if (player.ws) {
                    player.ws.send(JSON.stringify({
                        type: 'collectOrb',
                        position: orb.position,
                        color: orb.color,
                        isSpecial: orb.isSpecial
                    }));
                }
            }
        }
    }
}

// Check player vs player collisions for absorption
function checkPlayerVsPlayer() {
    const playerIds = Object.keys(players);
    
    for (let i = 0; i < playerIds.length; i++) {
        const p1 = players[playerIds[i]];
        if (!p1) continue;
        
        for (let j = i + 1; j < playerIds.length; j++) {
            const p2 = players[playerIds[j]];
            if (!p2) continue;
            
            const dx = p1.position.x - p2.position.x;
            const dy = p1.position.y - p2.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If players collide and one is 30% larger than the other
            if (distance < Math.max(p1.size, p2.size)) {
                if (p1.size > p2.size * 1.3) {
                    // P1 absorbs P2
                    p1.size += p2.size * 0.5;
                    p1.score += Math.floor(p2.score * 0.5);
                    
                    // Notify p2 that they were absorbed
                    if (p2.ws) {
                        p2.ws.send(JSON.stringify({
                            type: 'absorbed',
                            by: p1.name || 'Another wizard'
                        }));
                    }
                    
                    // Remove absorbed player
                    removePlayer(playerIds[j]);
                    
                } else if (p2.size > p1.size * 1.3) {
                    // P2 absorbs P1
                    p2.size += p1.size * 0.5;
                    p2.score += Math.floor(p1.score * 0.5);
                    
                    // Notify p1 that they were absorbed
                    if (p1.ws) {
                        p1.ws.send(JSON.stringify({
                            type: 'absorbed',
                            by: p2.name || 'Another wizard'
                        }));
                    }
                    
                    // Remove absorbed player
                    removePlayer(playerIds[i]);
                    break; // Break since p1 no longer exists
                }
            }
        }
    }
}

// Check if any player has reached victory size
function checkVictoryConditions() {
    for (const playerId in players) {
        const player = players[playerId];
        
        if (player.size >= VICTORY_SIZE) {
            // Broadcast victory message
            broadcastSystemMessage(`${player.name || 'A wizard'} has won the battle!`);
            
            // Reset all players
            resetAllPlayers();
            
            // Give the winner a victory crown
            if (player.ws) {
                player.victorious = true;
                player.ws.send(JSON.stringify({
                    type: 'victory'
                }));
            }
            
            break;
        }
    }
}

// Reset all players after a victory
function resetAllPlayers() {
    for (const playerId in players) {
        const player = players[playerId];
        
        // Reset player size and score
        player.size = 10;
        player.score = 0;
        
        // Keep player name and color, but move to a random position
        player.position = {
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT
        };
        
        // Notify client of reset
        if (player.ws) {
            player.ws.send(JSON.stringify({
                type: 'gameReset'
            }));
        }
    }
}

// Broadcast system message to all players
function broadcastSystemMessage(message) {
    for (const playerId in players) {
        const player = players[playerId];
        if (player.ws) {
            player.ws.send(JSON.stringify({
                type: 'systemMessage',
                message: message
            }));
        }
    }
}

module.exports = {
    initOrbs,
    update,
    addCustomOrb,
    MAP_WIDTH,
    MAP_HEIGHT,
    VICTORY_SIZE,
    broadcastSystemMessage
}; 