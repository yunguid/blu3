// Renders game objects to the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Camera and view variables
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 1;
const MAP_WIDTH = 5000;  // Should match server value
const MAP_HEIGHT = 5000; // Should match server value

// Load and create background
const backgroundGradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 1.5
);
backgroundGradient.addColorStop(0, '#162447');
backgroundGradient.addColorStop(1, '#0f111a');

// Grid patterns
const gridSpacing = 100;
const gridOpacity = 0.1;

// Particle system for visual effects
const particles = [];
const MAX_PARTICLES = 200; // Increased particle count

// Cached images for wizards and orbs
const imageCache = {
    wizard: null,
    orb: null,
    specialOrb: null,
    crown: null
};

// Last positions for interpolation
let lastGameData = null;

// Smooth camera movement
let targetCameraX = 0;
let targetCameraY = 0;
const CAMERA_SMOOTHING = 0.1;

function createParticle(x, y, color, size = null, life = null) {
    const particle = {
        x,
        y,
        size: size || Math.random() * 5 + 2,
        color: color || '#FFD700',
        speedX: (Math.random() - 0.5) * 5,
        speedY: (Math.random() - 0.5) * 5,
        life: life || 100,
        maxLife: life || 100,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
    };
    
    particles.push(particle);
    
    // Remove oldest particles if we have too many
    if (particles.length > MAX_PARTICLES) {
        particles.shift();
    }
}

function createOrbCollectEffect(x, y, isSpecial = false) {
    const particleCount = isSpecial ? 30 : 15;
    const color = isSpecial ? 
        ['#ff1493', '#00ffff', '#7fff00', '#ff00ff'][Math.floor(Math.random() * 4)] : 
        'gold';
        
    for (let i = 0; i < particleCount; i++) {
        createParticle(x, y, color, isSpecial ? Math.random() * 8 + 3 : null, isSpecial ? 150 : null);
    }
}

function createVictoryEffect(x, y) {
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FF7F50'];
    
    for (let i = 0; i < 100; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 2;
        const life = 100 + Math.random() * 100;
        
        // Create particle with more controlled movement for fireworks effect
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const particle = {
            x, y,
            size,
            color,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            life,
            maxLife: life,
            gravity: 0.05,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        };
        
        particles.push(particle);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        
        // Apply gravity if specified
        if (p.gravity) {
            p.speedY += p.gravity;
        }
        
        // Update rotation
        if (p.rotationSpeed) {
            p.rotation += p.rotationSpeed;
        }
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function renderParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        
        // Position at particle center
        ctx.translate(p.x, p.y);
        
        if (p.rotation) {
            ctx.rotate(p.rotation);
        }
        
        // Draw particle - star shape for special effects
        if (p.color === '#FFD700' && p.size > 4) {
            // Draw star
            ctx.beginPath();
            const spikes = 5;
            const outerRadius = p.size;
            const innerRadius = p.size / 2;
            
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI * 2 * i) / (spikes * 2);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
        } else {
            // Standard circular particle
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        
        ctx.restore();
    });
    ctx.globalAlpha = 1;
}

// Track last frame's orb positions to detect collection
let lastOrbPositions = {};

// Initialize renderer
function initRenderer() {
    // We don't actually need to preload images for this version
    // since we're drawing everything with canvas primitives
    imageCache.wizard = true;
    imageCache.orb = true;
    imageCache.specialOrb = true;
    imageCache.crown = true;
    
    // Set canvas to full window size
    canvas.width = window.innerWidth - 350; // Sidebar width
    canvas.height = window.innerHeight;
    
    // Set high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth - 350;
        canvas.height = window.innerHeight;
        
        // Maintain high-quality rendering after resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    });
    
    // Create initial particle burst for visual flair
    createStartupEffect();
}

