export class Player {
    constructor(canvas, ctx, drawingTools, collisionDetector, perf) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.collisionDetector = collisionDetector;
        this.x = 200;
        this.y = 100;
        this.speed = 1.6;
        this.size = 26;
        this.spriteComp = 2;
        this.canonSizeX = 26;
        this.canonSizeY = 32;
        this.aimWidth = 1;
        this.aimSize = 0;
        this.projectionSize = 200;
        this.aimColor = "black";
        this.projectionColor = "red";
        this.centerX = this.x + this.size / 2 + this.spriteComp;
        this.centerY = this.y + this.size / 2 + this.spriteComp;
        this.canonOffsetCenter = 5;
        this.turnVelX = 0;
        this.turnVelY = 0;
        this.turnAngle = 0;
        this.playerAngle = -90 * Math.PI / 180;
        this.curOnCanvas = false;
        this.diagonalSpeedDiviser = 1.3;
        this.maxConcurringMissiles = 3;
        this.health = 3;
        this.rlPlayerDistance = 20;
        this.playerAnimationFrameDuration = perf === "normal" ? 7 : 14;
        this.runAnimationFrames = [
            ...new Array(this.playerAnimationFrameDuration).fill(1),
            ...new Array(this.playerAnimationFrameDuration).fill(2),
            ...new Array(this.playerAnimationFrameDuration).fill(3),
            ...new Array(this.playerAnimationFrameDuration).fill(4)
        ];
        this.idleAnimationFrames = [
            ...new Array(this.playerAnimationFrameDuration * 2).fill(1),
            ...new Array(this.playerAnimationFrameDuration * 2).fill(2)
        ];
        this.runAnimationIndex = 0;
        this.idleAnimationIndex = 0;
        this.isMoving = false;
        this.rollDuration = 150;
        this.rollIndex = 0;
        this.rolling = false;
        this.rollVel = { x: 0, y: 0 };
        this.rollSpeedMult = 2;

        this.updCenters = () => {
            this.centerX = this.x + this.size / 2 + this.spriteComp;
            this.centerY = this.y + this.size / 2 + this.spriteComp;
            //this.drawingTools.debugCirc(this.centerX, this.centerY, 15)
        }

        this.uuidv4 = () => {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        this.id = this.uuidv4();

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI;

        this.getFacingDir = () => {
            let degAngle = this.radToDeg(this.playerAngle);
            let dir;
            if (degAngle >= -22.5 && degAngle <= 22.5) {
                dir = { x: 0, y: 1 };
            }
            if (degAngle >= 22.5 && degAngle <= 67.5) {
                dir = { x: 1, y: 1 };
            }
            if (degAngle >= 67.5 && degAngle <= 112.5) {
                dir = { x: 1, y: 0 };
            }
            if (degAngle >= 112.5 && degAngle <= 157.5) {
                dir = { x: 1, y: -1 };
            }
            if (degAngle >= 157.5 || degAngle <= -157.5) {
                dir = { x: 0, y: -1 };
            }
            if (degAngle >= -157.5 && degAngle <= -112.5) {
                dir = { x: -1, y: -1 };
            }
            if (degAngle >= -112.5 && degAngle <= -67.5) {
                dir = { x: -1, y: 0 };
            }
            if (degAngle >= -67.5 && degAngle <= -22.5) {
                dir = { x: -1, y: 1 };
            }
            return dir;
        }
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

        let velX = collVel.velX * delta;
        let velY = collVel.velY * delta;

        if (this.rolling) {
            if (this.rollVel.x === 0 && this.rollVel.y === 0) {
                if (velX !== 0 || velY !== 0) {
                    this.rollVel.x = velX;
                    this.rollVel.y = velY;
                } 
                else if (velX === 0 && velY === 0) {
                    console.log("roll no dir")
                    let facingDir = this.getFacingDir();
                    if (facingDir.x && facingDir.y) {
                        facingDir.x /= this.diagonalSpeedDiviser;
                        facingDir.y /= this.diagonalSpeedDiviser;
                    }
                    this.rollVel.x = facingDir.x * delta;
                    this.rollVel.y = facingDir.y * delta;
                }
            }
            
            this.roll(delta);
        } 
        else {
            this.x += velX;
            this.y += velY;
        }

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

        } else {

            return false;
        }
    }

    mapCollHandler(vel, isColl) {

        let velX = 0;
        let velY = 0;

        if (isColl.length > 0) {

            isColl.forEach((v, i, a) => {

                if (v.type === 'left') {
                    this.x -= v.amount;
                    if (vel[1] < 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velY -= vel[0];
                        if (a.length === 1) {
                            velX = velX;
                        } else {
                            velX -= vel[1];
                        }
                    }
                } else if (v.type === 'right') {
                    this.x += v.amount;
                    if (vel[1] > 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velY -= vel[0];
                        if (a.length === 1) {
                            velX = velX;
                        } else {
                            velX -= vel[1];
                        }
                    }
                } else if (v.type === 'top') {
                    this.y -= v.amount;
                    if (vel[0] > 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velX += vel[1];
                        if (a.length === 1) {
                            velY = velY;
                        } else {
                            velY += vel[0];
                        }
                    }
                } else if (v.type === 'bottom') {
                    this.y += v.amount;
                    if (vel[0] < 0) {
                        velY -= vel[0];
                        velX += vel[1];
                    } else {
                        velX += vel[1];
                        if (a.length === 1) {
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

    roll(delta) {
        if (this.rollIndex < this.rollDuration) {
            console.log(this.rollVel.x, this.rollVel.y)
            
            this.x += this.rollVel.x*this.rollSpeedMult;
            this.y += this.rollVel.y*this.rollSpeedMult;
            
            this.rollIndex++;
        } 
        else {
            console.log("roll eneded")
            this.rolling = false;
            this.rollIndex = 0;
            this.rollVel.x = 0;
            this.rollVel.y = 0;
        }

        //console.log('rollllinn')
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

    getPlayerPos() {
        return { x: this.centerX, y: this.centerY }
    }

    getPlayerAngle(curPos) {
        return this.getAngle(curPos);
    }

    getPlayerSpecs() {
        return { baseSizeX: this.baseSizeX, baseSizeY: this.size, canonSizeX: this.canonSizeX, canonSizeY: this.canonSizeY }
    }

}