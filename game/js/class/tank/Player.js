export class Player {
    constructor(canvas, ctx, drawingTools, collisionDetector) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.collisionDetector = collisionDetector;
        this.x = 200;
        this.y = 100;
        this.speed = 1.5;
        this.baseSizeX = 20;
        this.baseSizeY = 25;
        this.canonSizeX = 8;
        this.canonSizeY = 18;
        this.aimWidth = 1;
        this.aimSize = 0;
        this.projectionSize = 200;
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
        this.firstBounce = '';
        this.secondBounce = '';

        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
        }

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI;
    }

    draw(vel) {

        let isColl = this.collisionDetector.mapPlayerCollision(this.centerX, this.centerY, this.baseSizeY);

        let collVel = this.mapCollHandler(vel, isColl);

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

        let dist = this.collisionDetector.pointDistance(curPos.x, this.centerX, curPos.y, this.centerY);
        let totalAimSize = dist - (this.canonOffsetCenter + this.canonSizeY) + this.aimSize;

        // draw canon
        this.drawingTools.rect(this.x, this.y, this.canonSizeX, this.canonSizeY,
            this.centerX, this.centerY, -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - this.canonOffsetCenter), -angle, this.canonColor);

        let yEndAim = totalAimSize * Math.cos(angle);
        let xEndAim = totalAimSize * Math.sin(angle);

        yEndAim = yEndAim + this.centerY;
        xEndAim = xEndAim + this.centerX;

        let isAimColl = this.checkAimColl(map, this.centerX, this.centerY, xEndAim, yEndAim, this.centerX, this.centerY, 1);

        if (isAimColl) {
            this.aimProjection(isAimColl.x, isAimColl.y, angle, isAimColl.type, isAimColl.dist, map);
        }
    }

    aimProjection(x, y, angle, wallType, length, map) {

        let rev = false;
        if (wallType === "top" || wallType === "bottom") {
            rev = true;
        }

        // draw aim
        this.drawingTools.dashRect(this.x + this.canonSizeX / 2 - this.aimWidth / 2, this.y, this.aimWidth, length - 14,
            this.centerX, this.centerY, -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - (this.canonOffsetCenter + this.canonSizeY)),
            -angle, this.aimColor, 5, 10);

        let yEndProj = this.projectionSize * Math.cos(angle);
        let xEndProj = this.projectionSize * Math.sin(angle);

        if (rev) {
            yEndProj = -(yEndProj - y);
            xEndProj = xEndProj + x;
        } else {
            yEndProj = yEndProj + y;
            xEndProj = -(xEndProj - x);
        }

        let secondBounce = this.checkAimColl(map, x, y, xEndProj, yEndProj, x, y, 2);

        let distEndProj = this.collisionDetector.pointDistance(x, y, secondBounce.x, secondBounce.y);

        let projSize = secondBounce ? distEndProj : this.projectionSize;

        // draw projection
        this.drawingTools.dashRect(x, y, this.aimWidth, projSize,
            x, y, -x, -y, angle, this.projectionColor, 4, 12, rev);

    }

    checkAimColl(map, x0, y0, x1, y1, objX, objY, bounceNbr) {

        let px0 = x0, py0 = y0, px1 = x1, py1 = y1;

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

                let coll = this.collisionDetector.segSegCollision(px0, py0, px1, py1, px2, py2, px3, py3);

                if (coll) {
                    coll.type = rectLines[n].type;
                    isColl.push(coll);
                }
            }
        }

        if (bounceNbr === 2) {
            isColl = isColl.filter((el) => el.type !== this.firstBounce);
        }

        if (isColl.length > 0) {

            let distances = [];

            isColl.forEach((v) => {
                distances.push(this.collisionDetector.pointDistance(objX, objY, v.x, v.y));
            });

            let minDist = Math.min(...distances);
            let minDistIndex = distances.indexOf(minDist);
            isColl[minDistIndex].dist = minDist;

            if (bounceNbr === 1) {
                this.firstBounce = isColl[minDistIndex].type;
            } else if (bounceNbr === 2) {
                this.secondBounce = isColl[minDistIndex].type;
            }

            return isColl[minDistIndex];

        } else {

            return false;
        }
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

    mapCollHandler(vel, isColl) {

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