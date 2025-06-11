/**
 * Initialize game sprites by loading images and creating sprite objects
 */
async function initSprites() {    // List of image assets to load
    const imageAssets = {
        images: {
            player: 'assets/sprites/duckie.png',
            enemy: 'assets/sprites/enemy.png',
            coin: 'assets/sprites/coin.png',
            platform: 'assets/sprites/platform.png'
        }
    };

    // Set up loading progress callback
    assetLoader.onProgress = (progress) => {
        gameState.loading.progress = progress;
    };

    try {        // Load all images
        const loadedAssets = await assetLoader.loadAssets(imageAssets);
        gameState.assets.images = loadedAssets.images;        // Create player sprite if image loaded successfully
        if (gameState.assets.images.player) {
            const duckieImage = gameState.assets.images.player;
            
            // Configure for 4x4 sprite sheet
            const gridRows = 4;
            const gridCols = 4;
            const frameWidth = duckieImage.width / gridCols;
            const frameHeight = duckieImage.height / gridRows;
            
            // Use only the first row for walking animation (4 frames)
            const walkingFrames = 4; // First row of the sprite sheet
            
            // Adjust player dimensions to match individual frame size
            gameState.player.width = frameWidth;
            gameState.player.height = frameHeight;
            
            console.log('Duckie 4x4 sprite setup:', {
                totalWidth: duckieImage.width,
                totalHeight: duckieImage.height,
                gridRows: gridRows,
                gridCols: gridCols,
                frameWidth: frameWidth,
                frameHeight: frameHeight,
                walkingFrames: walkingFrames,
                playerSize: { width: gameState.player.width, height: gameState.player.height }
            });
              gameState.player.sprite = new Sprite({
                position: { x: gameState.player.x, y: gameState.player.y },
                size: { width: gameState.player.width, height: gameState.player.height },
                image: duckieImage,
                frames: { max: walkingFrames, current: 0, elapsed: 0, hold: 8 },
                grid: { rows: gridRows, cols: gridCols },
                animationRow: 0  // Use first row for walking animation
            });
        }

        // Update all existing coins with sprites if they don't have them
        updateCoinSprites();

        // Loading complete
        gameState.loading.complete = true;
    } catch (error) {
        console.error('Error loading sprites:', error);
        // Set loading as complete even if there was an error
        gameState.loading.complete = true;
    }
}

/**
 * Update existing coins with sprites if coin image is loaded
 */
function updateCoinSprites() {
    if (gameState.assets.images && gameState.assets.images.coin) {
        for (let coin of gameState.coins) {
            if (!coin.sprite) {
                coin.sprite = new Sprite({
                    position: { x: coin.x, y: coin.y },
                    size: { width: coin.width, height: coin.height },
                    image: gameState.assets.images.coin,
                    frames: { max: 1, current: 0, elapsed: 0, hold: 0 }  // No animation
                });
            }
        }
    }
}
