
class AssetLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    loadImage(name, src) {
        this.totalAssets++;

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                this.images[name] = img;
                this.loadedAssets++;
                this.updateProgress();
                resolve(img);
            };

            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                this.loadedAssets++;
                this.updateProgress();
                resolve(null);
            };

            img.src = src;
        });
    }

    loadSound(name, src) {
        this.totalAssets++;

        return new Promise((resolve, reject) => {
            const sound = new Audio();

            sound.oncanplaythrough = () => {
                this.sounds[name] = sound;
                this.loadedAssets++;
                this.updateProgress();
                resolve(sound);
            };

            sound.onerror = () => {
                console.error(`Failed to load sound: ${src}`);
                this.loadedAssets++;
                this.updateProgress();
                resolve(null);
            };

            sound.src = src;
        });
    }

    async loadAssets(assets) {
        const promises = [];

        if (assets.images) {
            for (const [name, src] of Object.entries(assets.images)) {
                promises.push(this.loadImage(name, src));
            }
        }

        if (assets.sounds) {
            for (const [name, src] of Object.entries(assets.sounds)) {
                promises.push(this.loadSound(name, src));
            }
        }

        await Promise.all(promises);

        if (this.onComplete) {
            this.onComplete();
        }

        return {
            images: this.images,
            sounds: this.sounds
        };
    }

    updateProgress() {
        const progress = this.loadedAssets / this.totalAssets;

        if (this.onProgress) {
            this.onProgress(progress);
        }
    }

    getProgress() {
        return this.loadedAssets / this.totalAssets;
    }
}
