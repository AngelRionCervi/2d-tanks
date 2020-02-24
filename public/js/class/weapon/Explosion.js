export class Explosion {
    constructor(x, y, bulletID, drawingTools) {
        this.id = "explosion_" + bulletID;
        this.x = x;
        this.y = y;
        this.size = 64;
        this.drawingTools = drawingTools;
        this.index = 0;
        this.duration = 14;
        this.frameNbr = 9;
        this.frames = [];
        for (let u = 0; u < this.frameNbr; u++) {
            this.frames.push(...new Array(this.duration).fill(u));
        }
        this.started = false;
        this.ended = false;
    }

    animate() {
        if (this.index !== this.frames.length - 1) {
            let sprite = "explosion_" + this.frames[this.index];
            this.drawingTools.drawSprite(sprite, this.x-this.size/2, this.y-this.size/2, this.centerX, this.centerY, -this.centerX, -this.centerY);
        } else {
            this.ended = true;
            console.log("explosion ended")
        }
        this.index++;
    }
}