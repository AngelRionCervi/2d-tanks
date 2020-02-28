module.exports = class PlayerEntity {
    constructor(id, spawnPos, collisionDetector) {
        this.id = id;
        this.collisionDetector = collisionDetector;
        this.speed = 1.6;
        this.size = 26;
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

        this.updCenters = () => {
            this.centerX = this.x + this.size / 2 + this.spriteComp;
            this.centerY = this.y + this.size / 2 + this.spriteComp;
        }

    }

    updateKeys(playerKeys) {

        this.lastKeys = playerKeys.keys;
    }

    updatePlayerAngle(playerAngle) {

        this.playerAngle = playerAngle;
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

        this.x += collVel.velX;
        this.y += collVel.velY;

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

    gotHit() {
        this.health -= 1;
        if (this.health <= 0) {
            console.log("player : " + this.id + " is dead");
            this.health = 0;
        }
    }
}