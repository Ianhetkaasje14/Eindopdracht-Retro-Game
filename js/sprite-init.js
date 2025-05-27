/**
 * Initialize game sprites by loading images and creating sprite objects
 */
async function initSprites() {
    // List of image assets to load
    const imageAssets = {
        images: {
            player: 'assets/sprites/player.png',
            enemy: 'assets/sprites/enemy.png',
            coin: 'assets/sprites/coin.png',
            platform: 'assets/sprites/platform.png'
        }
    };

    // Set up loading progress callback
    assetLoader.onProgress = (progress) => {
        gameState.loading.progress = progress;
    };

    try {
        // Load all images
        const loadedAssets = await assetLoader.loadAssets(imageAssets);
        gameState.assets.images = loadedAssets.images;

        // Create player sprite if image loaded successfully
        if (gameState.assets.images.player) {
            gameState.player.sprite = new Sprite({
                position: { x: gameState.player.x, y: gameState.player.y },
                size: { width: gameState.player.width, height: gameState.player.height },
                image: gameState.assets.images.player,
                frames: { max: 4, current: 0, elapsed: 0, hold: 10 }
            });
        }

        // Loading complete
        gameState.loading.complete = true;
    } catch (error) {
        // Set loading as complete even if there was an error
        gameState.loading.complete = true;
    }
}
