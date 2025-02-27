// Handles orb spawning and collision detection
const players = require('./playerManager').players;
const orbs = [];

function spawnOrbs() {
    if (orbs.length < 50) {
        const orb = {
            id: Date.now().toString() + Math.random(),
            position: { x: Math.random() * 800, y: Math.random() * 600 }
        };
        orbs.push(orb);
    }
}

function checkCollisions() {
    for (let id in players) {
        const player = players[id];
        for (let i = orbs.length - 1; i >= 0; i--) {
            const orb = orbs[i];
            const dx = player.position.x - orb.position.x;
            const dy = player.position.y - orb.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < player.size + 5) {
                player.size += 1; // Grow when collecting an orb
                orbs.splice(i, 1); // Remove collected orb
            }
        }
    }

    // Player vs Player collision (basic elimination)
    const playerIds = Object.keys(players);
    for (let i = 0; i < playerIds.length; i++) {
        for (let j = i + 1; j < playerIds.length; j++) {
            const p1 = players[playerIds[i]];
            const p2 = players[playerIds[j]];
            const dx = p1.position.x - p2.position.x;
            const dy = p1.position.y - p2.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < p1.size + p2.size) {
                if (p1.size > p2.size + 2) {
                    p1.size += p2.size / 2;
                    delete players[p2.id];
                } else if (p2.size > p1.size + 2) {
                    p2.size += p1.size / 2;
                    delete players[p1.id];
                }
            }
        }
    }
}

module.exports = { spawnOrbs, checkCollisions, orbs }; 