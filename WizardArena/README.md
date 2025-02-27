# Wizard Arena

A real-time multiplayer wizard battle game with Renaissance-inspired visuals where players collect orbs, cast spells, and compete to become the most powerful wizard in the arena.

## Features

- Multiplayer real-time gameplay using WebSockets
- Renaissance-inspired visual style influenced by Da Vinci, Picasso, and Dali
- Shareable game links for playing with friends
- Cross-network play (players can join from different networks)
- Sophisticated particle effects and visual flourishes
- In-game chat
- Leaderboard tracking

## Game Mechanics

- Control your wizard using the mouse or touch controls
- Collect magical orbs to grow in size and power
- Fire magical projectiles to attack other players (spacebar or click)
- Avoid larger players and projectiles
- Special orbs grant temporary speed boosts
- The first player to reach size 100 wins!

## Project Structure

- **/client** - Frontend game assets and code
  - **/css** - Styling and animations
  - **/js** - Game logic and rendering
- **/server** - Original local-network server implementation
- **/network** - New multi-network server with shareable game links

## Technology Stack

- **Frontend**: Vanilla JavaScript, Canvas API, WebSockets
- **Backend**: Node.js, Express, WebSockets (ws library)
- **Deployment**: Vercel (optional)

## Getting Started

### Running locally with original server (local network only)

1. Navigate to the WizardArena directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the original server:
   ```
   node server/server.js
   ```
4. The game will be available at `http://localhost:3000`

### Running with new cross-network server

1. Navigate to the network directory:
   ```
   cd network
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the new server:
   ```
   npm start
   ```
4. The game will be available at `http://localhost:3000`

### Deploying to Vercel

1. Create a Vercel account if you don't have one
2. Install Vercel CLI:
   ```
   npm i -g vercel
   ```
3. Deploy:
   ```
   cd network
   vercel
   ```

## Playing With Friends

1. Start a game using the network server
2. Copy the game URL from the address bar or the "Copy" button in-game
3. Send the link to friends
4. They can join by opening the link in their browser

## Development Updates

Recent enhancements include:

1. Renaissance-inspired visuals drawing from classical art techniques
2. Multi-network support for playing with friends globally
3. Improved projectile effects and particle systems
4. Shareable game links for easy joining
5. Cross-device compatibility

## Admin Features

Access the admin dashboard for monitoring:
```
http://localhost:3000/admin/logs
```

## License

MIT 