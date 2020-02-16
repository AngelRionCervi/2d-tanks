export class Player {
    constructor(canvas, ctx, drawingTools, collisionDetector) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.collisionDetector = collisionDetector;
        this.x = 200;
        this.y = 100;
        this.speed = 3;
        this.baseSizeX = 32;
        this.baseSizeY = 32;
        this.canonSizeX = 28;
        this.canonSizeY = 32;
        this.aimWidth = 1;
        this.aimSize = 0;
        this.projectionSize = 200;
        this.aimColor = "black";
        this.projectionColor = "red";
        this.centerX = this.x + this.baseSizeX / 2;
        this.centerY = this.y + this.baseSizeY / 2;
        this.canonOffsetCenter = 5;
        this.turnVelX = 0;
        this.turnVelY = 0;
        this.turnAngle = 0;
        this.playerAngle = -90 * Math.PI / 180;
        this.curOnCanvas = false;
        this.diagonalSpeedDiviser = 1.3;
        this.maxConcurringMissiles = 3;
        this.walkAnimationStep = 0;
        this.walkAnimationArr = [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
        }

        this.uuidv4 = () => {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
              (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
          }

        this.id = this.uuidv4();

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI;
    }

    draw(vel) {

        let isColl = this.collisionDetector.mapPlayerCollision(this.centerX, this.centerY, this.baseSizeY);

        let collVel = this.mapCollHandler(vel, isColl);

        if (collVel.velX && collVel.velY) {
            collVel.velX = collVel.velX/this.diagonalSpeedDiviser;
            collVel.velY = collVel.velY/this.diagonalSpeedDiviser;
        }

        this.x += collVel.velX;
        this.y += collVel.velY;

        this.updCenters();

        this.drawSprites();
    }

    drawAim(curPos, map) {

        this.aimSize = Math.hypot(map.width, map.height);

        let angle = this.getAngle(curPos);
        this.playerAngle = angle;

        let dist = this.collisionDetector.pointDistance(curPos.x, this.centerX, curPos.y, this.centerY);
        let totalAimSize = dist - (this.canonOffsetCenter + this.canonSizeY) + this.aimSize;

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

    mapCollHandler(vel, isColl) {

        let velX = 0;
        let velY = 0;

        if (isColl.size > 0) {

            isColl.forEach((v, i, a) => {

                if (v === 'left') {
                    if (vel[1] < 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velY -= vel[0];
                        if (a.size === 1) {
                            velX = velX;
                        } else {
                            velX -= vel[1];
                        }
                    }
                } else if (v === 'right') {
                    if (vel[1] > 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velY -= vel[0];
                        if (a.size === 1) {
                            velX = velX;
                        } else {
                            velX -= vel[1];
                        }
                    }
                } else if (v === 'top') {
                    if (vel[0] > 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velX += vel[1];
                        if (a.size === 1) {
                            velY = velY;
                        } else {
                            velY += vel[0];
                        }
                    }
                } else if (v === 'bottom') {
                    if (vel[0] < 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velX += vel[1];
                        if (a.size === 1) {
                            velY = velY;
                        } else {
                            velY += vel[0];
                        }
                    }
                }
            })
        } else {
            velY -= vel[0];
            velX += vel[1];
        }

        return { velX: velX * this.speed, velY: velY * this.speed };
    }

    walkAnimation() {

        let incY = 0

        let index = this.walkAnimationArr[this.walkAnimationStep];
        
        incY = index;
        
        this.walkAnimationStep += 1;

        if (this.walkAnimationStep === this.walkAnimationArr.length) {
            this.walkAnimationStep = 0;
        }

        return incY;
    }

    drawSprites() {
        // draw base
        if (!this.playerAngle) {
            // draw canon
            drawPlayer();
            drawRL();

        } else {

            let degAngle = this.radToDeg(this.playerAngle);

            if (!(degAngle >= -110 && degAngle <= 110)) {
                this.drawRL();
                this.drawPlayer(true);
            } else {
                this.drawPlayer();
                this.drawRL();
            }
        }
    }

    drawPlayer(inv = null) {
        let sprite;

        if (inv) {
            sprite = 'playerBack';
        } else {
            if (this.playerAngle < 0) {
                sprite = 'playerFrontLeft';
            } else {
                sprite = 'playerFrontRight';
            }
        }

        this.drawingTools.drawSprite(sprite, this.x, this.y, this.centerX, this.centerY, -this.centerX, -this.centerY, 0);
    }

    drawRL() {
        let sprite = this.playerAngle < 0 ? 'RLinv' : 'RL';
        let xInc = this.playerAngle < 0 ? 1 : -1;

        this.drawingTools.drawSprite(sprite, this.x + xInc, this.y, this.centerX, this.centerY, -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - this.canonOffsetCenter), -this.playerAngle);
    }

    getPlayerPos() {
        return { x: this.centerX, y: this.centerY }
    }

    getPlayerAngle(curPos) {
        return this.getAngle(curPos);
    }

    getPlayerSpecs() {
        return { baseSizeX: this.baseSizeX, baseSizeY: this.baseSizeY, canonSizeX: this.canonSizeX, canonSizeY: this.canonSizeY }
    }

}