
/**
 * Retro Jumper - A 2D platformer game
 * 
 * This file contains the main game logic including:
 * - Game state management
 * - Player controls
 * - Game objects (platforms, coins, enemies)
 * - Collision detection
 * - Game loop
 */

/**
 * Main gameState object - Stores all game data
 * This is the central object that keeps track of the entire game state
 */
const gameState = {
    // Player properties
    player: {
        x: 50,                // X position
        y: 0,                 // Y position
        width: 32,            // Width of player
        height: 32,           // Height of player
        velocityX: 0,         // Horizontal velocity
        velocityY: 0,         // Vertical velocity
        speed: 9,             // Movement speed
        jumpPower: 12,        // Jump strength
        isJumping: false,     // Is player currently in the air?
        lives: 3,             // Number of lives
        color: "#FF0000",     // Fallback color if sprite fails to load
        sprite: null          // Will hold the player sprite object
    },

    // Game object collections
    coins: [],                // Array of coin objects
    enemies: [],              // Array of enemy objects
    platforms: [],            // Array of platform objects

    // Physics constants
    gravity: 0.5,             // Gravity pulling player down
    friction: 0.8,            // Friction slowing player down

    // Game state flags
    score: 0,                 // Player's score (coins collected)
    gameOver: false,          // Is the game over?
    gameStarted: false,       // Has the game started?
    gamePaused: false,        // Is the game paused?

    // Level properties
    level: {
        width: 2400,          // Total level width
        height: 600           // Level height
    },

    // Camera for scrolling
    camera: {
        x: 0,                 // Camera X offset
        y: 0                  // Camera Y offset
    },

    // Asset containers
    assets: {
        images: {},           // Stores loaded images
        sounds: {}            // Stores loaded sounds
    },

    // Loading state
    loading: {
        progress: 0,          // Loading progress (0-1)
        complete: false       // Is loading complete?
    }
};

/**
 * Input state - Tracks which keys are currently pressed
 */
const keys = {
    right: false,    // Right arrow key
    left: false,     // Left arrow key
    up: false        // Up arrow key or space
};

/**
 * DOM element references - Get all HTML elements needed for the game
 */
// Main game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI screens
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('final-score');

// Create the asset loader object for loading game resources
const assetLoader = new AssetLoader();

/**
 * Set up event listeners for player input
 */
// Keyboard controls
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Button clicks
startButton.addEventListener('click', startGame);
// Note: restartButton event listener is set up in window.onload

/**
 * Load game sounds asynchronously
 * Uses Promise-based asset loading system
 */
async function initSounds() {
    // Define sound files to load
    const soundAssets = {
        sounds: {
            jump: 'assets/sounds/jump.wav',
            coin: 'assets/sounds/coin.wav',
            hurt: 'assets/sounds/hurt.wav',
            gameOver: 'assets/sounds/gameover.wav',
            background: 'assets/sounds/background.wav'
        }
    };

    // Update loading progress as sounds are loaded
    assetLoader.onProgress = (progress) => {
        gameState.loading.progress = progress;
    };

    try {
        // Wait for all sounds to load
        const loadedAssets = await assetLoader.loadAssets(soundAssets);
        gameState.assets.sounds = loadedAssets.sounds;

        // Configure background music
        if (gameState.assets.sounds.background) {
            gameState.assets.sounds.background.loop = true;
            gameState.assets.sounds.background.volume = 0.5;

            // Try to play background music (may be blocked by browser)
            gameState.assets.sounds.background.play().catch(error => {
                alert("Click on the game to enable sounds!");
            });
        }
    } catch (error) {
        // Silently handle sound loading errors
        // Game can still function without sound
    }
}

/**
 * Play a sound effect by name
 * Uses sound cloning to allow overlapping sounds
 * 
 * @param {string} soundName - Name of the sound to play
 */
function playSound(soundName) {
    const sound = gameState.assets.sounds[soundName];
    if (sound) {
        // Clone the sound to allow multiple instances
        sound.cloneNode().play().catch(() => {
            // Silently handle play errors
        });
    }
}

/**
 * Initialize the game level by creating platforms, coins, and enemies
 * This function sets up the entire playable level
 */
