export class Player {
    constructor(canvas, ctx, drawingTools) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.x = 200;
        this.y = 100;
        this.speed = 1.5;
        this.baseSizeX = 20;
        this.baseSizeY = 25;
        this.canonSizeX = 8;
        this.canonSizeY = 18;
        this.aimWidth = 1;
        this.aimSize = 0;
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
        this.curOnCanvas = false;

        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
        }

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI
    }

    draw(vel, isColl) {

        let collVel = this.mapPlayerColl(vel, isColl);

        this.x += collVel.velX;
        this.y += collVel.velY;

        this.updCenters();

        this.turnAnimation(vel);

        // draw base
        this.drawingTools.rect(this.x, this.y, this.baseSizeX, this.baseSizeY, this.centerX, 
        this.centerY, -this.centerX, -this.centerY, this.playerAngle * Math.PI / 180, this.baseColor);

        // initiate canon at angle if cursor not on canvas
        if (!this.curOnCanvas) {

            this.drawingTools.rect(this.x, this.y, this.canonSizeX, this.canonSizeY, 
            this.centerX, this.centerY, -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - this.canonOffsetCenter), 0, this.canonColor);
        }
    }

    drawAim(curPos, map) {

        this.aimSize = Math.hypot(map.width, map.height);
        this.curOnCanvas = true;

        let angle = this.getAngle(curPos);

        let tx = curPos.x - this.centerX;
        let ty = curPos.y - this.centerY;
        let dist = Math.sqrt(tx * tx + ty * ty);
        let totalAimSize = dist - (this.canonOffsetCenter + this.canonSizeY) + this.aimSize;

        // draw canon
        this.drawingTools.rect(this.x, this.y, this.canonSizeX, this.canonSizeY, 
        this.centerX, this.centerY, -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - this.canonOffsetCenter), -angle, this.canonColor);

        let yEndAim = (totalAimSize + 15) * Math.cos(angle); // 15 ???
        let xEndAim = (totalAimSize + 15) * Math.sin(angle);

        let isAimColl = this.checkAimColl(map, xEndAim, yEndAim);

        if (isAimColl) {
            this.aimProjection(isAimColl.x, isAimColl.y, angle, isAimColl.type, isAimColl.dist);
        }
    }

    checkAimColl(map, xEndAim, yEndAim) {

        let px0 = this.centerX, py0 = this.centerY, px1 = xEndAim + this.centerX, py1 = yEndAim + this.centerY;

        let isColl = [];

        for (let u = 0; u < map.coords.length; u++) {

            let rectLines = [
                { x0: map.coords[u].x, y0: map.coords[u].y, x1: map.coords[u].x + map.coords[u].w, y1: map.coords[u].y, type: 'top' }, //top
                { x0: map.coords[u].x, y0: map.coords[u].y + map.coords[u].h, x1: map.coords[u].x + map.coords[u].w, y1: map.coords[u].y + map.coords[u].h, type: 'bottom' }, //bottom
                { x0: map.coords[u].x, y0: map.coords[u].y, x1: map.coords[u].x, y1: map.coords[u].y + map.coords[u].h, type: 'left' }, //left
                { x0: map.coords[u].x + map.coords[u].w, y0: map.coords[u].y, x1: map.coords[u].x + map.coords[u].w, y1: map.coords[u].y + map.coords[u].h, type: 'right' }, //right
            ]

            for (let n = 0; n < rectLines.length; n++) {

                let px2 = rectLines[n].x0, py2 = rectLines[n].y0, px3 = rectLines[n].x1, py3 = rectLines[n].y1;

                let s1_x, s1_y, s2_x, s2_y;
                s1_x = px1 - px0;
                s1_y = py1 - py0;
                s2_x = px3 - px2;
                s2_y = py3 - py2;

                let s, t;
                s = (-s1_y * (px0 - px2) + s1_x * (py0 - py2)) / (-s2_x * s1_y + s1_x * s2_y);
                t = (s2_x * (py0 - py2) - s2_y * (px0 - px2)) / (-s2_x * s1_y + s1_x * s2_y);

                let interX = px0 + (t * (px1 - px0));
                let interY = py0 + (t * (py1 - py0));

                if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
                    isColl.push({ type: rectLines[n].type, x: interX, y: interY, dist: Math.hypot(interX - this.centerX, interY - this.centerY) });
                }
            }
        }

        if (isColl.length > 0) {
            
            /* debug line/line coll
            isColl.forEach((v) => {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(v.x, v.y, 8, 0, Math.PI * 2);
                this.ctx.closePath();
                this.ctx.fillStyle = 'purple';
                this.ctx.fill();
                this.ctx.restore();
            }) */

            let distances = isColl.map(el => el.dist);
            let minDist = Math.min(...distances);
            let minDistIndex = distances.indexOf(minDist);

            return isColl[minDistIndex];
            
        } else {

            return false;
        }
    }

    aimProjection(x, y, angle, wallType, length) {

        let rev = false;
        if (wallType === "top" || wallType === "bottom") {
            rev = true;
        }

        // draw aim
        this.drawingTools.dashRect(this.x + this.canonSizeX / 2 - this.aimWidth / 2, this.y, this.aimWidth, length - 14, 
        this.centerX, this.centerY, -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - (this.canonOffsetCenter + this.canonSizeY)), 
        -angle, this.aimColor, 5, 10);

        // aim projection
        this.drawingTools.dashRect(x, y, this.aimWidth, this.projectionSize,
        x, y, -x, -y, angle, this.projectionColor, 4, 12, rev);
    }

    turnAnimation(vel) {
        let tAngle = 90;
        let turn = false;

        //droite gauche
        if ((vel[1] === 1 && vel[0] === 0) || (vel[1] === -1 && vel[0] === 0)) {
            this.turnAngle = tAngle;
            turn = true;

            //haut bas
        } else if ((vel[1] === 0 && vel[0] === 1) || (vel[1] === 0 && vel[0] === -1)) {
            this.turnAngle = 0;
            turn = true;

            //droit-haut gauche-bas
        } else if ((vel[1] === 1 && vel[0] === 1) || (vel[1] === -1 && vel[0] === -1)) {
            this.turnAngle = tAngle / 2;
            turn = true;

            //droit-bas gauche-haut
        } else if ((vel[1] === -1 && vel[0] === 1) || (vel[1] === 1 && vel[0] === -1)) {
            this.turnAngle = -tAngle / 2;
            turn = true;

        } else {
            turn = false;
        }

        if (turn === true) {
            if (this.playerAngle < this.turnAngle) {
                this.playerAngle += 5;
            } else if (this.playerAngle > this.turnAngle) {
                this.playerAngle -= 5;
            }
        }
    }

    mapPlayerColl(vel, isColl) {

        let velX = 0;
        let velY = 0;

        if (isColl.size > 0) {

            isColl.forEach((v, i, a) => {

                if (v === 'left') {
                    if (vel[1] < 0) {
                        velY -= vel[0] * this.speed;
                        velX += vel[1] * this.speed;
                    } else {
                        velY -= vel[0] * this.speed;
                        if (a.size === 1) {
                            velX = velX;
                        } else {
                            velX -= vel[1] * this.speed;
                        }
                    }
                } else if (v === 'right') {
                    if (vel[1] > 0) {
                        velY -= vel[0] * this.speed;
                        velX += vel[1] * this.speed;
                    } else {
                        velY -= vel[0] * this.speed;
                        if (a.size === 1) {
                            velX = velX;
                        } else {
                            velX -= vel[1] * this.speed;
                        }
                    }
                } else if (v === 'top') {
                    if (vel[0] > 0) {
                        velY -= vel[0] * this.speed;
                        velX += vel[1] * this.speed;
                    } else {
                        velX += vel[1] * this.speed;
                        if (a.size === 1) {
                            velY = velY;
                        } else {
                            velY += vel[0] * this.speed;
                        }
                    }
                } else if (v === 'bottom') {
                    if (vel[0] < 0) {
                        velY -= vel[0] * this.speed;
                        velX += vel[1] * this.speed;
                    } else {
                        velX += vel[1] * this.speed;
                        if (a.size === 1) {
                            velY = velY;
                        } else {
                            velY += vel[0] * this.speed;
                        }
                    }
                }
            })
        } else {
            velY -= vel[0] * this.speed;
            velX += vel[1] * this.speed;
        }

        return { velX: velX, velY: velY };
    }

    getPlayerPos() {
        return { x: this.centerX, y: this.centerY }
    }

    getPlayerSpecs() {
        return { baseSizeX: this.baseSizeX, baseSizeY: this.baseSizeY, canonSizeX: this.canonSizeX, canonSizeY: this.canonSizeY }
    }

}