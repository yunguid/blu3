// Manages player lifecycle and input
const players = {};

// Vibrant predefined colors for wizards
const wizardColors = [
    '#3498db', // Blue
    '#2ecc71', // Green
    '#e74c3c', // Red
    '#9b59b6', // Purple
    '#f1c40f', // Yellow
    '#1abc9c', // Turquoise
    '#d35400', // Orange
    '#34495e', // Navy
    '#16a085', // Green-Blue
    '#c0392b', // Dark Red
    '#8e44ad', // Violet
    '#27ae60', // Emerald
    '#e67e22', // Carrot Orange
    '#2980b9'  // Blue-Purple
];

function addPlayer(ws) {
    const id = Date.now().toString();
    
    // Assign a random color from our predefined wizard colors
    const randomColor = wizardColors[Math.floor(Math.random() * wizardColors.length)];
    
    // Place player at a random position on the map
    const mapWidth = 5000;  // Should match gameManager.MAP_WIDTH
    const mapHeight = 5000; // Should match gameManager.MAP_HEIGHT
    
    players[id] = {
        id,
        name: null, // Will be set when they provide a name
        position: { 
            x: Math.random() * (mapWidth - 200) + 100, 
            y: Math.random() * (mapHeight - 200) + 100 
        },
        size: 10,
        color: randomColor,
        score: 0,
        speedBoost: 1.0, // Normal speed multiplier (1 = normal)
        createdAt: Date.now(),
        ws: ws // Store WebSocket connection
    };
    ws.send(JSON.stringify({ type: 'init', id }));
    return id;
}

function removePlayer(id) {
    delete players[id];
}

function handlePlayerInput(id, position) {
    if (players[id]) {
        players[id].position = position;
    }
}

// Handle directional input with speed
function handlePlayerDirection(id, dirX, dirY, speed) {
    if (players[id]) {
        const player = players[id];
        
        // Validate inputs
        if (typeof dirX !== 'number' || typeof dirY !== 'number') return;
        if (typeof speed !== 'number' || isNaN(speed)) speed = 2.0;
        
        // Initialize speedBoost if missing (default 1.0 = no boost)
        if (!player.speedBoost) player.speedBoost = 1.0;
        
        // Apply the player's speed boost from the server side
        const boostedSpeed = speed * player.speedBoost;
        
        // Calculate new position based on direction and speed
        const newX = player.position.x + dirX * boostedSpeed;
        const newY = player.position.y + dirY * boostedSpeed;
        
        // Update the position
        player.position = { x: newX, y: newY };
        
        // Ensure player stays within map bounds (using constants from gameManager)
        const mapWidth = 5000;  // Should match gameManager.MAP_WIDTH
        const mapHeight = 5000; // Should match gameManager.MAP_HEIGHT
        
        player.position.x = Math.max(player.size, Math.min(mapWidth - player.size, player.position.x));
        player.position.y = Math.max(player.size, Math.min(mapHeight - player.size, player.position.y));
    }
}

function updatePlayerName(id, name) {
    if (players[id]) {
        players[id].name = name;
    }
}

function increasePlayerScore(id, amount) {
    if (players[id]) {
        players[id].score = (players[id].score || 0) + amount;
    }
}

// Export a clean version of players for broadcasting (without WS connection)
function getPlayersForBroadcast() {
    const broadcastPlayers = {};
    
    for (const id in players) {
        // Clone the player object without the ws property
        const { ws, ...cleanPlayer } = players[id];
        broadcastPlayers[id] = cleanPlayer;
    }
    
    return broadcastPlayers;
}

// Store active projectiles
const projectiles = [];

// Handle player shooting projectiles
function handlePlayerShoot(id, dirX, dirY, projectileType = 'default') {
    const player = players[id];
    if (!player) return;
    
    // Validate inputs
    if (typeof dirX !== 'number' || typeof dirY !== 'number') return;
    
    // Minimum size check - can't shoot if too small
    if (player.size < 15) return;
    
    // Calculate projectile size, speed, and damage based on type
    let projectileSize, projectileSpeed, damage, aoeRadius;
    switch (projectileType) {
        case 'fast':
            projectileSize = player.size / 10;  // Smaller projectile
            projectileSpeed = 20;               // Faster speed
            damage = projectileSize;            // Lower damage
            break;
        case 'powerful':
            projectileSize = player.size / 3;   // Larger projectile
            projectileSpeed = 8;                // Slower speed
            damage = projectileSize * 3;        // Higher damage
            break;
        case 'aoe':
            projectileSize = player.size / 5;   // Medium projectile
            projectileSpeed = 10;               // Medium speed
            damage = projectileSize * 1.5;      // Medium damage
            aoeRadius = projectileSize * 3;     // Area of effect radius
            break;
        default:
            projectileSize = player.size / 5;   // Default values from original code
            projectileSpeed = 12;               
            damage = projectileSize * 2;
            break;
    }
    
    // Reduce player size when shooting
    player.size -= projectileSize / 2;
    
    // Create projectile with unique ID
    const projectile = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playerId: id,
        playerColor: player.color,
        size: projectileSize,
        position: {
            x: player.position.x + dirX * (player.size + projectileSize), // Start outside player
            y: player.position.y + dirY * (player.size + projectileSize)
        },
        velocity: {
            x: dirX * projectileSpeed,
            y: dirY * projectileSpeed
        },
        createdAt: Date.now(),
        damage: damage,
        type: projectileType,
        ...(aoeRadius && { aoeRadius })  // Add aoeRadius property only for AOE projectiles
    };
    
    // Add projectile to active projectiles
    projectiles.push(projectile);
    
    // Notify player of successful shot
    if (player.ws) {
        player.ws.send(JSON.stringify({
            type: 'projectileCreated',
            id: projectile.id,
            projectileType  // Send the projectile type back to client
        }));
    }
}

