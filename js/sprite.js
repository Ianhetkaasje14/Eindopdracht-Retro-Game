
class Sprite {
    constructor(options) {
        this.position = options.position || { x: 0, y: 0 };
        this.size = options.size || { width: 32, height: 32 };
        this.color = options.color || "#FF0000";
        this.image = options.image || null;
        this.frames = options.frames || { max: 1, current: 0, elapsed: 0, hold: 10 };
        this.offset = options.offset || { x: 0, y: 0 };
        this.direction = 1;
    }

    draw(ctx) {
        if (this.image) {
            const frameWidth = this.image.width / this.frames.max;

            ctx.save();

            if (this.direction === -1) {
                ctx.translate(this.position.x + this.size.width, this.position.y);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.image,
                    this.frames.current * frameWidth,
                    0,
                    frameWidth,
                    this.image.height,
                    0,
                    0,
                    this.size.width,
                    this.size.height
                );
            } else {
                ctx.drawImage(
                    this.image,
                    this.frames.current * frameWidth,
                    0,
                    frameWidth,
                    this.image.height,
                    this.position.x,
                    this.position.y,
                    this.size.width,
                    this.size.height
                );
            }

            ctx.restore();

            if (this.frames.max > 1) {
                this.frames.elapsed++;
                if (this.frames.elapsed % this.frames.hold === 0) {
                    this.frames.current++;
                    if (this.frames.current >= this.frames.max) {
                        this.frames.current = 0;
                    }
                }
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(
                this.position.x,
                this.position.y,
                this.size.width,
                this.size.height
            );
        }
    }
}
