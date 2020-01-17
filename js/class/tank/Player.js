export class Player {
    constructor(ctx) {
        this.ctx = ctx;
        this.x = 200;
        this.y = 100;
        this.vx = 2;
        this.vy = 2;
        this.baseSizeX = 20;
        this.baseSizeY = 25;
        this.canonSizeX = 8;
        this.canonSizeY = 18;
        this.aimWidth = 1;
        this.aimSize = 100;
        this.baseColor = "purple";
        this.canonColor = "red";
        this.aimColor = "black";
        this.centerX = this.x + this.baseSizeX/2;
        this.centerY = this.y + this.baseSizeY/2;
        this.canonOffsetCenter = 5;

        this.getAngle = (curPos) => Math.atan2(curPos.x - (this.x + this.baseSizeX/2), curPos.y - (this.y + this.baseSizeY/2));
        this.radToDeg = (rad) => rad * 180 / Math.PI
    }

    draw(curPos = null) {

        let angle;
        if (curPos) {
            angle = this.getAngle(curPos);
        } else {
            angle = 0;
        }

        // draw base
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.x + this.baseSizeX/2, this.y + this.baseSizeY/2)
        this.ctx.rotate(0);
        this.ctx.translate(-(this.x + this.baseSizeX/2), -(this.y + this.baseSizeY/2))
        this.ctx.rect(this.x, this.y, this.baseSizeX, this.baseSizeY);
        this.ctx.closePath();
        this.ctx.fillStyle = this.baseColor;
        this.ctx.fill();
        this.ctx.restore();

        // draw canon
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.centerX, this.centerY)
        this.ctx.rotate(-angle);
        this.ctx.translate(-(this.x + this.canonSizeX/2), -(this.y + this.canonSizeY/2 - this.canonOffsetCenter))
        this.ctx.rect(this.x, this.y, this.canonSizeX, this.canonSizeY);
        this.ctx.closePath();
        this.ctx.fillStyle = this.canonColor;
        this.ctx.fill();
        this.ctx.restore();
    }

    drawAim(curPos) {

        let angle = this.getAngle(curPos);

        let tx = curPos.x - this.centerX;
        let ty = curPos.y - this.centerY;
        let dist = Math.sqrt(tx * tx + ty * ty);
        let totalAimSize = dist - (this.canonOffsetCenter + this.canonSizeY) + this.aimSize;
        
        let yEndAim = (totalAimSize + 18 - 4) * Math.cos(angle);
        let xEndAim = (totalAimSize + 18 - 4) * Math.sin(angle);
/*
        if (totalAimSize + this.centerX > canvas.width) {
            totalAimSize = canvas.width - this.centerX;
        }*/

        if (this.centerX + xEndAim > canvas.width) {
            
            //totalAimSize = totalAimSize - (this.aimSize - (canvas.width - (curPos.x + this.centerX)))
            this.aimProjection(xEndAim, yEndAim, angle, "xWall");
        }
        if (this.centerX + xEndAim < 0) {
            this.aimProjection(xEndAim, yEndAim, angle, "xWall");
        }
        if (this.centerY + yEndAim > canvas.height) {
            this.aimProjection(xEndAim, yEndAim, angle, "yWall");
        }
        if (this.centerY + yEndAim < 0) {
            this.aimProjection(xEndAim, yEndAim, angle, "yWall");
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.centerX, this.centerY)
        this.ctx.rotate(-angle);
        this.ctx.translate(-(this.x + this.canonSizeX/2), -(this.y + this.canonSizeY/2 - (this.canonOffsetCenter + this.canonSizeY)))
        this.ctx.rect(this.x + this.canonSizeX/2 - this.aimWidth/2, this.y, this.aimWidth, totalAimSize);
        this.ctx.closePath();
        this.ctx.fillStyle = this.aimColor;
        this.ctx.fill();
        this.ctx.restore();

        if (this.x + xEndAim > canvas.width 
            || this.x + xEndAim < 0 
            || this.y + yEndAim > canvas.height
            || this.y + yEndAim < 0) {

            
        }

        

        //this.aimProjection(xEndAim, yEndAim, angle, wallType);
    }

    aimProjection(x, y, angle, wallType) {
        //console.log(x, y)
        let size = this.aimSize
        if (wallType === "yWall") {
            size = -this.aimSize
        }

        this.ctx.save();
        this.ctx.beginPath();

        this.ctx.translate(this.centerX + x, this.centerY + y)
        this.ctx.rotate(angle);
        this.ctx.translate(-(this.centerX + x), -(this.centerY + y))

        this.ctx.rect(this.centerX + x, this.centerY + y, this.aimWidth, size);
        
        this.ctx.closePath();
        this.ctx.fillStyle = "red";
        this.ctx.fill();
        this.ctx.restore();
    }

    getPlayerPos() {
        return {x: this.x+this.baseSizeX/2, y: this.y+this.baseSizeY/2}
    }
}