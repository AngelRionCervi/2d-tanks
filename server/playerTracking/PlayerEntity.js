module.exports = class PlayerEntity {
    constructor(id, spawnPos, collisionDetector) {
        this.id = id;
        this.collisionDetector = collisionDetector;
        this.speed = 1.4;
        this.size = 26;
        this.rollingAccel = 0.015;
        this.accel = 0.005;
        this.maxAccel = 0.2;
        this.maxRollingAccel = 0.3;
        this.decelerationMult = 1;
        this.rollingDecelerationMult = 0.8;
        this.buildedAccelX = 0;
        this.buildedAccelY = 0;
        this.spriteComp = 2;
        this.centerX = this.x + this.size / 2 + this.spriteComp;
        this.centerY = this.y + this.size / 2 + this.spriteComp;
        this.x = spawnPos.x;
        this.y = spawnPos.y;
        this.lastKeys = { x: 0, y: 0 };
        this.diagonalSpeedDiviser = 1.3;
        this.playerAngle = 0;
        this.vx = 0;
        this.vy = 0;
        this.health = 3;
        this.rollDuration = 300;
        this.rollElapsedMS = 0;
        this.rollStartTime = 0;
        this.rolling = false;
        this.rollVel = { x: 0, y: 0 };
        this.rollSpeedMult = 2;
        this.rollEndTime = 0;
        this.rollTimeout = 200;
        this.rollTimeoutCount = 0;
        this.rollTimeoutDone = true;
        this.addedRollVel = { x: 0, y: 0 };
        this.currentGun;

        this.updCenters = () => {
            this.centerX = this.x + this.size / 2 + this.spriteComp;
            this.centerY = this.y + this.size / 2 + this.spriteComp;
        }
    }

    radToDeg(rad) {
        return rad * 180 / Math.PI;
    } 

    getFacingDir() {
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

    updateKeys(playerKeys) {

        this.lastKeys = playerKeys.keys;
    }

    updatePlayerAngle(playerAngle) {

        this.playerAngle = playerAngle;
    }

    isMoving() {
        if (this.vx || this.vy) {
            return true;
        }
        else {
            return false;
        }
    }

    updatePos() {

        let vel = [this.lastKeys.y, this.lastKeys.x];

        let isColl = this.collisionDetector.mapPlayerCollision(this.centerX, this.centerY, this.size);

        let collVel = this.mapCollHandler(vel, isColl);

        if (collVel.velX && collVel.velY) {
            collVel.velX = collVel.velX / this.diagonalSpeedDiviser;
            collVel.velY = collVel.velY / this.diagonalSpeedDiviser;
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

        if (this.rolling && this.isMoving()) {
            console.log("server rolllling")
            this.accelerate(this.rollVel.x, this.rollVel.y);
            if (this.rollVel.x === 0 && this.rollVel.y === 0) {
                if (this.vx === 0 && this.vy === 0) {
                    this.rolling = false;
                } else {
                    this.rollStartTime = Date.now();
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

        let fVelX;
        let fVelY;

        if (this.rolling) {
            fVelX = this.addedRollVel.x + this.buildedAccelX;
            fVelY = this.addedRollVel.y + this.buildedAccelY;
        } else {
            fVelX = this.vx + this.buildedAccelX;
            fVelY = this.vy + this.buildedAccelY;
        }
/*
        if (fVelX !== 0 || fVelY !== 0) {
            console.log(this.x, this.y)
        }*/

        this.x += fVelX;
        this.y += fVelY;

        this.updCenters();

    }

    correctPos(x, y) {
        this.x = x;
        this.y = y;
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

    accelerate(vx, vy) {

        let accel = this.rolling ? this.rollingAccel : this.accel
        let maxAccel = this.rolling ? this.maxRollingAccel : this.maxAccel
        let decelerationMult = this.rolling ? this.rollingDecelerationMult : this.decelerationMult;

        if (vx > 0) {
            if (this.buildedAccelX < maxAccel) this.buildedAccelX += accel;
        } else if (vx < 0) {
            if (this.buildedAccelX > -maxAccel) this.buildedAccelX -= accel;
        }

        if (vy > 0) {
            if (this.buildedAccelY < maxAccel) this.buildedAccelY += accel;
        } else if (vy < 0) {
            if (this.buildedAccelY > -maxAccel) this.buildedAccelY -= accel;
        }

        if (vx === 0) {
            if (this.buildedAccelX > 0) {
                this.buildedAccelX -= accel * decelerationMult;
            } else if (this.buildedAccelX < 0) {
                this.buildedAccelX += accel * decelerationMult;
            }
        }

        if (vy === 0) {
            if (this.buildedAccelY > 0) {
                this.buildedAccelY -= accel * decelerationMult;
            } else if (this.buildedAccelY < 0) {
                this.buildedAccelY += accel * decelerationMult;
            }
        }

       
        this.buildedAccelX = roundTo(this.buildedAccelX, 3);
        this.buildedAccelY = roundTo(this.buildedAccelY, 3);

        if (Math.abs(this.buildedAccelX) < this.accel) this.buildedAccelX = 0;
        if (Math.abs(this.buildedAccelY) < this.accel) this.buildedAccelY = 0;

        /*
        if (this.buildedAccelX !== 0 || this.buildedAccelY !== 0) {
            console.log(this.buildedAccelX, this.buildedAccelY)
        }*/
    }


    roll() {
        if (this.rollElapsedMS < this.rollDuration) {
            this.addedRollVel.x = this.rollVel.x * this.rollSpeedMult;
            this.addedRollVel.y = this.rollVel.y * this.rollSpeedMult;
            this.rollElapsedMS = Date.now() - this.rollStartTime;
        }
        else {
            console.log("roll ended serv")
            this.rolling = false;
            this.rollElapsedMS = 0;
            this.rollStartTime = 0;
            this.rollVel.x = 0;
            this.rollVel.y = 0;
            this.rollEndTime = Date.now();
        }
    }

    
    gotHit() {
        this.health -= 1;
        if (this.health <= 0) {
            console.log("player : " + this.id + " is dead");
            this.health = 0;
        }
    }
}