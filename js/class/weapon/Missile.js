export class Missile {
    constructor(ctx, curPos, playerPos) {
        this.x = playerPos.x;
        this.y = playerPos.y;
        this.vx;
        this.vy;
        this.radius = 10;
        this.color = "blue";
        this.ctx = ctx;
        this.speed = 5;
        this.shotPos = curPos;
        this.playerPos = playerPos;
    }

    initDir() {
        let tx = this.shotPos.x - this.playerPos.x;
        let ty = this.shotPos.y - this.playerPos.y;
        let dist = Math.sqrt(tx * tx + ty * ty);

        this.vx = (tx / dist) * this.speed;
        this.vy = (ty / dist) * this.speed;
    }

    draw() {
        if (this.y + this.vy > canvas.height-this.radius || this.y + this.vy < this.radius) {
            this.vy = -this.vy;
        } 
        if (this.x + this.vx > canvas.width-this.radius || this.x + this.vx < this.radius) {
            this.vx = -this.vx;
        }

        this.x += this.vx;
        this.y += this.vy;

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}