function initLevel() {
    // Create ground platforms
    gameState.platforms.push({
        x: 0,
        y: 550,
        width: 800,
        height: 50,
        color: "#8B4513"
    });

    // Create a series of jumping platforms
    // Each platform is positioned to create an interesting level layout
    const platformPositions = [
        { x: 200, y: 450, w: 100, h: 20 },
        { x: 400, y: 400, w: 100, h: 20 },
        { x: 600, y: 350, w: 100, h: 20 },
        { x: 800, y: 300, w: 100, h: 20 },
        { x: 1000, y: 350, w: 100, h: 20 },
        { x: 1200, y: 400, w: 100, h: 20 },
        { x: 1400, y: 350, w: 200, h: 20 },
        { x: 1700, y: 450, w: 100, h: 20 },
        { x: 1900, y: 400, w: 150, h: 20 }
    ];

    // Add all platforms to the game
    platformPositions.forEach(plat => {
        gameState.platforms.push({
            x: plat.x,
            y: plat.y,
            width: plat.w,
            height: plat.h,
            color: "#8B4513"
        });
    });

    // Create second ground section
    gameState.platforms.push({
        x: 800,
        y: 550,
        width: 1600,
        height: 50,
        color: "#8B4513"
    });

    // Create goal platform (green)
    gameState.platforms.push({
        x: 2200,
        y: 550,
        width: 200,
        height: 50,
        color: "#00FF00",
        isGoal: true  // Special flag to detect when player reaches the goal
    });    // Create coins for the player to collect
    // Position coins in jumping paths between platforms
    const coinPositions = [
        // Coins above platforms (safe positions)
        { x: 220, y: 420 },  // Above first platform (200, 450)
        { x: 420, y: 370 },  // Above second platform (400, 400)
        { x: 620, y: 320 },  // Above third platform (600, 350)
        { x: 820, y: 270 },  // Above fourth platform (800, 300)
        { x: 1020, y: 320 }, // Above fifth platform (1000, 350)
        { x: 1220, y: 370 }, // Above sixth platform (1200, 400)
        { x: 1500, y: 320 }, // Above large platform center (1400, 350)
        { x: 1720, y: 420 }, // Above eighth platform (1700, 450)
        { x: 1950, y: 370 }, // Above ninth platform (1900, 400)
        
        // Coins in jumping paths between platforms (mid-air positions)
        { x: 120, y: 480 },  // Between start and first platform
        { x: 300, y: 425 },  // Between first and second platform
        { x: 500, y: 375 },  // Between second and third platform
        { x: 700, y: 325 },  // Between third and fourth platform
        { x: 900, y: 325 },  // Between fourth and fifth platform
        { x: 1100, y: 385 }, // Between fifth and sixth platform
        { x: 1300, y: 375 }, // Between sixth and large platform
        { x: 1600, y: 400 }, // On the large platform (right side)
        { x: 1800, y: 400 }, // Between large platform and eighth
        { x: 2050, y: 480 }, // Between ninth platform and goal
        
        // Additional strategic coins for exploration
        { x: 50, y: 450 },   // Early game coin
        { x: 750, y: 280 },  // High coin above fourth platform
        { x: 1450, y: 300 }, // High coin above large platform
        { x: 2100, y: 450 }  // Near goal area
    ];

    for (let i = 0; i < coinPositions.length; i++) {
        const coinPos = coinPositions[i];
        const coin = {
            x: coinPos.x,
            y: coinPos.y,
            width: 20,
            height: 20,
            color: "#FFD700",                       // Gold color as fallback
            collected: false                        // Track if coin is collected
        };

        // Assign a sprite if coin image is loaded (no animation)
        if (gameState.assets.images && gameState.assets.images.coin) {
            coin.sprite = new Sprite({
                position: { x: coin.x, y: coin.y },
                size: { width: coin.width, height: coin.height },
                image: gameState.assets.images.coin,
                frames: { max: 1, current: 0, elapsed: 0, hold: 0 }  // No animation
            });
        }

        gameState.coins.push(coin);
    }

    // Create enemies
    for (let i = 0; i < 10; i++) {
        // Create enemy at regular intervals
        const enemy = {
            x: 300 + i * 200,                      // Position enemies horizontally
            y: 520,                                // Position just above ground
            width: 30,
            height: 30,
            velocityX: 2 * (Math.random() > 0.5 ? 1 : -1),  // Random direction
            color: "#0000FF",                      // Blue color as fallback
            range: 100,                            // Patrol range
            startX: 300 + i * 200                  // Starting position for patrol
        };

        // Assign a sprite if enemy image is loaded
        if (gameState.assets.images && gameState.assets.images.enemy) {
            enemy.sprite = new Sprite({
                position: { x: enemy.x, y: enemy.y },
                size: { width: enemy.width, height: enemy.height },
                image: gameState.assets.images.enemy,
                frames: { max: 2, current: 0, elapsed: 0, hold: 20 }  // Animation frames
            });
        }

        gameState.enemies.push(enemy);
    }
}

