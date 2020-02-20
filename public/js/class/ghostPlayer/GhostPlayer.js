export class GhostPlayer {
    constructor(canvas, ctx, drawingTools, id, perf) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.x = 200;
        this.y = 100;
        this.speed = 1.4;
        this.baseSizeX = 32;
        this.baseSizeY = 32;
        this.canonSizeX = 28;
        this.canonSizeY = 32;
        this.centerX = this.x + this.baseSizeX / 2;
        this.centerY = this.y + this.baseSizeY / 2;
        this.canonOffsetCenter = 5;
        this.playerAngle = -90 * Math.PI / 180;
        this.curOnCanvas = false;
        this.diagonalSpeedDiviser = 1.3;
        this.rlPlayerDistance = 20;
        this.playerAnimationFrameDuration = perf === "normal" ? 7 : 14;
        this.runAnimationFrames = [
            ...new Array(this.playerAnimationFrameDuration).fill(1), 
            ...new Array(this.playerAnimationFrameDuration).fill(2),
            ...new Array(this.playerAnimationFrameDuration).fill(3),
            ...new Array(this.playerAnimationFrameDuration).fill(4)
        ];
        this.idleAnimationFrames = [
            ...new Array(this.playerAnimationFrameDuration*2).fill(1), 
            ...new Array(this.playerAnimationFrameDuration*2).fill(2)
        ];
        this.runAnimationIndex = 0;
        this.idleAnimationIndex = 0;
        this.isMoving = false;

        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
        }

        this.id = id;

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI;
    }


    update(ghost, delta) {

        if (this.vx !== ghost.vx && this.vy !== ghost.vx) {
            this.x = ghost.coords.x;
            this.y = ghost.coords.y;
        }

        if (this.vx || this.vy) {
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }

        if (this.vx !== ghost.vx) this.vx = ghost.vx;
        if (this.vy !== ghost.vy) this.vy = ghost.vy;

        this.x += this.vx * delta;
        this.y += this.vy * delta;

        this.playerAngle = ghost.playerAngle;

        this.updCenters();
        this.drawSprites(ghost.sprite);
    }

    drawSprites(ghostSprite) {
        // draw base
        if (!this.playerAngle) {
            // draw canon
            this.drawPlayer(ghostSprite);
            this.drawRL();

        } else {

            let degAngle = this.radToDeg(this.playerAngle);

            if (!(degAngle >= -120 && degAngle <= 120)) {
                this.drawRL();
                this.drawPlayer(ghostSprite, true);
            } else {
                this.drawPlayer(ghostSprite);
                this.drawRL();
            }
        }
    }

    drawPlayer(ghostSprite, inv = null) {
        let sprite;

        let idleRun = this.isMoving ? "Run" : "Idle";
        let leftRight = this.playerAngle < 0 ? "Left" : "Right";
        let frontBack = inv ? "Back" : "Front";

        sprite = 'player' + idleRun + frontBack + leftRight;

        let animationIndex;

        if (this.isMoving) {
            animationIndex = this.runAnimationFrames[this.runAnimationIndex];
            this.runAnimationIndex++;
            if (this.runAnimationIndex > this.runAnimationFrames.length-1) this.runAnimationIndex = 0;
        } 
        else {
            animationIndex = this.idleAnimationFrames[this.idleAnimationIndex];
            this.idleAnimationIndex++;
            if (this.idleAnimationIndex > this.idleAnimationFrames.length-1) this.idleAnimationIndex = 0;
        }

        this.drawingTools.drawSprite(sprite, this.x, this.y, this.centerX, this.centerY, -this.centerX, -this.centerY, 0, ghostSprite, animationIndex);
    }

    drawRL() {
        let sprite = this.playerAngle < 0 ? 'RLinv' : 'RL';

        this.drawingTools.drawSprite(sprite, this.x, this.y + this.rlPlayerDistance, this.centerX-1, this.centerY, 
            -(this.x + this.canonSizeX / 2), -(this.y + this.canonSizeY / 2 - this.canonOffsetCenter), -this.playerAngle);
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