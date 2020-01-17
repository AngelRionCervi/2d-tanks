export class Missile {
    constructor(ctx, curPos, playerPos) {
        this.x = playerPos.x;
        this.y = playerPos.y;
        this.vx;
        this.vy;
        this.radius = 2;
        this.color = "blue";
        this.ctx = ctx;
        this.speed = 2;
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
        if (this.y + this.vy > canvas.height || this.y + this.vy < 0) {
            this.vy = -this.vy;
        } 
        if (this.x + this.vx > canvas.width || this.x + this.vx < 0) {
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