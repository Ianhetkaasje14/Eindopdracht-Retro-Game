
/**
 * AssetLoader class for loading game images and sounds
 * Tracks loading progress and provides callbacks
 */
class AssetLoader {
    constructor() {
        // Storage for loaded assets
        this.images = {};
        this.sounds = {};

        // For tracking loading progress
        this.totalAssets = 0;
        this.loadedAssets = 0;

        // Callback functions
        this.onProgress = null;
        this.onComplete = null;
    }

    /**
     * Load an image and store it by name
     */
    loadImage(name, src) {
        this.totalAssets++;

        return new Promise((resolve, reject) => {
            const img = new Image();            // When image loads successfully
            img.onload = () => {
                this.images[name] = img;
                this.loadedAssets++;
                this.updateProgress();
                resolve(img);
            };

            // When image fails to load
            img.onerror = () => {
                console.error(`Failed to load image: ${name} from ${src}`);
                this.loadedAssets++;
                this.updateProgress();
                resolve(null);
            };

            img.src = src;
        });
    }

    /**
     * Load a sound and store it by name
     */
    loadSound(name, src) {
        this.totalAssets++;

        return new Promise((resolve, reject) => {
            const sound = new Audio();

            // When sound loads successfully
            sound.oncanplaythrough = () => {
                this.sounds[name] = sound;
                this.loadedAssets++;
                this.updateProgress();
                resolve(sound);
            };

            // When sound fails to load
            sound.onerror = () => {
                console.error(`Failed to load sound: ${src}`);
                this.loadedAssets++;
                this.updateProgress();
                resolve(null);
            };

            sound.src = src;
        });
    }

    /**
     * Load multiple assets at once
     * Example: loadAssets({images: {player: 'player.png'}, sounds: {jump: 'jump.wav'}})
     */
    async loadAssets(assets) {
        const promises = [];

        // Load all images
        if (assets.images) {
            for (const [name, src] of Object.entries(assets.images)) {
                promises.push(this.loadImage(name, src));
            }
        }

        // Load all sounds
        if (assets.sounds) {
            for (const [name, src] of Object.entries(assets.sounds)) {
                promises.push(this.loadSound(name, src));
            }
        }

        // Wait for all assets to load
        await Promise.all(promises);

        // Call the completion callback if provided
        if (this.onComplete) {
            this.onComplete();
        }

        // Return the loaded assets
        return {
            images: this.images,
            sounds: this.sounds
        };
    }

    /**
     * Update the loading progress and call the progress callback
     */
    updateProgress() {
        const progress = this.loadedAssets / this.totalAssets;

        if (this.onProgress) {
            this.onProgress(progress);
        }
    }

    /**
     * Get the current loading progress as a value between 0 and 1
     */
    getProgress() {
        return this.loadedAssets / this.totalAssets;
    }
}