/**
 * Handle keydown events
 * This is called whenever a key is pressed
 * 
 * @param {KeyboardEvent} e - The keyboard event
 */
function keyDown(e) {
    // P or Escape - toggle pause (should work even when paused, but not when game is over)
    if (e.key === 'p' || e.key === 'Escape') {
        // Only allow pausing if game has started and is not over
        if (gameState.gameStarted && !gameState.gameOver) {
            togglePause();
        }
        e.preventDefault(); // Prevent browser escape actions
        return; // Exit early to prevent other input processing
    }

    // Only process other input when the game is active and not paused
    if (gameState.gameStarted && !gameState.gameOver && !gameState.gamePaused) {
        // Right arrow - move right
        if (e.key === 'ArrowRight') {
            keys.right = true;
            e.preventDefault(); // Prevent browser scrolling
        }

        // Left arrow - move left
        if (e.key === 'ArrowLeft') {
            keys.left = true;
            e.preventDefault(); // Prevent browser scrolling
        }

        // Up arrow or space - jump (only if not already jumping)
        if ((e.key === 'ArrowUp' || e.key === ' ') && !gameState.player.isJumping) {
            keys.up = true;
            gameState.player.isJumping = true;
            gameState.player.velocityY = -gameState.player.jumpPower;
            playSound('jump');
            e.preventDefault(); // Prevent browser scrolling/space bar actions
        }
    }
}

/**
 * Handle keyup events
 * This is called whenever a key is released
 * 
 * @param {KeyboardEvent} e - The keyboard event
 */
function keyUp(e) {
    // Update key states when keys are released
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowUp' || e.key === ' ') keys.up = false;

    e.preventDefault(); // Prevent default browser behavior
}

/**
 * Toggle the game's paused state
 * Shows/hides the pause screen and stops/resumes the game loop
 */
function togglePause() {
    // Toggle pause state
    gameState.gamePaused = !gameState.gamePaused;

    // Show or hide the pause screen
    const pauseScreen = document.getElementById('pause-screen');
    if (pauseScreen) {
        pauseScreen.style.display = gameState.gamePaused ? 'flex' : 'none';
    }    // Restart the game loop if unpausing
    if (!gameState.gamePaused) {
        // Set flag to skip collision detection on first frame after unpause
        gameState.justUnpaused = true;
        
        // Reset time tracking to prevent large delta jumps when resuming
        if (gameState.time) {
            gameState.time.lastUpdate = null;
        }
        
        // Small delay before resuming to ensure pause state is fully cleared
        setTimeout(() => {
            gameLoop();
        }, 16); // One frame delay (roughly 16ms at 60fps)
    }
}

/**
 * Start the game
 * Initializes the game state and begins the game loop
 */
async function startGame() {
    // Hide start screen and show loading screen
    startScreen.style.display = 'none';
    document.getElementById('loading-screen').style.display = 'flex';

    // Set up loading progress bar
    const progressBar = document.getElementById('loading-progress');
    assetLoader.onProgress = (progress) => {
        gameState.loading.progress = progress;
        progressBar.style.width = `${progress * 100}%`;
    };

    // Wait for all assets to load first (both sounds and sprites)
    await Promise.all([initSounds(), initSprites()]);

    // Initialize game components after assets are loaded
    initLevel();

    // Hide loading screen
    document.getElementById('loading-screen').style.display = 'none';

    // Start the game
    gameState.gameStarted = true;
    gameLoop();
}

/**
 * Restart the game
 * Uses the time controller's restart function
 */
function restartGame() {
    restartGameWithTimeReset();
}

/**
 * Check for collisions between the player and other game objects
 * Handles platform landing, coin collection, and enemy hits
 */
