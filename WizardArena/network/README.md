# WizardArena Network Server

This is a multiplayer game server for WizardArena that enables cross-network gameplay with shareable game links.

## Features

- WebSocket-based real-time multiplayer
- Game session management with unique IDs
- Public and private game sessions
- Shareable game links for inviting friends
- Reconnection support
- Chat system
- Leaderboards
- Full game state synchronization

## Getting Started for Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/wizardarena.git
   cd wizardarena/network
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file:
   ```
   PORT=3000
   PUBLIC_URL=http://localhost:3000
   NODE_ENV=development
   ```

### Running the Server Locally

Development mode with auto-restart:
```
npm run dev
```

Production mode:
```
npm start
```

## Deploying to Vercel (Web Interface)

Follow these steps to deploy the game using Vercel's web interface and play with friends on different networks:

### Step 1: Prepare Your Repository

1. Make sure your WizardArena project is pushed to a GitHub repository
   - Create a GitHub account if you don't already have one
   - Create a new repository on GitHub
   - Push your local WizardArena project to the repository

### Step 2: Deploy through Vercel Dashboard

1. Sign up or log in to Vercel: https://vercel.com/
2. From the Vercel dashboard, click the "Add New..." button and select "Project"
3. Connect to your GitHub account when prompted
4. Select the repository containing WizardArena
5. Configure your project:
   - **Project Name**: Choose a name for your deployment (e.g., wizard-arena)
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Select "network" (very important!)
   - **Build Command**: Leave as default (npm run build, or leave blank)
   - **Output Directory**: Leave as default (or leave blank)
   - **Install Command**: npm install

6. Open the "Environment Variables" section and add:
   ```
   PORT=3000
   PUBLIC_URL=[THIS WILL BE YOUR VERCEL URL, LIKE https://wizard-arena.vercel.app]
   NODE_ENV=production
   ```

7. Click "Deploy"

### Step 3: Update PUBLIC_URL After Deployment

After your initial deployment is complete:

1. Make note of the URL Vercel assigned to your project (e.g., https://wizard-arena.vercel.app)
2. Go to your project settings in Vercel dashboard
3. Navigate to the "Environment Variables" section
4. Update the PUBLIC_URL variable with your actual Vercel URL
5. Click "Save" and wait for the project to redeploy

### Step 4: Playing with Friends

1. Visit your deployed game URL (e.g., https://wizard-arena.vercel.app)
2. Create a new game by entering a game name and clicking "Create Game"
3. When the game is created, you'll see a shareable link
4. Copy the link and send it to your friends
5. When your friends open the link, they'll join your game directly

Alternatively, you can:
1. Create a game
2. Tell your friends the "Game Code" shown in your game
3. They can enter this code on the main page to join your game

### Multiplayer Troubleshooting

- **Connection Issues**: If players have trouble connecting, make sure:
  - The PUBLIC_URL environment variable is set correctly
  - Your game is deployed on Vercel Pro (needed for WebSocket support)
  - No corporate firewalls are blocking WebSocket connections

- **Game Not Found**: If friends get "Game not found" errors, ensure:
  - The game session is still active (games expire after all players leave)
  - They're using the complete, correct URL or game code

- **Performance Issues**: If the game lags:
  - Consider deploying to a region closer to most players
  - Vercel Pro allows selecting deployment regions

### Vercel Pro Features You Can Use

Since you have Vercel Pro, you can enhance your deployment:

1. **Custom Domains**: Link a custom domain for a more professional URL
   - Go to Project Settings → Domains
   - Add your domain and follow the verification process

2. **Region Selection**: Deploy to servers closer to your players
   - Go to Project Settings → Functions
   - Select the regions closest to your players

3. **Team Collaboration**: Add team members to manage the deployment
   - Create a new team in Vercel
   - Invite members and transfer the project to the team

## How Game Sessions Work

1. The server creates and manages game sessions with unique IDs
2. Players connect via WebSocket to join specific games
3. The server handles all game logic, collisions, and state management
4. Game state is synchronized to all connected clients at 30fps
5. Players can create public or private games
6. Private games can be shared via unique game links
7. Sessions persist as long as at least one player is connected

## License

This project is licensed under the MIT License - see the LICENSE file for details.