// Update all projectiles (call this from game loop)
function updateProjectiles() {
    // Update projectile positions
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Move projectile
        projectile.position.x += projectile.velocity.x;
        projectile.position.y += projectile.velocity.y;
        
        // Check for collisions with players
        let hitOccurred = false;
        const affectedTargets = new Set(); // Track affected targets for AOE projectiles
        
        for (const targetId in players) {
            // Skip projectile owner
            if (targetId === projectile.playerId) continue;
            
            const target = players[targetId];
            if (!target) continue;
            
            // Calculate distance
            const dx = projectile.position.x - target.position.x;
            const dy = projectile.position.y - target.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check for AOE projectile effects
            if (projectile.type === 'aoe' && distance < target.size + projectile.aoeRadius) {
                // Only apply damage if this target hasn't been affected yet
                if (!affectedTargets.has(targetId)) {
                    affectedTargets.add(targetId);
                    
                    // Calculate damage for AOE effect (can be less for targets not directly hit)
                    const directHit = distance < target.size + projectile.size;
                    const damageMultiplier = directHit ? 1.0 : 0.7; // Reduced damage for splash effect
                    const damageAmount = Math.min(projectile.damage * damageMultiplier, target.size - 5);
                    
                    target.size -= damageAmount;
                    
                    // Notify the target player they were hit
                    if (target.ws) {
                        target.ws.send(JSON.stringify({
                            type: 'hit',
                            projectileId: projectile.id,
                            damage: damageAmount,
                            shooterId: projectile.playerId,
                            isAoe: true
                        }));
                    }
                    
                    // Notify the shooting player they hit someone with AOE
                    const shooter = players[projectile.playerId];
                    if (shooter && shooter.ws) {
                        shooter.ws.send(JSON.stringify({
                            type: 'hitConfirmed',
                            targetId: targetId,
                            damage: damageAmount,
                            isAoe: true
                        }));
                    }
                    
                    hitOccurred = true;
                }
            }
            // Regular direct hit collision (also works for direct hits with AOE projectiles)
            else if (projectile.type !== 'aoe' && distance < target.size + projectile.size) {
                const damageAmount = Math.min(projectile.damage, target.size - 5);
                target.size -= damageAmount;
                
                // Create orb from the damage (player who shot can collect it)
                const orb = {
                    id: `orb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    position: {
                        x: target.position.x + dx / distance * target.size,
                        y: target.position.y + dy / distance * target.size
                    },
                    color: target.color,
                    size: damageAmount / 2,
                    points: Math.floor(damageAmount * 10),
                    isPlayerFragment: true
                };
                
                // Notify the target player they were hit
                if (target.ws) {
                    target.ws.send(JSON.stringify({
                        type: 'hit',
                        projectileId: projectile.id,
                        damage: damageAmount,
                        shooterId: projectile.playerId
                    }));
                }
                
                // Notify the shooting player they hit someone
                const shooter = players[projectile.playerId];
                if (shooter && shooter.ws) {
                    shooter.ws.send(JSON.stringify({
                        type: 'hitConfirmed',
                        targetId: targetId,
                        damage: damageAmount
                    }));
                }
                
                // Add orb to game
                if (typeof gameManager !== 'undefined' && gameManager.addCustomOrb) {
                    gameManager.addCustomOrb(orb);
                }
                
                hitOccurred = true;
                break; // Exit loop after hitting one player with a normal projectile
            }
        }
        
        // Remove AOE projectile after hitting any player or if it hit multiple players with splash damage
        if (hitOccurred && (projectile.type === 'aoe' || affectedTargets.size > 0)) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Remove projectiles that go out of bounds or are too old
        const mapWidth = 5000;  // Should match gameManager.MAP_WIDTH
        const mapHeight = 5000; // Should match gameManager.MAP_HEIGHT
        const maxAge = 5000;    // 5 seconds
        
        if (
            projectile.position.x < 0 || 
            projectile.position.x > mapWidth ||
            projectile.position.y < 0 || 
            projectile.position.y > mapHeight ||
            Date.now() - projectile.createdAt > maxAge
        ) {
            projectiles.splice(i, 1);
        }
    }
}

module.exports = { 
    addPlayer, 
    removePlayer, 
    handlePlayerInput,
    handlePlayerDirection,
    handlePlayerShoot,
    updatePlayerName,
    increasePlayerScore,
    updateProjectiles,
    players,
    projectiles,
    getPlayersForBroadcast
}; 