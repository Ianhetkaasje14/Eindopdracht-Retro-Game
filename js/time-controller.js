
gameState.time = {
    lastUpdate: 0,
    delta: 0,
    fps: 60,
    frameTime: 1000 / 60
};

function frameRateControlledGameLoop(timestamp) {
    if (!gameState.gameStarted || gameState.gameOver || gameState.gamePaused) {
        return;
    }

    if (!gameState.time.lastUpdate) {
        gameState.time.lastUpdate = timestamp;
    }

    gameState.time.delta = (timestamp - gameState.time.lastUpdate) / 1000;

    if (gameState.time.delta > 0.2) gameState.time.delta = 0.2;

    updateWithDelta(gameState.time.delta);

    draw();

    gameState.time.lastUpdate = timestamp;

    requestAnimationFrame(frameRateControlledGameLoop);
}

function restartGameWithTimeReset() {
    window.location.reload();
}

function updateWithDelta(delta) {
    if (gameState.gamePaused) {
        return;
    }
    
    if (keys.right) {
        gameState.player.velocityX += gameState.player.speed * delta;
    }
    if (keys.left) {
        gameState.player.velocityX -= gameState.player.speed * delta;
    }

    gameState.player.velocityX *= Math.pow(gameState.friction, delta * 80);
    gameState.player.velocityY += gameState.gravity * delta * 80;

    gameState.player.x += gameState.player.velocityX * delta * 450;
    gameState.player.y += gameState.player.velocityY * delta * 80;

    if (gameState.player.x < 0) gameState.player.x = 0;
    if (gameState.player.x + gameState.player.width > gameState.level.width) {
        gameState.player.x = gameState.level.width - gameState.player.width;
    }

    gameState.camera.x = gameState.player.x - canvas.width / 2 + gameState.player.width / 2;

    if (gameState.camera.x < 0) gameState.camera.x = 0;
    if (gameState.camera.x > gameState.level.width - canvas.width) {
        gameState.camera.x = gameState.level.width - canvas.width;
    }

    for (let enemy of gameState.enemies) {
        enemy.x += enemy.velocityX * delta * 60;

        if (enemy.x > enemy.startX + enemy.range || enemy.x < enemy.startX - enemy.range) {
            enemy.velocityX = -enemy.velocityX;
        }
    }

    checkCollisions();
}
