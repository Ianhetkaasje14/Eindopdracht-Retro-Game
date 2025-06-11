/**
 * Time-based animation controller for the game
 * This ensures consistent movement regardless of frame rate
 */

// Add time properties to the game state
gameState.time = {
  lastUpdate: 0, // Time of the last update
  delta: 0, // Time since last frame in seconds
  fps: 60, // Target frame rate
  frameTime: 1000 / 60, // Target time for one frame in milliseconds (60fps)
};

// Add debug info to gameState
gameState.debug = {
    frameRate: 0,
    deltaTime: 0,
    physicsSteps: 0
};

/**
 * Main game loop using requestAnimationFrame
 * This provides smoother animation than setInterval
 */
function frameRateControlledGameLoop(timestamp) {
  // Don't update if game is not in playing state
  if (!gameState.gameStarted || gameState.gameOver || gameState.gamePaused) {
    requestAnimationFrame(frameRateControlledGameLoop);
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

  // Update debug info
  gameState.debug.deltaTime = gameState.time.delta;
  gameState.debug.frameRate = gameState.time.delta > 0 ? Math.round(1 / gameState.time.delta) : 0;

  // Update game state with time delta
  updateWithDelta(gameState.time.delta);

  // Draw the current game state
  draw();

  // Store current time for next frame
  gameState.time.lastUpdate = timestamp;

  // Request next animation frame (let browser handle frame rate)
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

  // Cap delta to prevent physics instability at low frame rates
  const maxDelta = 1/30; // Limit to 30fps minimum
  const actualDelta = Math.min(delta, maxDelta);
  
  // If delta is too large, subdivide the physics update
  const maxPhysicsStep = 1/60; // Maximum physics step size
  let remainingDelta = actualDelta;
  
  // Reset physics steps counter
  gameState.debug.physicsSteps = 0;
  
  while (remainingDelta > 0) {
    const stepDelta = Math.min(remainingDelta, maxPhysicsStep);
    updatePhysicsStep(stepDelta);
    remainingDelta -= stepDelta;

    // Increment physics steps counter
    gameState.debug.physicsSteps++;
  }

  // Update enemy positions (can use larger steps since they don't need precise collision)
  for (let enemy of gameState.enemies) {
    enemy.x += enemy.velocityX * actualDelta * 60;

    // Make enemies patrol back and forth
    if (
      enemy.x > enemy.startX + enemy.range ||
      enemy.x < enemy.startX - enemy.range
    ) {
      enemy.velocityX = -enemy.velocityX;
    }
  }
}

/**
 * Update physics for a single small time step
 * This prevents tunneling through platforms at low frame rates
 */
function updatePhysicsStep(delta) {
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

  // Store previous position for collision rollback if needed
  const prevX = gameState.player.x;
  const prevY = gameState.player.y;

  // Update player position based on velocity (reduced multipliers for stability)
  gameState.player.x += gameState.player.velocityX * delta * 300; // Reduced from 450
  gameState.player.y += gameState.player.velocityY * delta * 60;  // Reduced from 80

  // Keep player within level boundaries
  if (gameState.player.x < 0) gameState.player.x = 0;
  if (gameState.player.x + gameState.player.width > gameState.level.width) {
    gameState.player.x = gameState.level.width - gameState.player.width;
  }

  // Update camera position to follow player
  gameState.camera.x =
    gameState.player.x - canvas.width / 2 + gameState.player.width / 2;

  // Keep camera within level boundaries
  if (gameState.camera.x < 0) gameState.camera.x = 0;
  if (gameState.camera.x > gameState.level.width - canvas.width) {
    gameState.camera.x = gameState.level.width - canvas.width;
  }

  // Check for collisions with platforms, coins, and enemies
  checkCollisions();
}
