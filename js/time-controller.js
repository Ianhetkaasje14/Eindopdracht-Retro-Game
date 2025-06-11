
gameState.time = {
    lastUpdate: 0,
    delta: 0,
    fps: 60,
    frameTime: 1000 / 60
};

/**
 * Main game loop using requestAnimationFrame
 * This provides smoother animation than setInterval
 */
function frameRateControlledGameLoop(timestamp) {
    // Don't update if game is not in playing state
    if (!gameState.gameStarted || gameState.gameOver || gameState.gamePaused) {
        return;
    }

    // Initialize lastUpdate on first call
    if (!gameState.time.lastUpdate) {
        gameState.time.lastUpdate = timestamp;
    }

    // Calculate time passed since last frame in seconds
    gameState.time.delta = (timestamp - gameState.time.lastUpdate) / 1000;

    // Cap delta to prevent huge jumps if game was in background
    if (gameState.time.delta > 0.2) gameState.time.delta = 0.2;

    // Update game state with time delta
    updateWithDelta(gameState.time.delta);

    // Draw the current game state
    draw();

    // Store current time for next frame
    gameState.time.lastUpdate = timestamp;

    // Request next animation frame
    requestAnimationFrame(frameRateControlledGameLoop);
}

/**
 * Restart the game by reloading the page
 * This ensures a clean state for all variables
 */
function restartGameWithTimeReset() {
    window.location.reload();
}

/**
 * Update game physics based on time delta
 * This makes movement consistent regardless of frame rate
 */
function updateWithDelta(delta) {
    // Don't update anything if game is paused
    if (gameState.gamePaused) {
        return;
    }
    
    // Player movement based on keyboard input
    if (keys.right) {
        gameState.player.velocityX += gameState.player.speed * delta;
    }
    if (keys.left) {
        gameState.player.velocityX -= gameState.player.speed * delta;
    }

    // Apply physics: friction and gravity
    gameState.player.velocityX *= Math.pow(gameState.friction, delta * 80);
    gameState.player.velocityY += gameState.gravity * delta * 80;

    // Update player position based on velocity
    gameState.player.x += gameState.player.velocityX * delta * 450;
    gameState.player.y += gameState.player.velocityY * delta * 80;

    // Keep player within level boundaries
    if (gameState.player.x < 0) gameState.player.x = 0;
    if (gameState.player.x + gameState.player.width > gameState.level.width) {
        gameState.player.x = gameState.level.width - gameState.player.width;
    }

    // Update camera position to follow player
    gameState.camera.x = gameState.player.x - canvas.width / 2 + gameState.player.width / 2;

    // Keep camera within level boundaries
    if (gameState.camera.x < 0) gameState.camera.x = 0;
    if (gameState.camera.x > gameState.level.width - canvas.width) {
        gameState.camera.x = gameState.level.width - canvas.width;
    }

    // Update enemy positions
    for (let enemy of gameState.enemies) {
        enemy.x += enemy.velocityX * delta * 60;

        // Make enemies patrol back and forth
        if (enemy.x > enemy.startX + enemy.range || enemy.x < enemy.startX - enemy.range) {
            enemy.velocityX = -enemy.velocityX;
        }
    }

    // Check for collisions with platforms, coins, and enemies
    checkCollisions();
}
