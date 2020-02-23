export class Explosion {
    constructor(x, y, bulletID, drawingTools) {
        this.id = "explosion_" + bulletID;
        this.x = x;
        this.y = y;
        this.size = 32;
        this.drawingTools = drawingTools;
        this.index = 0;
        this.duration = 10;
        this.frames = [
            ...new Array(this.duration).fill(0),
            ...new Array(this.duration).fill(1),
            ...new Array(this.duration).fill(2),
            ...new Array(this.duration).fill(3)
        ]
        this.started = false;
        this.ended = false;
    }

    animate() {
        if (this.index !== this.frames.length - 1) {
            let sprite = "explosion" + this.frames[this.index];
            this.drawingTools.drawSprite(sprite, this.x-this.size/2, this.y-this.size/2, this.centerX, this.centerY, -this.centerX, -this.centerY);
        } else {
            this.ended = true;
            console.log("explosion ended")
        }
        this.index++;
    }
}