// Create a visual flourish when the game starts
function createStartupEffect() {
    // Create particles in a circular burst from the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Generate particles in spiral pattern inspired by golden ratio
    const particleCount = 50;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
    
    for (let i = 0; i < particleCount; i++) {
        // Use golden angle to create aesthetic spiral pattern
        const distance = 5 * Math.sqrt(i);
        const angle = i * goldenAngle;
        
        // Calculate position based on spiral
        const x = centerX + Math.cos(angle) * distance * 5;
        const y = centerY + Math.sin(angle) * distance * 5;
        
        // Create particle with Renaissance-inspired colors
        const colors = [
            '#8A2BE2', // Deep violet-blue
            '#DAA520', // Golden ochre
            '#B22222', // Venetian red
            '#4B0082', // Deep indigo
            '#00A86B'  // Viridian green
        ];
        
        const color = colors[i % colors.length];
        const size = 3 + Math.random() * 5;
        const life = 100 + Math.random() * 150;
        
        // Create particle with rotation and outward velocity
        const particle = {
            x, y,
            size,
            color,
            speedX: (x - centerX) * 0.02,
            speedY: (y - centerY) * 0.02,
            life,
            maxLife: life,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
        
        particles.push(particle);
    }
}

// Main render function
function render(gameData, playerId) {
    if (!gameData) return; // Don't render if no game data
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Store game data for interpolation
    if (!lastGameData) {
        lastGameData = JSON.parse(JSON.stringify(gameData));
    }
    
    // Update camera to follow current player
    updateCamera(gameData, playerId);
    
    // Apply camera transformation
    ctx.save();
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background (fixed position relative to camera)
    drawBackground(ctx, width, height);
    
    // Apply camera transform for game world
    ctx.translate(-cameraX + width/2, -cameraY + height/2);
    ctx.scale(cameraZoom, cameraZoom);
    
    // Draw grid
    drawGrid(ctx, width, height);
    
    // Draw map bounds
    drawMapBounds(ctx);
    
    // Draw decorative elements - Renaissance-inspired geometric patterns
    drawDecorations(ctx, MAP_WIDTH, MAP_HEIGHT);
    
    // Draw a function that adds Renaissance-inspired decorative elements to the game map
    function drawDecorations(ctx, mapWidth, mapHeight) {
        // Add golden ratio spiral at each corner
        drawGoldenSpiral(ctx, 200, 200, 100, 0.8);
        drawGoldenSpiral(ctx, mapWidth - 200, 200, 100, 0.8);
        drawGoldenSpiral(ctx, 200, mapHeight - 200, 100, 0.8);
        drawGoldenSpiral(ctx, mapWidth - 200, mapHeight - 200, 100, 0.8);
        
        // Draw Vitruvian-inspired circle and square in center
        drawVitruvianElements(ctx, mapWidth/2, mapHeight/2, 400);
    }
    
    // Draw golden ratio spiral (Fibonacci spiral)
    function drawGoldenSpiral(ctx, x, y, size, opacity) {
        ctx.save();
        ctx.translate(x, y);
        
        // Draw spiral with subtle opacity
        ctx.beginPath();
        ctx.strokeStyle = `rgba(218, 165, 32, ${opacity * 0.3})`; // Gold
        ctx.lineWidth = size * 0.03;
        
        // Draw golden spiral
        let a = 0;
        let b = size;
        const goldenRatio = 1.618033988749895;
        
        ctx.moveTo(0, 0);
        for (let i = 0; i < 10; i++) {
            const angle = i * 0.5 * Math.PI;
            a = b * Math.cos(angle);
            b = b / goldenRatio;
            ctx.lineTo(a, b);
        }
        
        ctx.stroke();
        
        // Draw subtle fibonacci rectangles
        ctx.lineWidth = size * 0.01;
        let currentSize = size;
        let prevSize = size / goldenRatio;
        let currentX = 0;
        let currentY = 0;
        
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(218, 165, 32, ${opacity * 0.15})`;
            
            // Draw rectangle based on fibonacci sequence proportions
            if (i % 4 === 0) {
                ctx.strokeRect(currentX, currentY - prevSize, currentSize, prevSize);
                currentX += currentSize;
            } else if (i % 4 === 1) {
                ctx.strokeRect(currentX - prevSize, currentY - prevSize, prevSize, -currentSize);
                currentY -= currentSize;
            } else if (i % 4 === 2) {
                ctx.strokeRect(currentX - prevSize - currentSize, currentY - prevSize, currentSize, -prevSize);
                currentX -= currentSize;
            } else {
                ctx.strokeRect(currentX - prevSize, currentY, prevSize, currentSize);
                currentY += currentSize;
            }
            
            // Update sizes for next rectangle
            const temp = currentSize;
            currentSize = prevSize;
            prevSize = temp - prevSize;
        }
        
        ctx.restore();
    }
    
    // Draw elements inspired by Da Vinci's Vitruvian Man
    function drawVitruvianElements(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        
        // Draw circle (representing heaven/spiritual realm in Da Vinci's work)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw square (representing earth/physical realm)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.08)';
        ctx.lineWidth = 1;
        const squareSize = size/2 * 0.9; // Slightly smaller than circle
        ctx.strokeRect(-squareSize/2, -squareSize/2, squareSize, squareSize);
        
        // Add diagonal lines through square (representing divine proportions)
        ctx.beginPath();
        ctx.moveTo(-squareSize/2, -squareSize/2);
        ctx.lineTo(squareSize/2, squareSize/2);
        ctx.moveTo(squareSize/2, -squareSize/2);
        ctx.lineTo(-squareSize/2, squareSize/2);
        ctx.stroke();
        
        // Add subtle measurement points along circle (like in Vitruvian Man)
        ctx.fillStyle = 'rgba(218, 165, 32, 0.15)';
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const markX = Math.cos(angle) * (size/2);
            const markY = Math.sin(angle) * (size/2);
            
            ctx.beginPath();
            ctx.arc(markX, markY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Draw orbs
    drawOrbs(ctx, gameData.orbs);
    
    // Check for collected orbs and create effects
    detectOrbCollections(gameData.orbs);
    
    // Draw projectiles
    if (gameData.projectiles) {
        drawProjectiles(ctx, gameData.projectiles, playerId);
    }
    
    // Draw players
    drawPlayers(ctx, gameData.players, playerId);
    
    // Update and draw particles
    updateParticles();
    renderParticles();
    
    // Restore original transform
    ctx.restore();
    
    // Draw UI elements (not affected by camera)
    drawUI(ctx, gameData, playerId, width, height);
    
    // Update last game data for next frame
    lastGameData = JSON.parse(JSON.stringify(gameData));
}

// Draw colorful nebula clouds inspired by Dali's dreamlike atmospheres
function drawNebulaClouds(ctx, width, height) {
    // Nebula parameters - richer Renaissance color palette
    const nebulaColors = [
        'rgba(138, 43, 226, 0.08)',  // Deep violet (from Byzantine icons)
        'rgba(65, 105, 225, 0.08)',  // Royal blue (like Renaissance ultramarine)
        'rgba(178, 34, 34, 0.06)',   // Venetian red (Renaissance favorite)
        'rgba(218, 165, 32, 0.05)',  // Golden ochre (from illuminated manuscripts)
        'rgba(95, 158, 160, 0.07)',  // Verdigris (Renaissance copper pigment)
        'rgba(147, 112, 219, 0.06)', // Medium purple (Michelangelo's drapery)
    ];
    const cloudCount = 15; // More clouds for richness
    
    ctx.save();
    
    // Apply very slow parallax effect
    const parallaxFactor = 0.03;
    const offsetX = -cameraX * parallaxFactor;
    const offsetY = -cameraY * parallaxFactor;
    
    // Draw each nebula cloud with a seeded position
    for (let i = 0; i < cloudCount; i++) {
        // Use a consistent seed for reproducible clouds
        const seed = i * 1000;
        const seedRandom = function(n) {
            return ((Math.sin(seed + (n || 0)) * 10000) % 1 + 1) % 1;
        };
        
        // Cloud position and size
        const x = offsetX + width * (seedRandom(1) * 2 - 0.5);
        const y = offsetY + height * (seedRandom(2) * 2 - 0.5);
        const size = Math.min(width, height) * (0.6 + seedRandom(3));
        
        // Create a colorful cloud
        const colorIndex = Math.floor(seedRandom(4) * nebulaColors.length);
        const color = nebulaColors[colorIndex];
        
        // Draw surrealist-inspired cloud shapes using Bezier curves
        if (i % 3 === 0) {
            // Dali-esque melting/flowing shapes
            const flowPathCount = Math.floor(seedRandom(5) * 5) + 3;
            
            for (let f = 0; f < flowPathCount; f++) {
                ctx.beginPath();
                
                // Start point
                const startX = x + size * (seedRandom(f*7) * 0.5 - 0.25);
                const startY = y + size * (seedRandom(f*7+1) * 0.5 - 0.25);
                
                ctx.moveTo(startX, startY);
                
                // Create flowing Bezier curve
                const cp1x = startX + size * (seedRandom(f*7+2) * 0.7 - 0.35);
                const cp1y = startY + size * (seedRandom(f*7+3) * 0.7 - 0.35);
                const cp2x = startX + size * (seedRandom(f*7+4) * 0.9 - 0.45);
                const cp2y = startY + size * (seedRandom(f*7+5) * 0.9 - 0.45);
                const endX = startX + size * (seedRandom(f*7+6) * 0.4 - 0.2);
                const endY = startY + size * (seedRandom(f*7+7) * 0.4 - 0.2);
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
                
                // Vary line width for more organic feel
                ctx.lineWidth = size * (0.01 + seedRandom(f*7+8) * 0.04);
                ctx.strokeStyle = color.replace('rgba', 'rgba').replace(', 0.', ', 0.3');
                ctx.stroke();
            }
        } 
        
        // Draw the cloud using multiple overlapping circles with varying opacity
        for (let j = 0; j < 18; j++) {
            const cloudX = x + size * (seedRandom(j*5) * 0.7 - 0.35);
            const cloudY = y + size * (seedRandom(j*5+1) * 0.7 - 0.35);
            const cloudSize = size * (0.15 + seedRandom(j*5+2) * 0.85);
            
            // Vary opacity for depth
            const opacity = 0.05 + seedRandom(j*5+3) * 0.08;
            const cloudColor = color.replace(', 0.', ', ' + opacity.toFixed(2) + ')');
            
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                cloudX, cloudY, 0,
                cloudX, cloudY, cloudSize
            );
            gradient.addColorStop(0, cloudColor);
            gradient.addColorStop(0.5, cloudColor.replace(', 0.', ', ' + (opacity * 0.8).toFixed(2) + ')'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

// Update camera to follow player
function updateCamera(gameData, playerId) {
    if (gameData.players && gameData.players[playerId]) {
        const player = gameData.players[playerId];
        
        // Always center camera exactly on player position - no smoothing needed
        // This ensures player is always centered regardless of zoom level
        cameraX = player.position.x;
        cameraY = player.position.y;
    }
    
    // Safety check - if camera zoom not set, initialize it
    if (typeof window.cameraZoom === 'undefined') {
        window.cameraZoom = 1;
    }
    
    // Update local cameraZoom from window object
    cameraZoom = window.cameraZoom;
}

// Draw game background with stars and nebula
function drawBackground(ctx, width, height) {
    // Create deeper space gradient inspired by Renaissance night skies and Dali's cosmic scenes
    const gradient = ctx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, Math.max(width, height)
    );
    gradient.addColorStop(0, '#1A237E'); // Ultramarine (Renaissance favorite)
    gradient.addColorStop(0.3, '#24348F'); // Lapis lazuli tones (precious Renaissance pigment)
    gradient.addColorStop(0.6, '#0D1A4A'); // Deep midnight blue (Da Vinci night scenes)
    gradient.addColorStop(0.8, '#0E1035'); // Prussian blue (Dali sky tones)
    gradient.addColorStop(1, '#000428'); // Almost black blue with subtle purple
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle vignette effect for heightened drama
    const vignette = ctx.createRadialGradient(
        width/2, height/2, Math.min(width, height) * 0.4,
        width/2, height/2, Math.max(width, height) * 0.9
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    
    // Draw distant stars with parallax effect (slower movement)
    drawStars(ctx, width, height, 0.2);
    
    // Draw nebula clouds
    drawNebulaClouds(ctx, width, height);
}

// Draw twinkling stars with parallax effect
function drawStars(ctx, width, height, parallaxFactor) {
    // Save the current time for twinkling effect
    const time = Date.now() / 1000;
    
    // Generate random stars
    ctx.save();
    
    // Apply parallax effect based on camera position
    const offsetX = -cameraX * parallaxFactor;
    const offsetY = -cameraY * parallaxFactor;
    
    // Create a pattern that repeats
    const starPatternSize = 1000;
    const starsPerPattern = 100;
    
    for (let patternX = Math.floor((cameraX - width) / starPatternSize) - 1; 
         patternX <= Math.floor((cameraX + width) / starPatternSize) + 1; 
         patternX++) {
        
        for (let patternY = Math.floor((cameraY - height) / starPatternSize) - 1; 
             patternY <= Math.floor((cameraY + height) / starPatternSize) + 1; 
             patternY++) {
            
            // Use a seeded random based on pattern position
            const patternSeed = (patternX * 10000 + patternY);
            let seedRandom = function(offset = 0) {
                const x = Math.sin(patternSeed + offset) * 10000;
                return x - Math.floor(x);
            };
            
            // Draw stars for this pattern
            for (let i = 0; i < starsPerPattern; i++) {
                // Position within pattern
                const x = seedRandom(i * 2) * starPatternSize;
                const y = seedRandom(i * 2 + 1) * starPatternSize;
                
                // Absolute position
                const starX = patternX * starPatternSize + x + offsetX;
                const starY = patternY * starPatternSize + y + offsetY;
                
                // Star properties
                const size = seedRandom(i * 2 + 2) * 2 + 0.5;
                
                // Twinkling effect
                const twinkle = (Math.sin(time * 3 + i) + 1) / 2;
                const alpha = 0.3 + twinkle * 0.7;
                
                // Star color
                const colorSeed = seedRandom(i * 2 + 3);
                let color;
                if (colorSeed < 0.6) {
                    // White or blue-white
                    color = `rgba(255, 255, ${200 + Math.floor(55 * colorSeed)}, ${alpha})`;
                } else if (colorSeed < 0.8) {
                    // Yellow
                    color = `rgba(255, ${200 + Math.floor(55 * colorSeed)}, 100, ${alpha})`;
                } else {
                    // Red or orange
                    color = `rgba(255, ${100 + Math.floor(155 * colorSeed)}, 50, ${alpha})`;
                }
                
                // Draw the star
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.arc(starX, starY, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow to some stars
                if (seedRandom(i * 2 + 4) > 0.7) {
                    ctx.beginPath();
                    const glow = ctx.createRadialGradient(
                        starX, starY, 0,
                        starX, starY, size * 3
                    );
                    glow.addColorStop(0, color.replace(`, ${alpha})`, ', 0.3)'));
                    glow.addColorStop(1, color.replace(`, ${alpha})`, ', 0)'));
                    ctx.fillStyle = glow;
                    ctx.arc(starX, starY, size * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    ctx.restore();
}

// Draw grid pattern with camera offset
function drawGrid(ctx, width, height) {
    const gridSize = 100; // Larger grid size for the infinite feel
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(80, 100, 255, 0.1)'; // Blue grid lines
    ctx.lineWidth = 1;
    
    // Calculate grid bounds based on camera position
    const viewportWidth = width / cameraZoom;
    const viewportHeight = height / cameraZoom;
    
    const startX = Math.floor((cameraX - viewportWidth/2) / gridSize) * gridSize;
    const endX = Math.ceil((cameraX + viewportWidth/2) / gridSize) * gridSize;
    const startY = Math.floor((cameraY - viewportHeight/2) / gridSize) * gridSize;
    const endY = Math.ceil((cameraY + viewportHeight/2) / gridSize) * gridSize;
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    
    ctx.stroke();
}

// Draw map bounds - subtle boundary indicator
function drawMapBounds(ctx) {
    // Get map dimensions from game data if available
    const mapWidth = MAP_WIDTH;
    const mapHeight = MAP_HEIGHT;
    
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
    
    // Add decorative elements at corners
    const cornerSize = 50;
    ctx.fillStyle = 'rgba(100, 100, 255, 0.2)';
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.lineTo(0, cornerSize);
    ctx.fill();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(mapWidth, 0);
    ctx.lineTo(mapWidth - cornerSize, 0);
    ctx.lineTo(mapWidth, cornerSize);
    ctx.fill();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(0, mapHeight);
    ctx.lineTo(cornerSize, mapHeight);
    ctx.lineTo(0, mapHeight - cornerSize);
    ctx.fill();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(mapWidth, mapHeight);
    ctx.lineTo(mapWidth - cornerSize, mapHeight);
    ctx.lineTo(mapWidth, mapHeight - cornerSize);
    ctx.fill();
}

// Draw orbs with Renaissance-inspired visual elements
function drawOrbs(ctx, orbs) {
    orbs.forEach(orb => {
        // Draw glow effect
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
            orb.position.x, orb.position.y, 1,
            orb.position.x, orb.position.y, orb.size * 3
        );
        
        // Special orbs have more intense glow
        if (orb.isSpecial) {
            // Save context for rotation
            ctx.save();
            
            // Translate to orb position
            ctx.translate(orb.position.x, orb.position.y);
            
            // Rotate continuously
            const rotationSpeed = Date.now() / 1000;
            ctx.rotate(rotationSpeed);
            
            // Enhanced glow with multiple layers - inspired by Dali's "Christ of Saint John of the Cross"
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(0.3, orb.color + 'CC');
            gradient.addColorStop(0.7, orb.color + '80');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            // Create outer glow
            ctx.fillStyle = gradient;
            ctx.fillRect(-orb.size * 5, -orb.size * 5, orb.size * 10, orb.size * 10);
            
            // Add pulsing animation to special orbs
            const pulseSize = orb.size * (1 + Math.sin(Date.now() / 200) * 0.3);
            const secondaryPulse = orb.size * (1 + Math.cos(Date.now() / 300) * 0.2);
            
            // Draw golden ratio spiral for special orbs - inspired by Fibonacci patterns in Renaissance art
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Gold
            ctx.lineWidth = orb.size * 0.2;
            
            // Draw golden spiral
            let a = 0;
            let b = pulseSize * 2;
            const goldenRatio = 1.618033988749895;
            
            ctx.moveTo(0, 0);
            for (let i = 0; i < 8; i++) {
                const angle = i * 0.5 * Math.PI;
                a = b * Math.cos(angle);
                b = b / goldenRatio;
                ctx.lineTo(a, b);
            }
            
            ctx.stroke();
            
            // Draw halo effect (Renaissance divine light)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = orb.size * 0.1;
            ctx.arc(0, 0, secondaryPulse * 2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Sacred geometry - Vitruvian-inspired star pattern
            const spikes = 5;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? pulseSize * 1.8 : pulseSize * 0.9;
                const angle = (Math.PI * 2 * i) / (spikes * 2);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            
            // Create multi-toned gradient fill like a Renaissance painting
            const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize * 1.8);
            starGradient.addColorStop(0, '#FFFFFF');
            starGradient.addColorStop(0.5, orb.color);
            starGradient.addColorStop(0.8, darkenColor(orb.color, 20));
            starGradient.addColorStop(1, '#000000');
            
            ctx.fillStyle = starGradient;
            ctx.fill();
            
            // Restore context
            ctx.restore();
        } else {
            // Regular orbs - inspired by the perfect, illuminated spheres in Renaissance paintings
            
            // Draw orb glow
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(0.5, orb.color + '70');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.arc(orb.position.x, orb.position.y, orb.size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw orb body with more dimension
            ctx.beginPath();
            
            // Create spherical gradient like Renaissance painted spheres
            const sphereGradient = ctx.createRadialGradient(
                orb.position.x - orb.size * 0.3, 
                orb.position.y - orb.size * 0.3, 
                0,
                orb.position.x, 
                orb.position.y, 
                orb.size * 1.2
            );
            
            // Color transitions to create the illusion of a perfect sphere
            sphereGradient.addColorStop(0, lightenColor(orb.color, 50));
            sphereGradient.addColorStop(0.5, orb.color);
            sphereGradient.addColorStop(1, darkenColor(orb.color, 30));
            
            ctx.fillStyle = sphereGradient;
            ctx.arc(orb.position.x, orb.position.y, orb.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw shine highlight (chiaroscuro technique from Renaissance)
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.arc(
                orb.position.x - orb.size * 0.4, 
                orb.position.y - orb.size * 0.4, 
                orb.size * 0.4, 
                0, Math.PI * 2
            );
            ctx.fill();
            
            // Draw subtle shadow
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.arc(
                orb.position.x + orb.size * 0.4, 
                orb.position.y + orb.size * 0.4, 
                orb.size * 0.3, 
                0, Math.PI * 2
            );
            ctx.fill();
        }
    });
}

// Draw players with Renaissance artistic influences
function drawPlayers(ctx, players, currentPlayerId) {
    // Sort players by size for proper z-index (smaller on top)
    const sortedPlayers = Object.values(players).sort((a, b) => b.size - a.size);
    
    sortedPlayers.forEach(player => {
        // Draw dramatic shadow (chiaroscuro technique from Renaissance painting)
        ctx.beginPath();
        const shadowGradient = ctx.createRadialGradient(
            player.position.x + 5, player.position.y + 5, 0,
            player.position.x + 5, player.position.y + 5, player.size * 1.5
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = shadowGradient;
        ctx.arc(
            player.position.x + 5,
            player.position.y + 5,
            player.size * 1.2,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw player body with magical effect
        ctx.beginPath();
        
        // Create gradient for player body inspired by Renaissance painting techniques
        // with sfumato (subtle blending of colors) and chiaroscuro (dramatic light/dark contrast)
        const gradient = ctx.createRadialGradient(
            player.position.x - player.size * 0.3, 
            player.position.y - player.size * 0.3, 
            0,
            player.position.x, 
            player.position.y, 
            player.size * 1.2
        );
        
        // Add pulsing effect to player if they are victorious
        let pulseEffect = 0;
        if (player.victorious) {
            pulseEffect = Math.sin(Date.now() / 200) * 5;
        }
        
        // Create rich color gradients inspired by Renaissance oil painting techniques
        gradient.addColorStop(0, lightenColor(player.color, 70)); // Highlight
        gradient.addColorStop(0.3, lightenColor(player.color, 40)); // Light area
        gradient.addColorStop(0.7, player.color); // Mid tone
        gradient.addColorStop(0.9, darkenColor(player.color, 20)); // Shadow edge
        gradient.addColorStop(1, darkenColor(player.color, 40)); // Deep shadow
        
        ctx.fillStyle = gradient;
        ctx.arc(
            player.position.x,
            player.position.y,
            player.size + pulseEffect,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw golden ratio spiral pattern within the player (Leonardo Da Vinci's geometric studies)
        if (player.size > 20) {
            ctx.save();
            ctx.translate(player.position.x, player.position.y);
            
            // Draw spiral with opacity based on player size
            const spiralOpacity = Math.min(0.3, player.size / 100);
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 215, 0, ${spiralOpacity})`; // Gold
            ctx.lineWidth = player.size * 0.05;
            
            // Draw golden spiral
            let a = 0;
            let b = player.size * 0.7;
            const goldenRatio = 1.618033988749895;
            
            ctx.moveTo(0, 0);
            for (let i = 0; i < 7; i++) {
                const angle = i * 0.5 * Math.PI;
                a = b * Math.cos(angle);
                b = b / goldenRatio;
                ctx.lineTo(a, b);
            }
            
            ctx.stroke();
            ctx.restore();
        }
        
        // Draw magical aura around player (inspired by divine auras in Renaissance religious paintings)
        ctx.beginPath();
        const auraGradient = ctx.createRadialGradient(
            player.position.x, player.position.y, player.size,
            player.position.x, player.position.y, player.size * 2
        );
        
        // Give the aura a golden/divine quality for larger players
        if (player.size > 30) {
            auraGradient.addColorStop(0, player.color + '60'); // Semi-transparent base color
            auraGradient.addColorStop(0.5, player.color + '30'); // Fading base color
            auraGradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.2)'); // Gold accent
            auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');  // Transparent
        } else {
            auraGradient.addColorStop(0, player.color + '50'); // Semi-transparent
            auraGradient.addColorStop(0.7, player.color + '20'); // More transparent
            auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');  // Transparent
        }
        
        ctx.fillStyle = auraGradient;
        ctx.arc(
            player.position.x,
            player.position.y,
            player.size * 2,
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw current weapon indicator for the current player
        if (player.id === currentPlayerId && window.selectedProjectileType) {
            drawPlayerWeaponIndicator(ctx, player);
        }
        
        // Draw magical particles and embellishments around victorious players
        if (player.victorious) {
            // Create a golden Renaissance-style crown
            drawCrown(ctx, player.position.x, player.position.y - player.size - 15, player.size * 0.6);
            
            // Draw rays of divine light (inspired by religious Renaissance paintings)
            const rayCount = 12;
            ctx.save();
            ctx.translate(player.position.x, player.position.y);
            
            // Draw beams of light
            for (let i = 0; i < rayCount; i++) {
                const angle = (Math.PI * 2 * i) / rayCount;
                const innerRadius = player.size * 1.5;
                const outerRadius = player.size * (2.5 + Math.sin(Date.now() / 1000 + i) * 0.5);
                
                const gradient = ctx.createLinearGradient(
                    Math.cos(angle) * innerRadius, 
                    Math.sin(angle) * innerRadius,
                    Math.cos(angle) * outerRadius, 
                    Math.sin(angle) * outerRadius
                );
                
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.7)'); // Gold
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Transparent
                
                ctx.beginPath();
                ctx.moveTo(
                    Math.cos(angle - 0.04) * innerRadius, 
                    Math.sin(angle - 0.04) * innerRadius
                );
                ctx.lineTo(
                    Math.cos(angle + 0.04) * innerRadius, 
                    Math.sin(angle + 0.04) * innerRadius
                );
                ctx.lineTo(
                    Math.cos(angle + 0.1) * outerRadius, 
                    Math.sin(angle + 0.1) * outerRadius
                );
                ctx.lineTo(
                    Math.cos(angle - 0.1) * outerRadius, 
                    Math.sin(angle - 0.1) * outerRadius
                );
                ctx.closePath();
                
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            
            ctx.restore();
            
            // Add flowing magical particles - inspired by Dali's flowing forms
            if (Math.random() < 0.5) {
                const angle = Math.random() * Math.PI * 2;
                const distance = player.size * 1.2;
                createParticle(
                    player.position.x + Math.cos(angle) * distance,
                    player.position.y + Math.sin(angle) * distance,
                    player.color,
                    Math.random() * 4 + 2,
                    70
                );
                
                // Also create gold particles
                if (Math.random() < 0.3) {
                    createParticle(
                        player.position.x + Math.cos(angle) * distance,
                        player.position.y + Math.sin(angle) * distance,
                        '#FFD700', // Gold
                        Math.random() * 3 + 1,
                        50
                    );
                }
            }
        }
        
        // Draw player name and score with Renaissance-style illuminated text
        if (player.name) {
            // Style the text like Renaissance illuminated manuscript
            const nameY = player.position.y - player.size - 15;
            const scoreY = player.position.y - player.size - 35;
            
            // Draw illuminated background for name
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.roundRect(
                player.position.x - player.name.length * 5,
                nameY - 12,
                player.name.length * 10,
                20,
                5
            );
            ctx.fill();
            
            // Set font style
            ctx.font = '14px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            
            // Draw name with glow for victorious players
            if (player.victorious) {
                ctx.shadowColor = 'gold';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#FFD700'; // Gold text for victors
            }
            
            // Illuminated first letter (like a medieval manuscript)
            const firstName = player.name.charAt(0);
            const restName = player.name.slice(1);
            
            // Draw the first letter slightly larger and with a special color
            ctx.strokeText(firstName, player.position.x - player.name.length * 3, nameY);
            ctx.fillStyle = player.victorious ? '#FFD700' : '#FF9900'; // Gold or orange
            ctx.fillText(firstName, player.position.x - player.name.length * 3, nameY);
            
            // Draw the rest of the name
            ctx.fillStyle = player.victorious ? '#FFD700' : 'white';
            ctx.strokeText(restName, player.position.x + restName.length * 2, nameY);
            ctx.fillText(restName, player.position.x + restName.length * 2, nameY);
            
            // Draw score with decorative elements
            ctx.strokeText(player.score.toString(), player.position.x, scoreY);
            ctx.fillText(player.score.toString(), player.position.x, scoreY);
            
            // Add small decorative flourishes on either side of score (like manuscript illuminations)
            const scoreWidth = player.score.toString().length * 10;
            ctx.beginPath();
            ctx.strokeStyle = player.victorious ? '#FFD700' : '#FF9900';
            ctx.lineWidth = 1;
            
            // Left flourish
            ctx.moveTo(player.position.x - scoreWidth - 10, scoreY);
            ctx.bezierCurveTo(
                player.position.x - scoreWidth - 5, scoreY - 5,
                player.position.x - scoreWidth - 5, scoreY + 5,
                player.position.x - scoreWidth, scoreY
            );
            
            // Right flourish
            ctx.moveTo(player.position.x + scoreWidth + 10, scoreY);
            ctx.bezierCurveTo(
                player.position.x + scoreWidth + 5, scoreY - 5,
                player.position.x + scoreWidth + 5, scoreY + 5,
                player.position.x + scoreWidth, scoreY
            );
            
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
        
        // Highlight current player with a Vitruvian Man-inspired circle and square
        if (player.id === currentPlayerId) {
            ctx.save();
            ctx.translate(player.position.x, player.position.y);
            
            // Animate rotation for square
            const rotationAngle = Date.now() / 5000;
            ctx.rotate(rotationAngle);
            
            // Animate the highlight with pulsing effect
            const pulseSize = 5 + Math.sin(Date.now() / 200) * 2;
            const size = player.size + pulseSize;
            
            // Draw square (representing earth/physical realm in Da Vinci's work)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)'; // Gold, semi-transparent
            ctx.lineWidth = 2;
            const squareSize = size * 1.414; // Square that would circumscribe the circle
            ctx.rect(-squareSize/2, -squareSize/2, squareSize, squareSize);
            ctx.stroke();
            
            // Reset rotation for circle
            ctx.restore();
            
            // Draw circle (representing heaven/spiritual realm in Da Vinci's work)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.arc(
                player.position.x,
                player.position.y,
                size,
                0, Math.PI * 2
            );
            ctx.stroke();
            
            // Add pulsing dots at cardinal points (like measurements in Vitruvian Man)
            const dotPositions = [
                {x: player.position.x, y: player.position.y - size}, // Top
                {x: player.position.x + size, y: player.position.y}, // Right
                {x: player.position.x, y: player.position.y + size}, // Bottom
                {x: player.position.x - size, y: player.position.y}  // Left
            ];
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            dotPositions.forEach(pos => {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    });
}

// Draw a visual indicator showing the player's current weapon selection
function drawPlayerWeaponIndicator(ctx, player) {
    // Access the global weapon types if available
    if (!window.weaponTypes) return;
    
    const type = window.selectedProjectileType || 'default';
    const weaponType = window.weaponTypes[type] || {
        icon: '✦',
        color: '#FFFFFF'
    };
    
    // Position the indicator above player
    const x = player.position.x;
    const y = player.position.y - player.size - 40;
    
    // Draw orbiting indicator
    const time = Date.now() / 1000;
    const orbitRadius = player.size * 0.8;
    const orbitSpeed = 2;
    const orbitX = x + Math.cos(time * orbitSpeed) * orbitRadius;
    const orbitY = y + Math.sin(time * orbitSpeed) * orbitRadius * 0.5;
    
    // Draw the weapon icon with glow
    ctx.save();
    
    // Add glow effect
    ctx.shadowColor = weaponType.color;
    ctx.shadowBlur = 15;
    
    // Draw the icon
    ctx.font = `${player.size * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = weaponType.color;
    ctx.fillText(weaponType.icon, orbitX, orbitY);
    
    // Draw connection line between player and icon
    ctx.beginPath();
    ctx.strokeStyle = `${weaponType.color}80`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(x, y);
    ctx.lineTo(orbitX, orbitY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.restore();
    
    // Draw small particles emanating from the player toward the icon
    if (Math.random() < 0.2) {
        const particleDistance = Math.random();
        const particleX = x + (orbitX - x) * particleDistance;
        const particleY = y + (orbitY - y) * particleDistance;
        
        createParticle(
            particleX,
            particleY,
            weaponType.color,
            player.size * 0.1,
            30
        );
    }
}

// Draw an ornate Renaissance-inspired crown for the victorious player
function drawCrown(ctx, x, y, size) {
    const crownHeight = size * 0.8;
    const crownWidth = size * 1.2;
    
    ctx.save();
    ctx.translate(x, y - crownHeight/2);
    
    // Add subtle glow behind crown
    const glowGradient = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, crownWidth
    );
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)'); // Gold glow
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(-crownWidth, -crownHeight, crownWidth * 2, crownHeight * 2);
    
    // Crown base with rich golden gradient (chiaroscuro technique)
    const baseGradient = ctx.createLinearGradient(
        0, -crownHeight * 0.4,
        0, crownHeight * 0.4
    );
    baseGradient.addColorStop(0, '#FFF2B2'); // Light gold highlight
    baseGradient.addColorStop(0.3, '#FFD700'); // Pure gold
    baseGradient.addColorStop(0.7, '#E6BC00'); // Slightly darker
    baseGradient.addColorStop(1, '#9A7D0A'); // Dark gold shadow
    
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    
    // More elaborate crown base with curved bottom edge
    ctx.moveTo(-crownWidth/2, 0);
    ctx.lineTo(crownWidth/2, 0);
    ctx.lineTo(crownWidth/2, crownHeight * 0.3);
    
    // Decorative curved bottom
    ctx.bezierCurveTo(
        crownWidth/3, crownHeight * 0.4,
        crownWidth/6, crownHeight * 0.5,
        0, crownHeight * 0.45
    );
    ctx.bezierCurveTo(
        -crownWidth/6, crownHeight * 0.5,
        -crownWidth/3, crownHeight * 0.4,
        -crownWidth/2, crownHeight * 0.3
    );
    
    ctx.closePath();
    ctx.fill();
    
    // Add decorative line pattern to crown base
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(154, 125, 10, 0.5)'; // Dark gold
    ctx.lineWidth = 1;
    
    // Horizontal decorative lines
    for (let i = 1; i <= 3; i++) {
        const y = crownHeight * (0.1 * i);
        ctx.moveTo(-crownWidth/2 + 3, y);
        ctx.lineTo(crownWidth/2 - 3, y);
    }
    ctx.stroke();
    
    // Crown points with more elegant, flowing shapes
    ctx.beginPath();
    
    // Left decorative fleur-de-lis inspired point
    ctx.moveTo(-crownWidth/2, 0);
    ctx.bezierCurveTo(
        -crownWidth/2.2, -crownHeight/6,
        -crownWidth/2.5, -crownHeight/4,
        -crownWidth/3, -crownHeight/2
    );
    ctx.bezierCurveTo(
        -crownWidth/3.5, -crownHeight/3,
        -crownWidth/4, -crownHeight/6,
        -crownWidth/6, 0
    );
    
    // Middle taller ornate point
    ctx.moveTo(-crownWidth/6, 0);
    ctx.bezierCurveTo(
        -crownWidth/10, -crownHeight/3,
        -crownWidth/20, -crownHeight/2,
        0, -crownHeight
    );
    ctx.bezierCurveTo(
        crownWidth/20, -crownHeight/2,
        crownWidth/10, -crownHeight/3,
        crownWidth/6, 0
    );
    
    // Right decorative fleur-de-lis inspired point
    ctx.moveTo(crownWidth/6, 0);
    ctx.bezierCurveTo(
        crownWidth/4, -crownHeight/6,
        crownWidth/3.5, -crownHeight/3,
        crownWidth/3, -crownHeight/2
    );
    ctx.bezierCurveTo(
        crownWidth/2.5, -crownHeight/4,
        crownWidth/2.2, -crownHeight/6,
        crownWidth/2, 0
    );
    
    // Fill points with gradient
    const pointsGradient = ctx.createLinearGradient(
        0, -crownHeight,
        0, 0
    );
    pointsGradient.addColorStop(0, '#FFF2B2'); // Light gold at tips
    pointsGradient.addColorStop(0.4, '#FFD700');
    pointsGradient.addColorStop(1, '#E6BC00');
    
    ctx.fillStyle = pointsGradient;
    ctx.fill();
    
    // Add fine details with darker lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(154, 125, 10, 0.7)';
    ctx.lineWidth = 0.5;
    
    // Left point details
    ctx.moveTo(-crownWidth/3, -crownHeight/2);
    ctx.bezierCurveTo(
        -crownWidth/3.2, -crownHeight/2.5,
        -crownWidth/3.3, -crownHeight/3,
        -crownWidth/3.5, -crownHeight/3.5
    );
    
    // Middle point details
    ctx.moveTo(0, -crownHeight);
    ctx.bezierCurveTo(
        -crownWidth/30, -crownHeight * 0.8,
        crownWidth/30, -crownHeight * 0.8,
        0, -crownHeight * 0.6
    );
    
    // Right point details
    ctx.moveTo(crownWidth/3, -crownHeight/2);
    ctx.bezierCurveTo(
        crownWidth/3.2, -crownHeight/2.5,
        crownWidth/3.3, -crownHeight/3,
        crownWidth/3.5, -crownHeight/3.5
    );
    
    ctx.stroke();
    
    // Crown jewels with renaissance color palette and realistic shine
    // Red ruby jewel (center)
    const rubyGradient = ctx.createRadialGradient(
        0, -crownHeight * 0.6, 0,
        0, -crownHeight * 0.6, size * 0.2
    );
    rubyGradient.addColorStop(0, '#FF5252'); // Light center
    rubyGradient.addColorStop(0.5, '#B22222'); // Medium red
    rubyGradient.addColorStop(1, '#800000'); // Dark red edge
    
    ctx.fillStyle = rubyGradient;
    ctx.beginPath();
    ctx.arc(0, -crownHeight * 0.6, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine to ruby
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.arc(
        -size * 0.05, 
        -crownHeight * 0.6 - size * 0.05, 
        size * 0.05, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Blue sapphire (left)
    const sapphireGradient = ctx.createRadialGradient(
        -crownWidth/3, -crownHeight * 0.25, 0,
        -crownWidth/3, -crownHeight * 0.25, size * 0.12
    );
    sapphireGradient.addColorStop(0, '#6495ED'); // Light center
    sapphireGradient.addColorStop(0.6, '#0000CD'); // Medium blue
    sapphireGradient.addColorStop(1, '#000080'); // Dark blue edge
    
    ctx.fillStyle = sapphireGradient;
    ctx.beginPath();
    ctx.arc(-crownWidth/3, -crownHeight * 0.25, size * 0.11, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine to sapphire
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.arc(
        -crownWidth/3 - size * 0.04, 
        -crownHeight * 0.25 - size * 0.04, 
        size * 0.04, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Green emerald (right)
    const emeraldGradient = ctx.createRadialGradient(
        crownWidth/3, -crownHeight * 0.25, 0,
        crownWidth/3, -crownHeight * 0.25, size * 0.12
    );
    emeraldGradient.addColorStop(0, '#00FF7F'); // Light center
    emeraldGradient.addColorStop(0.6, '#00A86B'); // Medium green
    emeraldGradient.addColorStop(1, '#006400'); // Dark green edge
    
    ctx.fillStyle = emeraldGradient;
    ctx.beginPath();
    ctx.arc(crownWidth/3, -crownHeight * 0.25, size * 0.11, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shine to emerald
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.arc(
        crownWidth/3 - size * 0.04, 
        -crownHeight * 0.25 - size * 0.04, 
        size * 0.04, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Add small diamond accents along the crown base
    const diamondCount = 5;
    const diamondSize = size * 0.05;
    
    for (let i = 1; i < diamondCount; i++) {
        const diamondX = -crownWidth/2 + (crownWidth * i / diamondCount);
        const diamondY = crownHeight * 0.2;
        
        // Diamond gradient
        const diamondGradient = ctx.createRadialGradient(
            diamondX, diamondY, 0,
            diamondX, diamondY, diamondSize
        );
        diamondGradient.addColorStop(0, 'white');
        diamondGradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.8)');
        diamondGradient.addColorStop(1, 'rgba(150, 150, 220, 0.6)');
        
        ctx.fillStyle = diamondGradient;
        ctx.beginPath();
        ctx.arc(diamondX, diamondY, diamondSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add gold trim around the jewels
    ctx.strokeStyle = '#9A7D0A';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.arc(0, -crownHeight * 0.6, size * 0.17, 0, Math.PI * 2); // Ruby border
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(-crownWidth/3, -crownHeight * 0.25, size * 0.12, 0, Math.PI * 2); // Sapphire border
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(crownWidth/3, -crownHeight * 0.25, size * 0.12, 0, Math.PI * 2); // Emerald border
    ctx.stroke();
    
    ctx.restore();
}

// Draw player projectiles
function drawProjectiles(ctx, projectiles, playerId) {
    projectiles.forEach(projectile => {
        const isPlayerProjectile = projectile.playerId === playerId;
        
        // Enhanced trailing particle effects with different appearances based on projectile type
        // More particles with higher frequency for more visual impact
        if (Math.random() < (projectile.type === 'fast' ? 0.5 : 0.3)) {
            let trailColor;
            let particleSize = projectile.size * 0.4;
            let particleLife = 20;
            
            // Different particle effects based on projectile type
            switch (projectile.type) {
                case 'fast':
                    // Fast shot: Add motion blur effect with cyan/blue particles
                    trailColor = lightenColor(projectile.playerColor || '#ffffff', 20);
                    particleSize *= 0.6; 
                    
                    // Create elongated motion blur particles
                    for (let i = 0; i < 3; i++) { // Create multiple particles for motion blur
                        const distance = i * 0.1;
                        createParticle(
                            projectile.position.x - (projectile.velocity.x * distance), 
                            projectile.position.y - (projectile.velocity.y * distance), 
                            '#88CCFF',
                            particleSize * (1 - distance),
                            10 - i * 2
                        );
                    }
                    break;
                    
                case 'powerful':
                    // Powerful shot: Add flame/heat distortion effect with larger particles
                    const powerColors = ['#FF8800', '#FF4400', '#FFCC00', '#FF2200'];
                    trailColor = powerColors[Math.floor(Math.random() * powerColors.length)];
                    particleSize *= 1.8; 
                    particleLife = 40;
                    break;
                    
                case 'aoe':
                    // AOE shot: Mystical energy with multiple color variations
                    const aoeColors = [
                        projectile.playerColor, 
                        lightenColor(projectile.playerColor, 20),
                        '#CC88FF',
                        '#8844AA',
                        '#AA66CC'
                    ];
                    trailColor = aoeColors[Math.floor(Math.random() * aoeColors.length)];
                    
                    // Create orbital particles for AOE shots
                    const angle = Math.random() * Math.PI * 2;
                    const orbitDist = projectile.size * (0.8 + Math.random() * 0.5);
                    createParticle(
                        projectile.position.x + Math.cos(angle) * orbitDist, 
                        projectile.position.y + Math.sin(angle) * orbitDist,
                        trailColor,
                        particleSize * 0.7,
                        30
                    );
                    break;
                    
                default:
                    trailColor = isPlayerProjectile ? 
                        projectile.playerColor || '#ffffff' :
                        darkenColor(projectile.playerColor || '#ffffff', 20);
                    break;
            }
                
            // Common particle behind the projectile
            createParticle(
                projectile.position.x - (projectile.velocity.x * 0.5), 
                projectile.position.y - (projectile.velocity.y * 0.5), 
                trailColor,
                particleSize,
                particleLife
            );
        }
        
        // Save context for rotation
        ctx.save();
        
        // Move origin to projectile position
        ctx.translate(projectile.position.x, projectile.position.y);
        
        // Rotate based on projectile direction
        if (projectile.velocity) {
            const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
            ctx.rotate(angle);
        }
        
        // Add a pre-render effect based on projectile type (like glows, distortions)
        switch (projectile.type) {
            case 'fast':
                // Motion blur for fast projectiles
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#88CCFF';
                break;
                
            case 'powerful':
                // Energy ripple effect for powerful projectiles
                const rippleSize = projectile.size * 1.8 * (1 + Math.sin(Date.now() / 150) * 0.2);
                ctx.beginPath();
                ctx.arc(0, 0, rippleSize, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 100, 0, 0.15)';
                ctx.fill();
                
                // Heat distortion
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#FF4400';
                break;
                
            case 'aoe':
                // Magical aura for AOE
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#CC88FF';
                break;
                
            default:
                ctx.shadowBlur = 5;
                ctx.shadowColor = projectile.playerColor;
                break;
        }
        
        // Draw magical flame-like trail with enhanced variations based on projectile type
        let trailLength;
        let trailWidth;
        
        // Customize trail based on projectile type
        switch (projectile.type) {
            case 'fast':
                trailLength = projectile.size * 10; // Longer trail for faster projectiles
                trailWidth = projectile.size * 1.1; // Thinner trail
                break;
                
            case 'powerful':
                trailLength = projectile.size * 6; // Shorter but wider trail
                trailWidth = projectile.size * 3.5; // Much wider trail
                break;
                
            case 'aoe':
                trailLength = projectile.size * 7;
                trailWidth = projectile.size * 2.8;
                break;
                
            default:
                trailLength = projectile.size * 5;
                trailWidth = projectile.size * 2;
                break;
        }
        
        // Create gradient for trail with more vivid colors
        const trailGradient = ctx.createLinearGradient(0, 0, -trailLength, 0);
        
        // Enhanced gradient colors based on projectile type
        if (projectile.type === 'fast') {
            // Fast projectile - electric blue trail with lightning effects
            trailGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            trailGradient.addColorStop(0.1, '#00FFFF');
            trailGradient.addColorStop(0.3, '#88CCFF');
            trailGradient.addColorStop(0.7, '#0088FF');
            trailGradient.addColorStop(1, 'rgba(0, 50, 255, 0)');
            
            // Draw lightning-like zigzag patterns in the trail
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(180, 230, 255, 0.6)';
            ctx.lineWidth = projectile.size * 0.1;
            ctx.moveTo(0, 0);
            
            let xPos = 0;
            while (xPos > -trailLength) {
                xPos -= trailLength / 6;
                const yOffset = (Math.random() - 0.5) * trailWidth * 0.8;
                ctx.lineTo(xPos, yOffset);
            }
            ctx.stroke();
            
        } else if (projectile.type === 'powerful') {
            // Powerful projectile - fiery inferno with intense red/orange core
            trailGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            trailGradient.addColorStop(0.1, '#FFFF00');
            trailGradient.addColorStop(0.2, '#FFCC00');
            trailGradient.addColorStop(0.4, '#FF6600');
            trailGradient.addColorStop(0.6, '#FF0000');
            trailGradient.addColorStop(0.8, '#CC0000');
            trailGradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
            
            // Add inner fire glow
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
            ctx.arc(0, 0, projectile.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (projectile.type === 'aoe') {
            // AOE projectile - mystic energy with swirling patterns
            trailGradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            trailGradient.addColorStop(0.2, '#FF88FF');
            trailGradient.addColorStop(0.4, '#CC88FF');
            trailGradient.addColorStop(0.6, '#9944CC');
            trailGradient.addColorStop(0.8, '#662288');
            trailGradient.addColorStop(1, 'rgba(50, 0, 80, 0)');
            
            // Draw energy swirls
            const time = Date.now() / 1000;
            const swirls = 3;
            
            for (let i = 0; i < swirls; i++) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(200, 150, 255, 0.3)';
                ctx.lineWidth = projectile.size * 0.15;
                
                const frequency = 20 + i * 5;
                const phase = i * Math.PI / 3 + time;
                const amplitude = trailWidth * 0.4;
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                
                for (let x = 0; x > -trailLength; x -= 2) {
                    const swirlY = Math.sin(x * 0.05 + phase) * amplitude * Math.min(1, -x / 20);
                    ctx.lineTo(x, swirlY);
                }
                
                ctx.stroke();
            }
            
        } else if (isPlayerProjectile) {
            // Default player's own projectile - original colors
            trailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            trailGradient.addColorStop(0.2, `${projectile.playerColor}EE`);
            trailGradient.addColorStop(0.6, `${projectile.playerColor}99`);
            trailGradient.addColorStop(0.8, `${darkenColor(projectile.playerColor, 20)}50`);
            trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            // Other player's projectile - original colors
            trailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            trailGradient.addColorStop(0.3, `${projectile.playerColor}AA`);
            trailGradient.addColorStop(0.7, `${projectile.playerColor}55`);
            trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        
        // Draw flame-like trail using bezier curves
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-trailLength * 0.2, trailWidth * 0.5);
        ctx.bezierCurveTo(
            -trailLength * 0.5, trailWidth * 0.7,
            -trailLength * 0.7, trailWidth * 0.5,
            -trailLength, 0
        );
        ctx.bezierCurveTo(
            -trailLength * 0.7, -trailWidth * 0.5,
            -trailLength * 0.5, -trailWidth * 0.7,
            -trailLength * 0.2, -trailWidth * 0.5
        );
        ctx.closePath();
        
        ctx.fillStyle = trailGradient;
        ctx.fill();
        
        // Draw geometric projectile head with enhanced visuals
        const pulseEffect = isPlayerProjectile ? 
            Math.sin(Date.now() / 100) * 0.1 + 1 : 1;
            
        const size = projectile.size * pulseEffect;
        
        // Draw different shapes based on projectile type with enhanced styling
        ctx.beginPath();
        
        if (projectile.type === 'fast') {
            // Fast projectile - streamlined arrow shape
            ctx.moveTo(size * 2.5, 0);
            ctx.lineTo(0, size * 0.5);
            ctx.lineTo(-size * 0.2, 0);
            ctx.lineTo(0, -size * 0.5);
            
            // Add extra details for aerodynamic look
            ctx.moveTo(size * 0.8, size * 0.3);
            ctx.lineTo(size * 1.5, size * 0.15);
            ctx.moveTo(size * 0.8, -size * 0.3);
            ctx.lineTo(size * 1.5, -size * 0.15);
            
        } else if (projectile.type === 'powerful') {
            // Powerful projectile - impressive fireball shape with jagged edges
            const edges = 8;
            const outerRadius = size * 1.4;
            const innerRadius = size * 1.0;
            
            for (let i = 0; i < edges * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = i * Math.PI / edges;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            
            // Add rotating inner core for powerful shot
            ctx.save();
            const rotationSpeed = Date.now() / 300;
            ctx.rotate(rotationSpeed);
            
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = (i * 2 * Math.PI / 3) + rotationSpeed;
                const x1 = Math.cos(angle) * size * 0.6;
                const y1 = Math.sin(angle) * size * 0.6;
                const x2 = Math.cos(angle + 0.3) * size * 0.3;
                const y2 = Math.sin(angle + 0.3) * size * 0.3;
                
                ctx.moveTo(0, 0);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
            }
            ctx.fillStyle = '#FFCC00';
            ctx.fill();
            ctx.restore();
            
        } else if (projectile.type === 'aoe') {
            // AOE projectile - complex energized starburst pattern
            const outerSpikes = 8;
            const innerSpikes = 8;
            const outerRadius = size * 1.4;
            const midRadius = size * 0.9;
            const innerRadius = size * 0.5;
            
            // Draw complex multi-layered starburst
            for (let i = 0; i < outerSpikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : midRadius;
                const angle = i * Math.PI / outerSpikes;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            // Add inner spinning layer for AOE
            const time = Date.now() / 500;
            
            ctx.closePath();
            ctx.fillStyle = '#CC88FF88';
            ctx.fill();
            
            // Inner rotating wheel
            ctx.save();
            ctx.rotate(-time); // Counter-rotate
            ctx.beginPath();
            
            for (let i = 0; i < innerSpikes; i++) {
                const angle = i * Math.PI * 2 / innerSpikes;
                const x1 = Math.cos(angle) * innerRadius;
                const y1 = Math.sin(angle) * innerRadius;
                const x2 = Math.cos(angle + Math.PI/innerSpikes) * innerRadius * 0.6;
                const y2 = Math.sin(angle + Math.PI/innerSpikes) * innerRadius * 0.6;
                
                ctx.moveTo(0, 0);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
            }
            
            ctx.fillStyle = '#AA66CCAA';
            ctx.fill();
            ctx.restore();
            
        } else {
            // Default projectile - enhanced diamond/rhombus shape
            ctx.moveTo(size * 1.5, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size, 0);
            ctx.lineTo(0, -size);
            ctx.closePath();
            
            // Add simple decoration to default shot
            ctx.moveTo(size * 0.8, 0);
            ctx.arc(size * 0.8, 0, size * 0.2, 0, Math.PI * 2);
        }
        
        // Create gradient fill for projectile head with more dramatic colors
        const headGradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, size * 1.5
        );
        
        // Enhanced gradient colors based on projectile type
        if (projectile.type === 'fast') {
            headGradient.addColorStop(0, 'white');
            headGradient.addColorStop(0.2, '#E0FFFF');
            headGradient.addColorStop(0.4, '#88CCFF');
            headGradient.addColorStop(0.7, '#0088FF');
            headGradient.addColorStop(1, '#0044AA');
        } else if (projectile.type === 'powerful') {
            headGradient.addColorStop(0, 'white');
            headGradient.addColorStop(0.2, '#FFFF88');
            headGradient.addColorStop(0.4, '#FFCC00');
            headGradient.addColorStop(0.6, '#FF6600');
            headGradient.addColorStop(0.8, '#CC2200');
            headGradient.addColorStop(1, '#880000');
        } else if (projectile.type === 'aoe') {
            headGradient.addColorStop(0, 'white');
            headGradient.addColorStop(0.3, '#FFCCFF');
            headGradient.addColorStop(0.5, '#CC88FF');
            headGradient.addColorStop(0.7, '#9944CC');
            headGradient.addColorStop(0.9, '#662288');
            headGradient.addColorStop(1, '#440066');
        } else {
            headGradient.addColorStop(0, 'white');
            headGradient.addColorStop(0.5, projectile.playerColor || '#ffffff');
            headGradient.addColorStop(1, darkenColor(projectile.playerColor || '#ffffff', 20));
        }
        
        ctx.fillStyle = headGradient;
        ctx.fill();
        
        // Draw special effects for different projectile types
        if (projectile.type === 'fast') {
            // Speed streaks for fast projectiles
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(135, 206, 250, 0.7)';
            ctx.lineWidth = size * 0.05;
            
            // Draw several speed lines
            for (let i = 0; i < 6; i++) {
                const lineLength = size * (3 + i * 0.5);
                const yOffset = size * 0.2 * (i % 3 - 1);
                ctx.moveTo(-lineLength * 0.2, yOffset);
                ctx.lineTo(-lineLength, yOffset);
            }
            ctx.stroke();
            
            // Electric sparks at random positions near the tip
            if (Math.random() < 0.3) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(200, 230, 255, 0.9)';
                ctx.lineWidth = size * 0.05;
                
                const sparkX = size * Math.random() * 2;
                const sparkY = (Math.random() - 0.5) * size;
                
                ctx.moveTo(sparkX, sparkY);
                ctx.lineTo(sparkX + size * 0.5, sparkY + (Math.random() - 0.5) * size);
                ctx.stroke();
            }
            
        } else if (projectile.type === 'powerful') {
            // Explosive energy effect for powerful projectiles
            const time = Date.now() / 150;
            const pulseSize = size * 1.2 * (1 + Math.sin(time) * 0.2);
            
            // Draw pulsing glow
            ctx.beginPath();
            const powerGlow = ctx.createRadialGradient(
                0, 0, size * 0.2,
                0, 0, pulseSize * 2
            );
            
            powerGlow.addColorStop(0, 'rgba(255, 255, 200, 0.7)');
            powerGlow.addColorStop(0.2, 'rgba(255, 180, 0, 0.5)');
            powerGlow.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
            powerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = powerGlow;
            ctx.arc(0, 0, pulseSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add fire particles
            if (Math.random() < 0.5) {
                const angle = Math.random() * Math.PI * 2;
                const radius = size * (0.8 + Math.random() * 0.5);
                createParticle(
                    projectile.position.x + Math.cos(angle) * radius, 
                    projectile.position.y + Math.sin(angle) * radius,
                    ['#FFFF00', '#FFCC00', '#FF8800', '#FF4400'][Math.floor(Math.random() * 4)],
                    size * 0.3,
                    20
                );
            }
            
        } else if (projectile.type === 'aoe') {
            // Magical ripple/wave effect for AOE projectiles
            const ripples = 3;
            ctx.strokeStyle = 'rgba(180, 120, 255, 0.5)';
            ctx.setLineDash([5, 5]);
            
            for (let i = 0; i < ripples; i++) {
                const time = Date.now() / (300 + i * 100);
                const rippleSize = size * (2 + i * 0.5) * (0.8 + Math.sin(time) * 0.2);
                
                ctx.beginPath();
                ctx.lineWidth = size * 0.05 * (1 - i * 0.2);
                ctx.arc(0, 0, rippleSize, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.setLineDash([]);
            
            // Orbital energy particles
            if (Math.random() < 0.3) {
                const time = Date.now() / 1000;
                const angle = Math.random() * Math.PI * 2;
                const orbitDistance = size * 2.5;
                
                createParticle(
                    projectile.position.x + Math.cos(angle) * orbitDistance,
                    projectile.position.y + Math.sin(angle) * orbitDistance,
                    '#CC88FF',
                    size * 0.2,
                    30
                );
            }
        }
        
        // Add golden ratio spiral pattern to player's projectiles (regardless of type)
        if (isPlayerProjectile) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; // Gold
            ctx.lineWidth = size * 0.15;
            
            // Draw a small golden spiral
            let a = 0;
            let b = 1;
            const goldenRatio = 1.618033988749895;
            
            ctx.moveTo(0, 0);
            for (let i = 0; i < 4; i++) {
                a = b * Math.cos(i * 0.5 * Math.PI);
                b = b / goldenRatio;
                ctx.lineTo(a * size * 0.4, b * size * 0.4);
            }
            
            ctx.stroke();
        }
        
        // Draw enhanced glow effect with more dramatic colors
        ctx.beginPath();
        const glowGradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, size * 3
        );
        
        // Different glow colors based on projectile type
        if (projectile.type === 'fast') {
            glowGradient.addColorStop(0, 'rgba(135, 206, 250, 0.6)');
            glowGradient.addColorStop(0.5, 'rgba(30, 144, 255, 0.3)');
            glowGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
        } else if (projectile.type === 'powerful') {
            glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
            glowGradient.addColorStop(0.3, 'rgba(255, 140, 0, 0.4)');
            glowGradient.addColorStop(0.7, 'rgba(255, 69, 0, 0.2)');
            glowGradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
        } else if (projectile.type === 'aoe') {
            glowGradient.addColorStop(0, 'rgba(221, 160, 255, 0.5)');
            glowGradient.addColorStop(0.4, 'rgba(186, 85, 211, 0.3)');
            glowGradient.addColorStop(0.7, 'rgba(148, 0, 211, 0.2)');
            glowGradient.addColorStop(1, 'rgba(75, 0, 130, 0)');
        } else {
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        
        ctx.fillStyle = glowGradient;
        ctx.arc(0, 0, size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset any shadow effects
        ctx.shadowBlur = 0;
        
        // Restore context
        ctx.restore();
        
        // Draw AOE radius indicator for player's AOE projectiles with enhanced visuals
        if (isPlayerProjectile && projectile.type === 'aoe' && projectile.aoeRadius) {
            ctx.beginPath();
            
            // Create a more visible, animated AOE radius indicator
            const time = Date.now() / 1000;
            const pulseScale = 1 + Math.sin(time * 3) * 0.05;
            
            // Gradient for AOE radius
            const aoeGradient = ctx.createRadialGradient(
                projectile.position.x, projectile.position.y, 
                projectile.aoeRadius * 0.8 * pulseScale,
                projectile.position.x, projectile.position.y, 
                projectile.aoeRadius * pulseScale
            );
            
            aoeGradient.addColorStop(0, 'rgba(221, 160, 255, 0.0)');
            aoeGradient.addColorStop(0.7, 'rgba(221, 160, 255, 0.1)');
            aoeGradient.addColorStop(0.9, 'rgba(221, 160, 255, 0.3)');
            aoeGradient.addColorStop(1, 'rgba(221, 160, 255, 0.0)');
            
            // Draw aoe field
            ctx.fillStyle = aoeGradient;
            ctx.arc(projectile.position.x, projectile.position.y, projectile.aoeRadius * pulseScale, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw dashed border
            ctx.beginPath();
            ctx.arc(projectile.position.x, projectile.position.y, projectile.aoeRadius * pulseScale, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(221, 160, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw energy runes around the perimeter
            const runeCount = 6;
            for (let i = 0; i < runeCount; i++) {
                const angle = (i / runeCount) * Math.PI * 2 + time;
                const x = projectile.position.x + Math.cos(angle) * projectile.aoeRadius * pulseScale;
                const y = projectile.position.y + Math.sin(angle) * projectile.aoeRadius * pulseScale;
                
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI/2);
                
                ctx.beginPath();
                ctx.fillStyle = 'rgba(221, 160, 255, 0.7)';
                ctx.fillRect(-3, -8, 6, 16);
                ctx.restore();
            }
        }
    });
}

// Draw UI elements with Renaissance-inspired design elements
function drawUI(ctx, gameData, playerId, width, height) {
    // Draw mini-map
    drawMiniMap(ctx, gameData, playerId, width, height);
    
    // Draw score indicator
    if (gameData.players && gameData.players[playerId]) {
        const player = gameData.players[playerId];
        const progress = player.size / 100; // Assuming 100 is max size
        
        // Draw ornate progress frame with golden ratio proportions
        const barWidth = 240;
        const barHeight = 28;
        const barX = width/2 - barWidth/2;
        const barY = height - 35;
        
        // Draw decorative background with subtle texture
        ctx.fillStyle = 'rgba(14, 17, 40, 0.8)'; // Deep blue background
        
        // Draw rounded rectangle with subtle corner decorations
        ctx.beginPath();
        ctx.moveTo(barX + 10, barY);
        ctx.lineTo(barX + barWidth - 10, barY);
        ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + 10);
        ctx.lineTo(barX + barWidth, barY + barHeight - 10);
        ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - 10, barY + barHeight);
        ctx.lineTo(barX + 10, barY + barHeight);
        ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - 10);
        ctx.lineTo(barX, barY + 10);
        ctx.quadraticCurveTo(barX, barY, barX + 10, barY);
        ctx.fill();
        
        // Add decorative golden corners (reminiscent of illuminated manuscripts)
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.8)';
        ctx.lineWidth = 1.5;
        
        // Top-left corner flourish
        ctx.beginPath();
        ctx.moveTo(barX, barY + 10);
        ctx.quadraticCurveTo(barX - 5, barY + 5, barX - 8, barY);
        ctx.stroke();
        
        // Top-right corner flourish
        ctx.beginPath();
        ctx.moveTo(barX + barWidth, barY + 10);
        ctx.quadraticCurveTo(barX + barWidth + 5, barY + 5, barX + barWidth + 8, barY);
        ctx.stroke();
        
        // Bottom-left corner flourish
        ctx.beginPath();
        ctx.moveTo(barX, barY + barHeight - 10);
        ctx.quadraticCurveTo(barX - 5, barY + barHeight - 5, barX - 8, barY + barHeight);
        ctx.stroke();
        
        // Bottom-right corner flourish
        ctx.beginPath();
        ctx.moveTo(barX + barWidth, barY + barHeight - 10);
        ctx.quadraticCurveTo(barX + barWidth + 5, barY + barHeight - 5, barX + barWidth + 8, barY + barHeight);
        ctx.stroke();
        
        // Progress fill with gradient inspired by Renaissance paintings
        const progressGradient = ctx.createLinearGradient(
            barX + 4, barY + 4,
            barX + 4 + (barWidth - 8) * progress, barY + barHeight - 8
        );
        
        // Use player's color but with Renaissance-inspired gradient
        const baseColor = player.color;
        progressGradient.addColorStop(0, lightenColor(baseColor, 30)); // Lighter shade
        progressGradient.addColorStop(0.5, baseColor); // Original color
        progressGradient.addColorStop(1, darkenColor(baseColor, 20)); // Darker shade
        
        // Fill progress bar with rounded corners
        ctx.fillStyle = progressGradient;
        
        // Draw rounded progress fill
        const fillWidth = Math.max(8, (barWidth - 8) * progress); // Ensure minimum width for small values
        
        ctx.beginPath();
        ctx.moveTo(barX + 4, barY + 4 + 4);
        ctx.lineTo(barX + 4 + fillWidth - 4, barY + 4 + 4);
        ctx.quadraticCurveTo(barX + 4 + fillWidth, barY + 4 + 4, barX + 4 + fillWidth, barY + 4 + 8);
        ctx.lineTo(barX + 4 + fillWidth, barY + 4 + (barHeight - 8) - 4);
        ctx.quadraticCurveTo(barX + 4 + fillWidth, barY + 4 + (barHeight - 8), barX + 4 + fillWidth - 4, barY + 4 + (barHeight - 8));
        ctx.lineTo(barX + 4 + 4, barY + 4 + (barHeight - 8));
        ctx.quadraticCurveTo(barX + 4, barY + 4 + (barHeight - 8), barX + 4, barY + 4 + (barHeight - 8) - 4);
        ctx.lineTo(barX + 4, barY + 4 + 8);
        ctx.quadraticCurveTo(barX + 4, barY + 4 + 4, barX + 4 + 4, barY + 4 + 4);
        ctx.fill();
        
        // Add subtle inner stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw ornate border
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.7)'; // Gold color
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(barX + 2, barY + 2, barWidth - 4, barHeight - 4);
        ctx.stroke();
        
        // Add decorative line pattern
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.3)';
        ctx.lineWidth = 1;
        
        // Vertical decorative lines
        const lineCount = 8;
        for (let i = 1; i < lineCount; i++) {
            const lineX = barX + (barWidth * i / lineCount);
            ctx.beginPath();
            ctx.moveTo(lineX, barY + 4);
            ctx.lineTo(lineX, barY + barHeight - 4);
            ctx.stroke();
        }
        
        // Use Renaissance-inspired font style
        ctx.font = '14px "Press Start 2P", cursive';
        ctx.fillStyle = '#F0E6D2'; // Warm parchment color
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(player.size)} / 100`, width/2, barY + barHeight / 2 + 5);
        
        // Draw golden ratio spiral icon at the start of the bar
        ctx.save();
        ctx.translate(barX - 15, barY + barHeight/2);
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.8)';
        ctx.lineWidth = 1.5;
        
        // Draw golden spiral
        let a = 0;
        let b = 8;
        const goldenRatio = 1.618033988749895;
        
        ctx.moveTo(0, 0);
        for (let i = 0; i < 6; i++) {
            const angle = i * 0.5 * Math.PI;
            a = b * Math.cos(angle);
            b = b / goldenRatio;
            ctx.lineTo(a, b);
        }
        
        ctx.stroke();
        ctx.restore();
        
        // Draw shoot cooldown indicator if recently shot
        const now = Date.now();
        if (window.lastShootTime && now - window.lastShootTime < 2000) {
            const cooldownProgress = Math.min(1, (now - window.lastShootTime) / 2000);
            
            // Draw an ornate cooldown indicator
            const cdBarWidth = 220;
            const cdBarHeight = 14;
            const cdBarX = width/2 - cdBarWidth/2;
            const cdBarY = height - 65;
            
            // Draw decorative background
            ctx.fillStyle = 'rgba(14, 17, 40, 0.7)';
            ctx.beginPath();
            ctx.roundRect(cdBarX, cdBarY, cdBarWidth, cdBarHeight, 4);
            ctx.fill();
            
            // Fill based on cooldown
            const cooldownColor = cooldownProgress >= 1 ? 
                'rgba(0, 168, 107, 0.8)' : // Renaissance viridian green
                'rgba(178, 34, 34, 0.8)';  // Venetian red
                
            // Create gradient
            const cdGradient = ctx.createLinearGradient(
                cdBarX, cdBarY,
                cdBarX + cdBarWidth * cooldownProgress, cdBarY
            );
            
            cdGradient.addColorStop(0, lightenColor(cooldownColor, 30));
            cdGradient.addColorStop(1, cooldownColor);
            
            ctx.fillStyle = cdGradient;
            ctx.beginPath();
            ctx.roundRect(
                cdBarX + 2, 
                cdBarY + 2, 
                Math.max(4, (cdBarWidth - 4) * cooldownProgress), 
                cdBarHeight - 4, 
                3
            );
            ctx.fill();
            
            // Border
            ctx.strokeStyle = cooldownProgress >= 1 ? 
                'rgba(0, 168, 107, 0.9)' : 
                'rgba(178, 34, 34, 0.9)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(cdBarX, cdBarY, cdBarWidth, cdBarHeight, 4);
            ctx.stroke();
            
            // Add decorative elements at the ends of the bar
            if (cooldownProgress >= 1) {
                // Add small decorative flourishes for ready state
                ctx.strokeStyle = 'rgba(218, 165, 32, 0.8)';
                ctx.lineWidth = 1;
                
                // Left flourish
                ctx.beginPath();
                ctx.moveTo(cdBarX - 10, cdBarY + cdBarHeight/2);
                ctx.lineTo(cdBarX - 5, cdBarY + cdBarHeight/2);
                ctx.stroke();
                
                // Right flourish
                ctx.beginPath();
                ctx.moveTo(cdBarX + cdBarWidth + 5, cdBarY + cdBarHeight/2);
                ctx.lineTo(cdBarX + cdBarWidth + 10, cdBarY + cdBarHeight/2);
                ctx.stroke();
            }
            
            // Text with illuminated manuscript style
            ctx.font = '10px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            
            // Set text color based on state
            ctx.fillStyle = cooldownProgress >= 1 ? '#F0E6D2' : 'rgba(240, 230, 210, 0.8)';
            
            if (cooldownProgress < 1) {
                ctx.fillText('PREPARING SPELL', width/2, cdBarY - 5);
            } else {
                ctx.fillText('SPELL READY', width/2, cdBarY - 5);
            }
        }
    }
}

