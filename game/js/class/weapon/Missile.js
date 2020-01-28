export class Missile {
    constructor(canvas, ctx, curPos, playerPos, drawingTools) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools
        this.x = playerPos.x;
        this.y = playerPos.y;
        this.vx;
        this.vy;
        this.radius = 6;
        this.color = "blue";
        this.speed = 3;
        this.shotPos = curPos;
        this.playerPos = playerPos;
        this.lastColl = [];
    }

    initDir() {
        let tx = this.shotPos.x - this.playerPos.x;
        let ty = this.shotPos.y - this.playerPos.y;
        let dist = Math.sqrt(tx * tx + ty * ty);

        this.vx = (tx / dist) * this.speed;
        this.vy = (ty / dist) * this.speed;
    }

    draw(coll) {

        if (coll === "left") {
            this.x--;
            this.vx = -this.vx;
        } 
        if (coll === "right") {
            this.x++;
            this.vx = -this.vx;
        }  
        if (coll === "top") {
            this.y--;
            this.vy = -this.vy;
        }
        if (coll === "bottom") {
            this.y++;
            this.vy = -this.vy;
        }

        this.x += this.vx;
        this.y += this.vy;

        this.drawingTools.circ(this.x, this.y, this.radius, 0, Math.PI*2, true, this.color);
    }
}