export class Player {
    constructor(ctx) {
        this.x = 200;
        this.y = 100;
        this.vx = 2;
        this.vy = 2;
        this.size = 10;
        this.ctx = ctx;
        this.color = "red";
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, this.size, this.size);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    drawAim(curPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+this.size/2, this.y+this.size/2);
        this.ctx.lineTo(curPos.x, curPos.y);
        this.ctx.stroke();
    }

    getPlayerPos() {
        return {x: this.x+this.size/2, y: this.y+this.size/2}
    }
}