function checkCollisions() {
    // Don't check collisions if game is paused
    if (gameState.gamePaused) {
        return;
    }
    
    // Additional safety: Skip collision detection for one frame after unpausing
    // This prevents false collisions when resuming
    if (gameState.justUnpaused) {
        gameState.justUnpaused = false;
        return;
    }
    
    // Track if player is standing on a platform
    let onPlatform = false;

    // Check collisions with all platforms
    for (let platform of gameState.platforms) {
        // Check if player is on top of platform
        if (
            // Horizontal collision detection
            gameState.player.x < platform.x + platform.width &&
            gameState.player.x + gameState.player.width > platform.x &&
            // Vertical collision detection - only count if player is falling onto platform
            gameState.player.y + gameState.player.height >= platform.y &&
            gameState.player.y + gameState.player.height <= platform.y + platform.height / 2 &&
            gameState.player.velocityY >= 0
        ) {
            // Position player on top of platform
            gameState.player.y = platform.y - gameState.player.height;
            gameState.player.velocityY = 0;
            gameState.player.isJumping = false;
            onPlatform = true;

            // Check if this platform is the goal
            if (platform.isGoal) {
                gameWin();
            }
        }
    }

    // If not on any platform, player is jumping/falling
    if (!onPlatform) {
        gameState.player.isJumping = true;
    }

    // Check collision with coins
    for (let coin of gameState.coins) {
        // Only check uncollected coins
        if (
            !coin.collected &&
            // Standard AABB collision detection
            gameState.player.x < coin.x + coin.width &&
            gameState.player.x + gameState.player.width > coin.x &&
            gameState.player.y < coin.y + coin.height &&
            gameState.player.y + gameState.player.height > coin.y
        ) {
            // Mark coin as collected
            coin.collected = true;

            // Increase score
            gameState.score += 1;

            // Play coin collection sound
            playSound('coin');

            // Update UI to show new score
            updateUI();
        }
    }

    // Check collision with enemies
    for (let enemy of gameState.enemies) {
        if (
            // Standard AABB collision detection
            gameState.player.x < enemy.x + enemy.width &&
            gameState.player.x + gameState.player.width > enemy.x &&
            gameState.player.y < enemy.y + enemy.height &&
            gameState.player.y + gameState.player.height > enemy.y
        ) {
            // Player hit an enemy
            hurtPlayer();
        }
    }

    // Check if player fell off the bottom of the screen
    if (gameState.player.y > canvas.height) {
        hurtPlayer();
        gameState.player.y = 0; // Reset position to top
    }
}

/**
 * Handle player taking damage
 * Reduces lives and resets position or triggers game over
 */
function hurtPlayer() {
    // Reduce player lives
    gameState.player.lives--;

    // Play hurt sound
    playSound('hurt');

    // Update lives display
    updateUI();

    // Check if player is out of lives
    if (gameState.player.lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        gameState.player.x = 50;
        gameState.player.y = 0;
        gameState.player.velocityX = 0;
        gameState.player.velocityY = 0;
        gameState.camera.x = 0;
    }
}

/**
 * End the game when the player loses
 */
function gameOver() {
    // Set game over state
    gameState.gameOver = true;

    // Play game over sound
    playSound('gameOver');

    // Update the heading to show "Game Over"
    const gameOverHeading = document.querySelector('#game-over-screen h1');
    if (gameOverHeading) {
        gameOverHeading.textContent = 'Game Over';
    }

    // Update final score display
    finalScoreElement.textContent = `You collected ${gameState.score} coins`;

    // Show game over screen
    gameOverScreen.style.display = 'flex';
}

/**
 * End the game when the player wins
 */
function gameWin() {
    // Set game over state (win is a type of game end)
    gameState.gameOver = true;

    // Update the heading to show "You Win!"
    const gameOverHeading = document.querySelector('#game-over-screen h1');
    if (gameOverHeading) {
        gameOverHeading.textContent = 'You Win!';
    }

    // Update final score with win message
    finalScoreElement.textContent = `You collected ${gameState.score} coins`;

    // Show game over screen
    gameOverScreen.style.display = 'flex';
}

