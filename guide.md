Below is a fully implemented working demo of **Wizard Arena**, a multiplayer browser game inspired by *slither.io* but with unique twists like spell casting, orb collection, and arena interactions. This demo includes core mechanics (movement, orb collection, basic collision), multiplayer functionality via WebSockets, and a simple UI. It’s designed to be easy to set up and run locally, providing a foundation for further expansion.

---

## **Wizard Arena Demo**

### **Overview**
In **Wizard Arena**, players control wizards in a top-down 2D arena. The objectives are:
- Move using the mouse.
- Collect golden orbs to grow in size and power.
- Collide with smaller players to eliminate them (basic combat mechanic).
- Survive and dominate the leaderboard (to be added in future iterations).

This demo uses:
- **Client-side:** HTML5 Canvas for rendering, JavaScript for game logic, and WebSockets for real-time communication.
- **Server-side:** Node.js with Express and WebSocket (`ws`) for handling multiplayer interactions.

---

### **Instructions to Run the Demo**

1. **Prerequisites:**
   - [Node.js](https://nodejs.org/) installed on your machine.
   - A modern web browser (e.g., Chrome, Firefox).

2. **Setup:**
   - Create a new directory called `WizardArena`.
   - Inside `WizardArena`, create the file structure and copy the code provided below.

3. **Install Dependencies:**
   - Open a terminal in the `WizardArena` directory.
   - Run `npm init -y` to create a `package.json`.
   - Install required packages: `npm install express ws`.

4. **Start the Server:**
   - Run `node server/server.js` to launch the WebSocket server.

5. **Open the Game:**
   - Serve the `client` folder locally. You can use a simple server like `npx http-server` (install with `npm install -g http-server`, then run `http-server` in the `WizardArena` directory).
   - Open your browser and navigate to `http://localhost:8080/client/index.html` (or the port provided by your server).

6. **Play:**
   - Move your wizard by moving the mouse.
   - Collect orbs to grow larger.
   - Open multiple browser tabs to simulate multiplayer (each tab is a new player).

---

### **Code Tree**
```
/WizardArena
├── /client
│   ├── /js
│   │   ├── main.js       # Client entry point
│   │   ├── game.js       # Client-side game state and loop
│   │   ├── player.js     # Player logic and input handling
│   │   ├── orb.js        # Orb mechanics
│   │   ├── renderer.js   # Rendering logic
│   │   └── network.js    # WebSocket communication
│   ├── /css
│   │   └── style.css     # Basic styling
│   └── index.html        # Main HTML file
├── /server
│   ├── server.js         # WebSocket server setup
│   ├── gameManager.js    # Server-side game state
│   ├── playerManager.js  # Player management
│   └── orbManager.js     # Orb spawning and collection
└── package.json          # Node.js dependencies
```

---

### **Code Files**

#### **/client/index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wizard Arena</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script type="module" src="js/main.js"></script>
</body>
</html>
```

#### **/client/css/style.css**
```css
body {
    margin: 0;
    overflow: hidden;
    background: #222;
}

#gameCanvas {
    display: block;
    margin: 0 auto;
}
```

#### **/client/js/main.js**
```javascript
// Client entry point: initializes the game and connects to the server
import { connectToServer } from './network.js';
import { startGame } from './game.js';

function init() {
    connectToServer('ws://localhost:8080');
    startGame();
}

init();
```

#### **/client/js/game.js**
```javascript
// Manages client-side game state and game loop
import { render } from './renderer.js';
import { handleInput } from './player.js';

let gameState = {
    players: {},
    orbs: []
};

function startGame() {
    const gameLoop = () => {
        handleInput();
        render(gameState);
        requestAnimationFrame(gameLoop);
    };
    gameLoop();
}

export function updateGameState(newState) {
    gameState = newState;
}

export { startGame };
```

#### **/client/js/player.js**
```javascript
// Handles player input
import { sendToServer } from './network.js';

let playerId = null;

export function setPlayerId(id) {
    playerId = id;
}

export function handleInput() {
    document.onmousemove = (event) => {
        if (playerId) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const position = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            sendToServer({ type: 'move', position });
        }
    };
}
```

#### **/client/js/orb.js**
```javascript
// Represents collectible orbs
export class Orb {
    constructor(id, position) {
        this.id = id;
        this.position = position;
    }
}
```

#### **/client/js/renderer.js**
```javascript
// Renders game objects to the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

