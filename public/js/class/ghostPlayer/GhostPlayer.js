export class GhostPlayer {
    constructor(canvas, ctx, drawingTools, id) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.x = 200;
        this.y = 100;
        this.speed = 1.5;
        this.baseSizeX = 32;
        this.baseSizeY = 32;
        this.canonSizeX = 28;
        this.canonSizeY = 32;
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
        this.playerAngle = -90 * Math.PI / 180;
        this.turnSpeedMult = 0.1;
        this.curOnCanvas = false;
        this.firstBounce = '';
        this.secondBounce = '';
        this.diagonalSpeedDiviser = 1.3;


        this.updCenters = () => {
            this.centerX = this.x + this.baseSizeX / 2;
            this.centerY = this.y + this.baseSizeY / 2;
        }

        this.id = id;

        this.getAngle = (curPos) => Math.atan2(curPos.x - this.centerX, curPos.y - this.centerY);
        this.radToDeg = (rad) => rad * 180 / Math.PI;
    }

    update(ghost) {

        //let walkAnimation = this.walkAnimation();

        this.x = ghost.coords.x;
        this.y = ghost.coords.y;

        this.playerAngle = ghost.playerAngle;

        /*
        if (collVel.velX || collVel.velY) {
            this.y += walkAnimation;
        }*/

        this.updCenters();
        this.drawSprites();
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
            this.drawPlayer();
            this.drawRL();

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