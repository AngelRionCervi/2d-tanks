export class AbstractPlayer {
    constructor(canvas, ctx, drawingTools, id = null, collisionDetector = null,) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.collisionDetector = collisionDetector;
        this.x = 200;
        this.y = 100;
        this.id = id;
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
        this.playerAnimationFrameDuration = 14;
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
        this.rollDuration = 300;
        this.rollElapsedMS = 0;
        this.rollStartTime = 0;
        this.rolling = false;
        this.rollVel = { x: 0, y: 0 };
        this.rollSpeedMult = 1.6;
        this.vx = 0;
        this.vy = 0;
        this.id = this.id ? this.id : this.uuidv4();
    }

    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
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

    radToDeg(rad) {
        return rad * 180 / Math.PI;
    } 

    getAngle (curPos) {
        return Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
    }

    updCenters() {
        this.centerX = this.x + this.size / 2 + this.spriteComp;
        this.centerY = this.y + this.size / 2 + this.spriteComp;
    }

    getPlayerPos() {
        return { x: this.centerX, y: this.centerY }
    }

    getPlayerAngle(curPos) {
        return this.getAngle(curPos);
    }
}