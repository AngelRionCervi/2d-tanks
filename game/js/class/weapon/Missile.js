export class Missile {
    constructor(canvas, ctx, curPos, playerPos) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.x = playerPos.x;
        this.y = playerPos.y;
        this.vx;
        this.vy;
        this.radius = 6;
        this.color = "blue";
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

    draw(coll) {

        
        coll.forEach((v) => {
            if (v === "xColl") {
                console.log(coll);
                this.vx = -this.vx;
            } else if (v === "yColl") {
                console.log(coll);
                this.vy = -this.vy;
            }
        })
        

        if (this.y + this.vy > this.canvas.height || this.y + this.vy < 0) {
            this.vy = -this.vy;
        } 
        if (this.x + this.vx > this.canvas.width || this.x + this.vx < 0) {
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