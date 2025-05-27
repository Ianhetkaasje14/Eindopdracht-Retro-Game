
const gameState = {
    player: {
        x: 50,
        y: 0,
        width: 32,
        height: 32,
        velocityX: 0,
        velocityY: 0,
        speed: 9,
        jumpPower: 12,
        isJumping: false,
        lives: 3,
        color: "#FF0000",
        sprite: null
    },
    coins: [],
    enemies: [],
    platforms: [],
    gravity: 0.5,
    friction: 0.8,
    score: 0,
    gameOver: false,
    gameStarted: false,
    gamePaused: false,
    level: {
        width: 2400,
        height: 600
    },
    camera: {
        x: 0,
        y: 0
    },
    assets: {
        images: {},
        sounds: {}
    },
    loading: {
        progress: 0,
        complete: false
    }
};

const keys = {
    right: false,
    left: false,
    up: false
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('final-score');

const assetLoader = new AssetLoader();

// Add event listeners for keyboard controls
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGameWithTimeReset);

async function initSounds() {
    const soundAssets = {
        sounds: {
            jump: 'assets/sounds/jump.wav',
            coin: 'assets/sounds/coin.wav',
            hurt: 'assets/sounds/hurt.wav',
            gameOver: 'assets/sounds/gameover.wav',
            background: 'assets/sounds/background.wav'
        }
    };

    assetLoader.onProgress = (progress) => {
        gameState.loading.progress = progress;
    };

    try {
        const loadedAssets = await assetLoader.loadAssets(soundAssets);
        gameState.assets.sounds = loadedAssets.sounds;

        if (gameState.assets.sounds.background) {
            gameState.assets.sounds.background.loop = true;
            gameState.assets.sounds.background.volume = 0.5;

            gameState.assets.sounds.background.play().catch(error => {
                alert("Click on the game to enable sounds!");
            });
        }
    } catch (error) {

    }
}

function playSound(soundName) {
    const sound = gameState.assets.sounds[soundName];
    if (sound) {
        sound.cloneNode().play().catch(() => { });
    }
}

function initLevel() {
    gameState.platforms.push({
        x: 0,
        y: 550,
        width: 800,
        height: 50,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 200,
        y: 450,
        width: 100,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 400,
        y: 400,
        width: 100,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 600,
        y: 350,
        width: 100,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 800,
        y: 300,
        width: 100,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 1000,
        y: 350,
        width: 100,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 1200,
        y: 400,
        width: 100,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 1400,
        y: 350,
        width: 200,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 1700,
        y: 450,
        width: 100,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 1900,
        y: 400,
        width: 150,
        height: 20,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 800,
        y: 550,
        width: 1600,
        height: 50,
        color: "#8B4513"
    });

    gameState.platforms.push({
        x: 2200,
        y: 550,
        width: 200,
        height: 50,
        color: "#00FF00",
        isGoal: true
    });

    for (let i = 0; i < 20; i++) {
        const coin = {
            x: 200 + i * 100 + Math.random() * 50,
            y: 300 + Math.random() * 100,
            width: 20,
            height: 20,
            color: "#FFD700",
            collected: false
        };

        if (gameState.assets.images && gameState.assets.images.coin) {
            coin.sprite = new Sprite({
                position: { x: coin.x, y: coin.y },
                size: { width: coin.width, height: coin.height },
                image: gameState.assets.images.coin,
                frames: { max: 4, current: 0, elapsed: 0, hold: 10 }
            });
        }

        gameState.coins.push(coin);
    }

    for (let i = 0; i < 10; i++) {
        const enemy = {
            x: 300 + i * 200,
            y: 520,
            width: 30,
            height: 30,
            velocityX: 2 * (Math.random() > 0.5 ? 1 : -1),
            color: "#0000FF",
            range: 100,
            startX: 300 + i * 200
        };

        if (gameState.assets.images && gameState.assets.images.enemy) {
            enemy.sprite = new Sprite({
                position: { x: enemy.x, y: enemy.y },
                size: { width: enemy.width, height: enemy.height },
                image: gameState.assets.images.enemy,
                frames: { max: 2, current: 0, elapsed: 0, hold: 20 }
            });
        }

        gameState.enemies.push(enemy);
    }
}