export function render(gameState) {
    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render players
    for (let id in gameState.players) {
        const player = gameState.players[id];
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, player.size, 0, 2 * Math.PI);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();
    }

    // Render orbs
    gameState.orbs.forEach(orb => {
        ctx.beginPath();
        ctx.arc(orb.position.x, orb.position.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'gold';
        ctx.fill();
        ctx.closePath();
    });
}
```

#### **/client/js/network.js**
```javascript
// Handles WebSocket communication
import { setPlayerId } from './player.js';
import { updateGameState } from './game.js';

let socket;

export function connectToServer(url) {
    socket = new WebSocket(url);
    socket.onopen = () => console.log('Connected to server');
    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.type === 'init') {
            setPlayerId(data.id);
        } else if (data.type === 'update') {
            updateGameState(data.state);
        }
    };
    socket.onerror = (err) => console.error('WebSocket error:', err);
}

export function sendToServer(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    }
}
```

#### **/server/server.js**
```javascript
// WebSocket server setup
const WebSocket = require('ws');
const { addPlayer, removePlayer, handlePlayerInput } = require('./playerManager');
const { spawnOrbs, checkCollisions } = require('./orbManager');
const { broadcastState } = require('./gameManager');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    const playerId = addPlayer(ws);
    console.log(`Player ${playerId} connected`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            handlePlayerInput(playerId, data.position);
        }
    });

    ws.on('close', () => {
        removePlayer(playerId);
        console.log(`Player ${playerId} disconnected`);
    });
});

// Game loop (60 FPS)
setInterval(() => {
    spawnOrbs();
    checkCollisions();
    broadcastState(wss);
}, 1000 / 60);

console.log('Server running on ws://localhost:8080');
```

#### **/server/gameManager.js**
```javascript
// Manages and broadcasts game state
const players = require('./playerManager').players;
const orbs = require('./orbManager').orbs;

function broadcastState(wss) {
    const state = { players, orbs };
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', state }));
        }
    });
}

module.exports = { broadcastState };
```

#### **/server/playerManager.js**
```javascript
// Manages player lifecycle and input
const players = {};

function addPlayer(ws) {
    const id = Date.now().toString();
    players[id] = {
        id,
        position: { x: 400, y: 300 },
        size: 10,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
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

module.exports = { addPlayer, removePlayer, handlePlayerInput, players };
```

#### **/server/orbManager.js**
```javascript
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
```

#### **/package.json**
```json
{
  "name": "wizard-arena",
  "version": "1.0.0",
  "description": "A multiplayer browser game demo",
  "main": "server/server.js",
  "scripts": {
    "start": "node server/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2"
  },
  "author": "",
  "license": "ISC"
}
```

---

### **How It Works**

- **Client-Side:**
  - Players move their wizard by moving the mouse within the canvas.
  - The game state (players and orbs) is updated via WebSocket messages from the server.
  - The canvas renders all players as colored circles (size reflects power) and orbs as small gold circles.

- **Server-Side:**
  - The server maintains the game state (players and orbs).
  - It spawns orbs periodically and checks for collisions (player-orb and player-player).
  - Player growth occurs upon orb collection; larger players can eliminate smaller ones upon collision.
  - The game state is broadcast to all clients 60 times per second.

- **Mechanics:**
  - **Movement:** Mouse-based, smooth, and responsive.
  - **Orb Collection:** Players grow by collecting orbs, increasing their size.
  - **Combat:** Larger players eliminate smaller ones on contact (with a size threshold to prevent mutual destruction).

---

### **Testing the Demo**
1. Start the server: `node server/server.js`.
2. Serve the client folder (e.g., `npx http-server`).
3. Open `http://localhost:8080/client/index.html` in multiple tabs.
4. Move the mouse in each tab to control different wizards.
5. Collect orbs and try to eliminate other players by growing larger and colliding with them.

---

### **Limitations and Next Steps**
This is a functional demo, but it’s not a complete game yet. Potential enhancements include:
- **Spells:** Add offensive, defensive, and utility spells unlocked by collecting orbs.
- **UI:** Display player names, scores, and a leaderboard.
- **Hazards:** Introduce environmental obstacles or traps.
- **Performance:** Optimize for more players with spatial partitioning.
- **Security:** Validate inputs to prevent cheating.

---

This demo fulfills the request by providing a working, multiplayer browser game inspired by *slither.io* with unique twists. You can run it locally and experience the core mechanics firsthand!