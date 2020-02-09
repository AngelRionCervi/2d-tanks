module.exports = class PlayerEntity {
    constructor(id, spawnPos, collisionDetector) {
        this.id = id;
        this.collisionDetector = collisionDetector;
        this.speed = 1.5;
        this.baseSizeX = 32;
        this.baseSizeY = 32;
        this.centerX = this.x + this.baseSizeX / 2;
        this.centerY = this.y + this.baseSizeY / 2;
        this.x = spawnPos.x;
        this.y = spawnPos.y;
        this.lastKeys = {x: 0, y: 0};
        this.diagonalSpeedDiviser = 1.3;
        this.playerAngle = 0;

        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
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

        let isColl = this.collisionDetector.mapPlayerCollision(this.centerX, this.centerY, this.baseSizeY);

        let collVel = this.mapCollHandler(vel, isColl);

        if (collVel.velX && collVel.velY) {
            collVel.velX = collVel.velX/this.diagonalSpeedDiviser;
            collVel.velY = collVel.velY/this.diagonalSpeedDiviser;
        }
        
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
    
}