// Draw mini-map in corner with Renaissance-style design
function drawMiniMap(ctx, gameData, playerId, width, height) {
    const mapSize = 160;
    const margin = 20;
    const mapX = width - mapSize - margin;
    const mapY = height - mapSize - margin;
    
    // Draw an ornate frame with rounded corners
    // Create a decorative background with Renaissance-inspired elements
    const frameWidth = mapSize + 12;
    const frameHeight = mapSize + 12;
    const frameX = mapX - 6;
    const frameY = mapY - 6;
    
    // Draw ornate background frame
    ctx.beginPath();
    ctx.fillStyle = 'rgba(14, 17, 40, 0.8)';
    ctx.roundRect(frameX, frameY, frameWidth, frameHeight, 8);
    ctx.fill();
    
    // Add decorative border inspired by Renaissance manuscript illuminations
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.7)'; // Gold
    ctx.lineWidth = 2;
    ctx.roundRect(frameX + 2, frameY + 2, frameWidth - 4, frameHeight - 4, 6);
    ctx.stroke();
    
    // Draw map background with subtle texture
    // Create a gradient background reminiscent of aged parchment maps
    const mapGradient = ctx.createRadialGradient(
        mapX + mapSize/2, mapY + mapSize/2, 0,
        mapX + mapSize/2, mapY + mapSize/2, mapSize
    );
    
    mapGradient.addColorStop(0, 'rgba(26, 35, 126, 0.7)'); // Center - richer blue
    mapGradient.addColorStop(0.7, 'rgba(21, 27, 84, 0.7)'); // Middle - deep blue
    mapGradient.addColorStop(1, 'rgba(10, 12, 37, 0.7)'); // Edge - dark blue
    
    ctx.fillStyle = mapGradient;
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    
    // Add subtle grid lines reminiscent of Renaissance cartography
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.15)'; // Gold
    ctx.lineWidth = 0.5;
    
    // Grid lines
    const gridSpacing = mapSize / 8;
    
    // Vertical grid lines
    for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(mapX + gridSpacing * i, mapY);
        ctx.lineTo(mapX + gridSpacing * i, mapY + mapSize);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(mapX, mapY + gridSpacing * i);
        ctx.lineTo(mapX + mapSize, mapY + gridSpacing * i);
        ctx.stroke();
    }
    
    // Draw decorative compass rose in bottom right corner
    const compassSize = 20;
    const compassX = mapX + mapSize - compassSize - 5;
    const compassY = mapY + mapSize - compassSize - 5;
    
    ctx.save();
    ctx.translate(compassX, compassY);
    
    // Draw compass circle
    ctx.beginPath();
    ctx.fillStyle = 'rgba(218, 165, 32, 0.2)';
    ctx.arc(0, 0, compassSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw compass points
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.6)';
    ctx.lineWidth = 1;
    
    // North-South line
    ctx.beginPath();
    ctx.moveTo(0, -compassSize * 0.8);
    ctx.lineTo(0, compassSize * 0.8);
    ctx.stroke();
    
    // East-West line
    ctx.beginPath();
    ctx.moveTo(-compassSize * 0.8, 0);
    ctx.lineTo(compassSize * 0.8, 0);
    ctx.stroke();
    
    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(-compassSize * 0.6, -compassSize * 0.6);
    ctx.lineTo(compassSize * 0.6, compassSize * 0.6);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-compassSize * 0.6, compassSize * 0.6);
    ctx.lineTo(compassSize * 0.6, -compassSize * 0.6);
    ctx.stroke();
    
    // North pointer
    ctx.beginPath();
    ctx.fillStyle = 'rgba(218, 165, 32, 0.9)';
    ctx.moveTo(0, -compassSize * 0.8);
    ctx.lineTo(-compassSize * 0.2, -compassSize * 0.5);
    ctx.lineTo(0, -compassSize * 0.6);
    ctx.lineTo(compassSize * 0.2, -compassSize * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Draw "MAPPA MUNDI" in Renaissance-style text at the top
    ctx.font = 'italic 8px serif';
    ctx.fillStyle = 'rgba(218, 165, 32, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('MAPPA MUNDI', mapX + mapSize/2, mapY - 8);
    
    // Scale factor
    const scale = mapSize / MAP_WIDTH;
    
    // Draw all players on mini-map
    if (gameData.players) {
        Object.values(gameData.players).forEach(player => {
            // Calculate position on mini-map
            const miniX = mapX + player.position.x * scale;
            const miniY = mapY + player.position.y * scale;
            
            // For victorious players, draw a special icon reminiscent of Renaissance royal symbols
            if (player.victorious) {
                // Draw star symbol for victorious player
                ctx.save();
                ctx.translate(miniX, miniY);
                
                // Draw ornate star
                const starSize = Math.max(3, player.size * scale * 0.6);
                const spikes = 5;
                
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? starSize : starSize * 0.5;
                    const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                
                ctx.fillStyle = 'rgba(218, 165, 32, 0.9)'; // Gold for victorious players
                ctx.fill();
                
                ctx.restore();
            } else {
                // Draw player dot with a more ornate style
                ctx.beginPath();
                
                // Create a gradient for the dot
                const dotGradient = ctx.createRadialGradient(
                    miniX, miniY, 0,
                    miniX, miniY, Math.max(3, player.size * scale * 0.6)
                );
                
                if (player.id === playerId) {
                    // Current player gets a white dot with gold edge
                    dotGradient.addColorStop(0, 'white');
                    dotGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.7)');
                    dotGradient.addColorStop(1, 'rgba(218, 165, 32, 0.7)');
                } else {
                    // Other players get colored dots with darker edges
                    dotGradient.addColorStop(0, player.color);
                    dotGradient.addColorStop(0.7, player.color);
                    dotGradient.addColorStop(1, darkenColor(player.color, 30));
                }
                
                ctx.fillStyle = dotGradient;
                ctx.arc(miniX, miniY, Math.max(3, player.size * scale * 0.6), 0, Math.PI * 2);
                ctx.fill();
                
                // Add a small highlight to create a 3D effect
                if (player.size * scale > 3) {
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.arc(
                        miniX - Math.max(1, player.size * scale * 0.2), 
                        miniY - Math.max(1, player.size * scale * 0.2), 
                        Math.max(1, player.size * scale * 0.2), 
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        });
    }
    
    // Draw special orbs as small gems on the map
    if (gameData.orbs) {
        gameData.orbs.forEach(orb => {
            if (orb.isSpecial) {
                const orbX = mapX + orb.position.x * scale;
                const orbY = mapY + orb.position.y * scale;
                
                // Draw special orb as a sparkling gem
                ctx.beginPath();
                ctx.fillStyle = 'rgba(218, 165, 32, 0.8)'; // Gold
                
                // Diamond shape
                ctx.moveTo(orbX, orbY - 3);
                ctx.lineTo(orbX + 2, orbY);
                ctx.lineTo(orbX, orbY + 3);
                ctx.lineTo(orbX - 2, orbY);
                ctx.closePath();
                
                ctx.fill();
                
                // Add sparkle
                ctx.beginPath();
                ctx.fillStyle = 'white';
                ctx.arc(orbX - 0.5, orbY - 0.5, 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    // Draw current viewport with a more ornate frame reminiscent of Renaissance map viewports
    const viewportWidth = (width / cameraZoom) * scale;
    const viewportHeight = (height / cameraZoom) * scale;
    const viewportX = mapX + cameraX * scale - viewportWidth/2;
    const viewportY = mapY + cameraY * scale - viewportHeight/2;
    
    // Draw viewport frame with double-line style common in Renaissance maps
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    
    // Add inner stroke for decorative effect
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(viewportX + 2, viewportY + 2, viewportWidth - 4, viewportHeight - 4);
    
    // Add small corner decorations
    const cornerSize = 3;
    ctx.fillStyle = 'rgba(218, 165, 32, 0.8)';
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(viewportX, viewportY);
    ctx.lineTo(viewportX + cornerSize * 2, viewportY);
    ctx.lineTo(viewportX, viewportY + cornerSize * 2);
    ctx.closePath();
    ctx.fill();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(viewportX + viewportWidth, viewportY);
    ctx.lineTo(viewportX + viewportWidth - cornerSize * 2, viewportY);
    ctx.lineTo(viewportX + viewportWidth, viewportY + cornerSize * 2);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(viewportX, viewportY + viewportHeight);
    ctx.lineTo(viewportX + cornerSize * 2, viewportY + viewportHeight);
    ctx.lineTo(viewportX, viewportY + viewportHeight - cornerSize * 2);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(viewportX + viewportWidth, viewportY + viewportHeight);
    ctx.lineTo(viewportX + viewportWidth - cornerSize * 2, viewportY + viewportHeight);
    ctx.lineTo(viewportX + viewportWidth, viewportY + viewportHeight - cornerSize * 2);
    ctx.closePath();
    ctx.fill();
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
        0x1000000 + 
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
        0x1000000 + 
        (R > 0 ? R : 0) * 0x10000 + 
        (G > 0 ? G : 0) * 0x100 + 
        (B > 0 ? B : 0)
    ).toString(16).slice(1);
}

function detectOrbCollections(orbs) {
    // Create a set of current orb IDs
    const currentOrbIds = new Set(orbs.map(orb => orb.id));
    
    // Check for missing orbs (collected)
    for (const id in lastOrbPositions) {
        if (!currentOrbIds.has(id)) {
            // This orb was collected, create particle effect
            const pos = lastOrbPositions[id];
            createOrbCollectEffect(pos.x, pos.y, pos.isSpecial);
            delete lastOrbPositions[id];
        }
    }
    
    // Update last positions
    orbs.forEach(orb => {
        lastOrbPositions[orb.id] = { 
            x: orb.position.x, 
            y: orb.position.y,
            isSpecial: orb.isSpecial 
        };
    });
}

function updateLeaderboard(players) {
    const leaderboardList = document.getElementById('leaderboardList');
    
    // Sort players by size (larger first)
    const sortedPlayers = Object.values(players).sort((a, b) => b.size - a.size);
    
    // Create HTML
    let html = '';
    sortedPlayers.slice(0, 10).forEach((player, index) => {
        html += `
            <div class="leaderboardItem">
                <span class="leaderboardName" style="color: ${player.color}">${index + 1}. ${player.name || 'Wizard ' + player.id.slice(-4)}</span>
                <span class="leaderboardScore">${Math.floor(player.size)}</span>
            </div>
        `;
    });
    
    leaderboardList.innerHTML = html;
}

// Export functions as ES modules
export { 
    initRenderer, 
    render, 
    createOrbCollectEffect, 
    createVictoryEffect, 
    updateLeaderboard 
};