function keyDown(e) {
    if (gameState.gameStarted && !gameState.gameOver) {
        if (e.key === 'ArrowRight') {
            keys.right = true;
            e.preventDefault(); // Prevent browser scrolling
        }
        if (e.key === 'ArrowLeft') {
            keys.left = true;
            e.preventDefault(); // Prevent browser scrolling
        }
        if ((e.key === 'ArrowUp' || e.key === ' ') && !gameState.player.isJumping) {
            keys.up = true;
            gameState.player.isJumping = true;
            gameState.player.velocityY = -gameState.player.jumpPower;
            playSound('jump');
            e.preventDefault(); // Prevent browser scrolling/space bar actions
        }

        if (e.key === 'p' || e.key === 'Escape') {
            togglePause();
            e.preventDefault(); // Prevent browser escape actions
        }
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowUp' || e.key === ' ') keys.up = false;
    e.preventDefault(); // Prevent default browser behavior
}

function togglePause() {
    gameState.gamePaused = !gameState.gamePaused;

    const pauseScreen = document.getElementById('pause-screen');
    if (pauseScreen) {
        pauseScreen.style.display = gameState.gamePaused ? 'flex' : 'none';
    }

    if (!gameState.gamePaused) {
        gameLoop();
    }
}

async function startGame() {
    startScreen.style.display = 'none';
    document.getElementById('loading-screen').style.display = 'flex';

    const progressBar = document.getElementById('loading-progress');
    assetLoader.onProgress = (progress) => {
        gameState.loading.progress = progress;
        progressBar.style.width = `${progress * 100}%`;
    };

    initLevel();
    await Promise.all([initSounds(), initSprites()]);

    document.getElementById('loading-screen').style.display = 'none';

    gameState.gameStarted = true;
    gameLoop();
}

function restartGame() {
    restartGameWithTimeReset();
}

function checkCollisions() {
    let onPlatform = false;
    for (let platform of gameState.platforms) {
        if (
            gameState.player.x < platform.x + platform.width &&
            gameState.player.x + gameState.player.width > platform.x &&
            gameState.player.y + gameState.player.height >= platform.y &&
            gameState.player.y + gameState.player.height <= platform.y + platform.height / 2 &&
            gameState.player.velocityY >= 0
        ) {
            gameState.player.y = platform.y - gameState.player.height;
            gameState.player.velocityY = 0;
            gameState.player.isJumping = false;
            onPlatform = true;

            if (platform.isGoal) {
                gameWin();
            }
        }
    }

    if (!onPlatform) {
        gameState.player.isJumping = true;
    }

    for (let coin of gameState.coins) {
        if (
            !coin.collected &&
            gameState.player.x < coin.x + coin.width &&
            gameState.player.x + gameState.player.width > coin.x &&
            gameState.player.y < coin.y + coin.height &&
            gameState.player.y + gameState.player.height > coin.y
        ) {
            coin.collected = true;
            gameState.score += 1;
            playSound('coin');
            updateUI();
        }
    }

    for (let enemy of gameState.enemies) {
        if (
            gameState.player.x < enemy.x + enemy.width &&
            gameState.player.x + gameState.player.width > enemy.x &&
            gameState.player.y < enemy.y + enemy.height &&
            gameState.player.y + gameState.player.height > enemy.y
        ) {
            hurtPlayer();
        }
    }

    if (gameState.player.y > canvas.height) {
        hurtPlayer();
        gameState.player.y = 0;
    }
}

function hurtPlayer() {
    gameState.player.lives--;
    playSound('hurt');
    updateUI();

    if (gameState.player.lives <= 0) {
        gameOver();
    } else {
        gameState.player.x = 50;
        gameState.player.y = 0;
        gameState.player.velocityX = 0;
        gameState.player.velocityY = 0;
        gameState.camera.x = 0;
    }
}

function gameOver() {
    gameState.gameOver = true;
    playSound('gameOver');
    finalScoreElement.textContent = `You collected ${gameState.score} coins`;
    gameOverScreen.style.display = 'flex';
}

function gameWin() {
    gameState.gameOver = true;
    finalScoreElement.textContent = `You won! You collected ${gameState.score} coins`;
    gameOverScreen.style.display = 'flex';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-gameState.camera.x, 0);

    for (let platform of gameState.platforms) {
        if (gameState.assets.images.platform) {
            const pattern = ctx.createPattern(gameState.assets.images.platform, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        } else {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    }

    for (let coin of gameState.coins) {
        if (!coin.collected) {
            if (gameState.assets.images.coin && coin.sprite) {
                coin.sprite.position.x = coin.x;
                coin.sprite.position.y = coin.y;
                coin.sprite.draw(ctx);
            } else {
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

    for (let enemy of gameState.enemies) {
        if (gameState.assets.images.enemy && enemy.sprite) {
            enemy.sprite.position.x = enemy.x;
            enemy.sprite.position.y = enemy.y;
            enemy.sprite.direction = enemy.velocityX > 0 ? 1 : -1;
            enemy.sprite.draw(ctx);
        } else {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    }

    if (gameState.player.sprite) {
        gameState.player.sprite.position.x = gameState.player.x;
        gameState.player.sprite.position.y = gameState.player.y;

        if (gameState.player.velocityX > 0.1) {
            gameState.player.sprite.direction = 1;
        } else if (gameState.player.velocityX < -0.1) {
            gameState.player.sprite.direction = -1;
        }

        if (Math.abs(gameState.player.velocityX) > 0.1) {
            gameState.player.sprite.frames.elapsed++;
        } else {
            gameState.player.sprite.frames.current = 0;
        }

        gameState.player.sprite.draw(ctx);
    } else {
        ctx.fillStyle = gameState.player.color;
        ctx.fillRect(
            gameState.player.x,
            gameState.player.y,
            gameState.player.width,
            gameState.player.height
        );
    }

    ctx.restore();
}

function updateUI() {
    scoreElement.textContent = `Coins: ${gameState.score}`;
    livesElement.textContent = `Lives: ${gameState.player.lives}`;
}

function gameLoop() {
    requestAnimationFrame(frameRateControlledGameLoop);
}

window.onload = function () {
    initErrorHandling();

    const resumeButton = document.getElementById('resume-button');
    const restartFromPauseButton = document.getElementById('restart-from-pause-button');

    if (resumeButton) {
        resumeButton.addEventListener('click', togglePause);
    }

    if (restartFromPauseButton) {
        restartFromPauseButton.addEventListener('click', restartGameWithTimeReset);
    }

    // Make sure the game captures keyboard events
    window.addEventListener('click', function () {
        canvas.focus();
    });

    // Prevent arrow keys from scrolling the page
    window.addEventListener('keydown', function (e) {
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
};
