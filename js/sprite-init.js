async function initSprites() {
    const imageAssets = {
        images: {
            player: 'assets/sprites/player.png',
            enemy: 'assets/sprites/enemy.png',
            coin: 'assets/sprites/coin.png',
            platform: 'assets/sprites/platform.png'
        }
    };

    assetLoader.onProgress = (progress) => {
        gameState.loading.progress = progress;
    };

    try {
        const loadedAssets = await assetLoader.loadAssets(imageAssets);
        gameState.assets.images = loadedAssets.images;

        if (gameState.assets.images.player) {
            gameState.player.sprite = new Sprite({
                position: { x: gameState.player.x, y: gameState.player.y },
                size: { width: gameState.player.width, height: gameState.player.height },
                image: gameState.assets.images.player,
                frames: { max: 4, current: 0, elapsed: 0, hold: 10 }
            });
        }

        gameState.loading.complete = true;
    } catch (error) {
        gameState.loading.complete = true;
    }
}
