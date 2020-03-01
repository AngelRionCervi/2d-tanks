import { AbstractPlayer } from "./AbstractPlayer.js";

export class Player extends AbstractPlayer {
    constructor(canvas, ctx, drawingTools, collisionDetector) {
        super(canvas, ctx, drawingTools, null, collisionDetector);
    }

    draw(vel, delta) {
        let isColl = this.collisionDetector.mapPlayerCollision(this.centerX, this.centerY, this.size);
        let collVel = this.mapCollHandler(vel, isColl);

        if (collVel.velX && collVel.velY) {
            collVel.velX /= this.diagonalSpeedDiviser;
            collVel.velY /= this.diagonalSpeedDiviser;
        }

        if (collVel.velX || collVel.velY) {
            this.isMoving = true;
        }
        else {
            this.isMoving = false;
        }

        this.vx = collVel.velX;
        this.vy = collVel.velY;

        if (this.rollEndTime !== 0) {
            this.rollTimeoutCount = Date.now() - this.rollEndTime;
            this.rollTimeoutDone = false;
            if (this.rollTimeoutCount >= this.rollTimeout) {
                this.rollTimeoutDone = true;
                this.rollTimeoutCount = 0;
            }
        }

        if (this.rolling && this.rollTimeoutDone) {
            this.accelerate(this.rollVel.x, this.rollVel.y);
            if (this.rollVel.x === 0 && this.rollVel.y === 0) {
                this.rollStartTime = Date.now();
                if (this.vx === 0 && this.vy === 0) {
                    this.rolling = false;
                }
                if (this.vx !== 0 || this.vy !== 0) {
                    this.rollVel.x = this.vx;
                    this.rollVel.y = this.vy;
                }/*
                else if (this.vx === 0 && this.vy === 0) {
                    console.log("roll no dir")
                    let facingDir = this.getFacingDir();
                    if (facingDir.x && facingDir.y) {
                        facingDir.x /= this.diagonalSpeedDiviser;
                        facingDir.y /= this.diagonalSpeedDiviser;
                    }
                    this.rollVel.x = facingDir.x;
                    this.rollVel.y = facingDir.y;
                }*/
            }
            this.roll();
        }
        else {
            this.accelerate(this.vx, this.vy);
        }

        let fVelX = this.vx * delta + this.buildedAccelX;
        let fVelY = this.vy * delta + this.buildedAccelY;

        this.x += fVelX;
        this.y += fVelY;

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
        this.drawingTools.dashRect(this.x + this.canonSizeX / 2 - this.aimWidth / 2, this.y + this.rlPlayerDistance, this.aimWidth, length - 14 - this.rlPlayerDistance,
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

        } 
        else {
            
            return false;
        }
    }


    drawSprites() {

        this.drawShadow();

        // draw base
        if (!this.playerAngle) {
            // draw canon
            this.drawPlayer();
            this.drawRL();
            this.drawHand();

        } else {

            let degAngle = this.radToDeg(this.playerAngle);

            if (!(degAngle >= -120 && degAngle <= 120)) {
                this.drawRL();
                this.drawHand();
                this.drawPlayer(true);
            } else {
                this.drawPlayer();
                this.drawRL();
                this.drawHand();
            }
        }

        this.drawHealthBar();
    }


    drawShadow() {

        this.drawingTools.drawSprite('shadow', this.x + 2, this.y + 2, this.centerX, this.centerY, -this.centerX, -this.centerY);
    }


    drawPlayer(inv = null) {
        let sprite;

        let idleRun = this.isMoving ? "Run" : "Idle";
        let leftRight = this.playerAngle < 0 ? "Left" : "Right";
        let frontBack = inv ? "Back" : "Front";

        sprite = 'player' + idleRun + frontBack + leftRight;

        let animationIndex;

        if (this.isMoving) {
            animationIndex = this.runAnimationFrames[this.runAnimationIndex];
            this.runAnimationIndex++;
            if (this.runAnimationIndex > this.runAnimationFrames.length - 1) this.runAnimationIndex = 0;
        }
        else {
            animationIndex = this.idleAnimationFrames[this.idleAnimationIndex];
            this.idleAnimationIndex++;
            if (this.idleAnimationIndex > this.idleAnimationFrames.length - 1) this.idleAnimationIndex = 0;
        }

        this.drawingTools.drawSprite(sprite, this.x, this.y, this.centerX, this.centerY, -this.centerX, -this.centerY, 0, false, animationIndex);
    }


    drawRL() {
        let sprite = this.playerAngle < 0 ? 'RLinv' : 'RL';

        this.drawingTools.drawSprite(sprite, this.x, this.y + this.rlPlayerDistance, this.centerX - 1, this.centerY,
            -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - this.canonOffsetCenter), -this.playerAngle);
    }


    drawHand() {

        let xInc = this.playerAngle < 0 ? 17 : 0;
        let yInc = this.playerAngle < 0 ? 2 : 0;

        this.drawingTools.rect(this.x + 5 + xInc, this.y + 31 + yInc, 5, 5,
            this.centerX, this.centerY, -this.centerX, -this.centerY, -this.playerAngle, "handColor");

        this.drawingTools.rect(this.x + 5 + xInc, this.y + 31 + yInc, 5, 5,
            this.centerX, this.centerY, -this.centerX, -this.centerY, -this.playerAngle, "black", true, 2);
    }


    drawHealthBar() {

        let sprite;

        switch (this.health) {
            case 3:
                sprite = "healthBar_3";
                break;
            case 2:
                sprite = "healthBar_2";
                break;
            case 1:
                sprite = "healthBar_1";
                break;
            case 0:
                sprite = "healthBar_0";
                break;
        }

        this.drawingTools.drawSprite(sprite, this.x + 2, this.y - 12);
    }


    gotHit() {
        this.health -= 1;
        if (this.health <= 0) {
            this.health = 0;
        }
    }

}