/**
 * Draw the game state to the canvas
 * Renders all game objects in their current positions
 */
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky background
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save the current transformation state
    ctx.save();

    // Apply camera transformation
    ctx.translate(-gameState.camera.x, 0);

    // Draw platforms
    for (let platform of gameState.platforms) {
        if (gameState.assets.images.platform) {
            // Create a repeating pattern from the platform image
            const pattern = ctx.createPattern(gameState.assets.images.platform, 'repeat');
            ctx.fillStyle = pattern;
        } else {
            // Fallback to color if image not available
            ctx.fillStyle = platform.color;
        }

        // Draw the platform
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw coins (only if not collected)
    for (let coin of gameState.coins) {
        if (!coin.collected) {
            if (gameState.assets.images.coin && coin.sprite) {
                // Update sprite position
                coin.sprite.position.x = coin.x;
                coin.sprite.position.y = coin.y;

                // Draw sprite
                coin.sprite.draw(ctx);
            } else {
                // Fallback to drawing a circle if sprite not available
                ctx.fillStyle = coin.color;
                ctx.beginPath();
                ctx.arc(
                    coin.x + coin.width / 2,
                    coin.y + coin.height / 2,
                    coin.width / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }

    // Draw enemies
    for (let enemy of gameState.enemies) {
        if (gameState.assets.images.enemy && enemy.sprite) {
            // Update sprite position
            enemy.sprite.position.x = enemy.x;
            enemy.sprite.position.y = enemy.y;

            // Set sprite direction based on movement
            enemy.sprite.direction = enemy.velocityX > 0 ? 1 : -1;

            // Draw sprite
            enemy.sprite.draw(ctx);
        } else {
            // Fallback to rectangle if sprite not available
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    }

    // Draw player
    if (gameState.player.sprite) {
        // Update sprite position
        gameState.player.sprite.position.x = gameState.player.x;
        gameState.player.sprite.position.y = gameState.player.y;

        // Update sprite direction based on player movement
        if (gameState.player.velocityX > 0.1) {
            gameState.player.sprite.direction = 1;  // Moving right
        } else if (gameState.player.velocityX < -0.1) {
            gameState.player.sprite.direction = -1; // Moving left
        }

        // Only animate if player is moving horizontally
        if (Math.abs(gameState.player.velocityX) > 0.1) {
            gameState.player.sprite.frames.elapsed++;
        } else {
            // Reset to first frame when standing still
            gameState.player.sprite.frames.current = 0;
        }

        // Draw player sprite
        gameState.player.sprite.draw(ctx);
    } else {
        // Fallback to rectangle if sprite not available
        ctx.fillStyle = gameState.player.color;
        ctx.fillRect(
            gameState.player.x,
            gameState.player.y,
            gameState.player.width,
            gameState.player.height
        );
    }

    // Restore the original transformation state
    ctx.restore();
}

/**
 * Update the game UI elements
 * Updates score and lives display
 */
function updateUI() {
    scoreElement.textContent = `Coins: ${gameState.score}`;
    livesElement.textContent = `Lives: ${gameState.player.lives}`;
}

/**
 * Starts the game loop
 * The actual loop is controlled by the time controller
 */
function gameLoop() {
    requestAnimationFrame(frameRateControlledGameLoop);
}

/**
 * Initialize the game when the window loads
 */
window.onload = function () {
    // Initialize error handling
    initErrorHandling();    // Set up pause screen buttons
    const resumeButton = document.getElementById('resume-button');
    const restartFromPauseButton = document.getElementById('restart-from-pause-button');
    
    // Set up game over screen button
    const restartButton = document.getElementById('restart-button');

    // Add event listeners to pause screen buttons
    if (resumeButton) {
        resumeButton.addEventListener('click', togglePause);
    }

    if (restartFromPauseButton) {
        restartFromPauseButton.addEventListener('click', restartGameWithTimeReset);
    }
      // Add event listener to game over screen button
    if (restartButton) {
        restartButton.addEventListener('click', restartGameWithTimeReset);
    }

    // Auto-pause when changing tabs or losing window focus
    document.addEventListener('visibilitychange', function() {
        // Only auto-pause if game is running (not already paused, not game over, and game started)
        if (gameState.gameStarted && !gameState.gameOver && !gameState.gamePaused && document.hidden) {
            togglePause();
        }
    });

    // Additional fallback for older browsers or window focus events
    window.addEventListener('blur', function() {
        // Only auto-pause if game is running
        if (gameState.gameStarted && !gameState.gameOver && !gameState.gamePaused) {
            togglePause();
        }
    });

    // Make sure the game captures keyboard events
    window.addEventListener('click', function () {
        canvas.focus();
    });

    // Prevent arrow keys from scrolling the page
    window.addEventListener('keydown', function (e) {
        // Check for arrow keys and space
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
};
