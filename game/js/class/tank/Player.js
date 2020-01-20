export class Player {
    constructor(canvas, ctx) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.x = 200;
        this.y = 100;
        this.speed = 2;
        this.baseSizeX = 20;
        this.baseSizeY = 25;
        this.canonSizeX = 8;
        this.canonSizeY = 18;
        this.aimWidth = 1;
        this.aimSize = 1000;
        this.projectionSize = 100;
        this.baseColor = "purple";
        this.canonColor = "red";
        this.aimColor = "black";
        this.projectionColor = "red";
        this.centerX = this.x + this.baseSizeX / 2;
        this.centerY = this.y + this.baseSizeY / 2;
        this.canonOffsetCenter = 5;
        this.turnVelX = 0;
        this.turnVelY = 0;
        this.turnAngle = 0;
        this.playerAngle = 0;
        this.turnSpeedMult = 0.1;

        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
        }

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI
    }

    draw(vel, curPos = null) {

        this.x += vel[1] * this.speed;
        this.y -= vel[0] * this.speed;

        this.updCenters();

        let angle;
        if (curPos) {
            angle = this.getAngle(curPos);
        } else {
            angle = 0;
        }
        
        this.turnAnimation(vel);

        // draw base
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.centerX, this.centerY)
        this.ctx.rotate(this.playerAngle * Math.PI / 180);
        this.ctx.translate(-(this.centerX), -(this.centerY))
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
        this.ctx.translate(-(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - this.canonOffsetCenter))
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

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.centerX, this.centerY)
        this.ctx.rotate(-angle);
        this.ctx.translate(-(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - (this.canonOffsetCenter + this.canonSizeY)))
        this.ctx.rect(this.x + this.canonSizeX / 2 - this.aimWidth / 2, this.y, this.aimWidth, totalAimSize);
        this.ctx.closePath();
        this.ctx.fillStyle = this.aimColor;
        this.ctx.fill();
        this.ctx.restore();

        let yEndAim = (totalAimSize + 15) * Math.cos(angle); // 15 ???
        let xEndAim = (totalAimSize + 15) * Math.sin(angle);

        //right
        if (this.centerX + xEndAim > this.canvas.width) {
            let xInWall = (this.canvas.width - (this.centerX + xEndAim)) * -1;
            let yWallOffset = xInWall / Math.tan(angle); // ???????????????????????????????????????????????????????????????????????????????????

            this.aimProjection(xEndAim - xInWall, yEndAim - yWallOffset, angle, "xWall");
        }
        //left
        if (this.centerX + xEndAim < 0) {
            let xInWall = (this.centerX + xEndAim) * -1;
            let yWallOffset = xInWall / Math.tan(angle); // ???????????????????????????????????????????????????????????????????????????????????

            this.aimProjection(xEndAim + xInWall, yEndAim + yWallOffset, angle, "xWall");
        }
        //bottom
        if (this.centerY + yEndAim > this.canvas.height) {
            let yInWall = (this.canvas.height - (this.centerY + yEndAim)) * -1;
            let xWallOffset = yInWall * Math.tan(angle);

            this.aimProjection(xEndAim - xWallOffset, yEndAim - yInWall, angle, "yWall");
        }
        //top
        if (this.centerY + yEndAim < 0) {
            let yInWall = (this.centerY + yEndAim) * -1;
            let xWallOffset = yInWall * Math.tan(angle);

            this.aimProjection(xEndAim + xWallOffset, yEndAim + yInWall, angle, "yWall");
        }

    }

    aimProjection(x, y, angle, wallType) {

        let size = this.projectionSize
        if (wallType === "yWall") {
            size = -this.projectionSize
        }

        this.ctx.save();
        this.ctx.beginPath();

        this.ctx.translate(this.centerX + x, this.centerY + y)
        this.ctx.rotate(angle);
        this.ctx.translate(-(this.centerX + x), -(this.centerY + y))

        this.ctx.rect(this.centerX + x, this.centerY + y, this.aimWidth, size);

        this.ctx.closePath();
        this.ctx.fillStyle = this.projectionColor;
        this.ctx.fill();
        this.ctx.restore();
    }

    turnAnimation(vel) {
        let tAngle = 90;
        let turn = false;

            //droite gauche
        if ((vel[1] === 1 && vel[0] === 0) || (vel[1] === -1 && vel[0] === 0)) {
            console.log('droite gauche')
            this.turnAngle = tAngle;
            turn = true;
            
            //haut bas
        } else if ((vel[1] === 0 && vel[0] === 1) || (vel[1] === 0 && vel[0] === -1)) {
            console.log('haut bas')
            this.turnAngle = 0;
            turn = true;
                
            //droit-haut gauche-bas
        } else if ((vel[1] === 1 && vel[0] === 1) || (vel[1] === -1 && vel[0] === -1)) {
            console.log('droit-haut gauche-bas')
            this.turnAngle = tAngle/2;
            turn = true;
                
            //droit-bas gauche-haut
        } else if ((vel[1] === -1 && vel[0] === 1) || (vel[1] === 1 && vel[0] === -1)) {
            console.log('droit-bas gauche-haut')
            this.turnAngle = -tAngle/2;
            turn = true;

        } else {
            
            turn = false;
        }

        if (turn === true) {
            if (this.playerAngle < this.turnAngle) {
                this.playerAngle += 5;
            } else if (this.playerAngle !== this.turnAngle) {
                this.playerAngle -= 5;
            }
        }
    }

    getPlayerPos() {
        return { x: this.centerX, y: this.centerY }
    }
}