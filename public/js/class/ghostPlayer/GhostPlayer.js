export class GhostPlayer {
    constructor(canvas, ctx, drawingTools, id) {
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


        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
        }

        this.id = id;

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI;
    }


    update(ghost) {

        if (this.vx !== ghost.vx && this.vy !== ghost.vx) {
            this.x = ghost.coords.x;
            this.y = ghost.coords.y;
        }

        this.vx = ghost.vx;
        this.vy = ghost.vy;
        
        this.x += this.vx;
        this.y += this.vy;

        this.playerAngle = ghost.playerAngle;

        this.updCenters();
        this.drawSprites(ghost.sprite);
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
        let spriteType;
        //console.log(ghostSprite)

        if (inv) {
            if (this.playerAngle < 0) {
                spriteType = 'playerBackLeft';
            } else {
                spriteType = 'playerBackRight';
            }
        } else {
            if (this.playerAngle < 0) {
                spriteType = 'playerFrontLeft';
            } else {
                spriteType = 'playerFrontRight';
            }
        }

        this.drawingTools.drawSprite(spriteType, this.x, this.y, this.centerX, this.centerY, -this.centerX, -this.centerY, 0, ghostSprite);
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