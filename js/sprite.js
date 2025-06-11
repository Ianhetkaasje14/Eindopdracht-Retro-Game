// Simple Sprite class for handling game images and animations
class Sprite {
    constructor(options) {
        // Position and size properties
        this.position = options.position || { x: 0, y: 0 };
        this.size = options.size || { width: 32, height: 32 };
        this.color = options.color || "#FF0000";
        this.image = options.image || null;

        // Animation properties
        this.frames = options.frames || { max: 1, current: 0, elapsed: 0, hold: 10 };
        
        // 2D sprite sheet properties (for grid-based sprite sheets)
        this.grid = options.grid || { rows: 1, cols: this.frames.max };
        
        // Animation set (which row to use for animation)
        this.animationRow = options.animationRow || 0; // Default to first row

        // Direction (1 = right, -1 = left)
        this.direction = 1;
    }

    // Set which row of the sprite sheet to use for animation
    setAnimationRow(row) {
        this.animationRow = row;
        this.frames.current = 0; // Reset to first frame of new animation
    }

    // Draw the sprite on the canvas
    draw(ctx) {
        // If no image is available, draw a colored rectangle
        if (!this.image) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
            return;
        }

        // Calculate frame dimensions for 2D sprite sheet
        const frameWidth = this.image.width / this.grid.cols;
        const frameHeight = this.image.height / this.grid.rows;
          // Calculate current frame position in the grid
        const frameCol = this.frames.current % this.grid.cols;
        const frameRow = this.animationRow; // Use the specified animation row
        
        // Calculate source coordinates
        const sourceX = frameCol * frameWidth;
        const sourceY = frameRow * frameHeight;

        // Save the current canvas state
        ctx.save();

        // Draw the sprite facing left or right
        if (this.direction === -1) {
            // Flip horizontally for left direction
            ctx.translate(this.position.x + this.size.width, this.position.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                sourceX, sourceY, frameWidth, frameHeight,
                0, 0, this.size.width, this.size.height
            );
        } else {
            // Normal drawing for right direction
            ctx.drawImage(
                this.image,
                sourceX, sourceY, frameWidth, frameHeight,
                this.position.x, this.position.y, this.size.width, this.size.height
            );
        }

        // Restore the canvas state
        ctx.restore();

        // Handle animation by updating the current frame
        if (this.frames.max > 1) {
            this.frames.elapsed++;
            if (this.frames.elapsed % this.frames.hold === 0) {
                this.frames.current = (this.frames.current + 1) % this.frames.max;
            }
        }
    }
}
