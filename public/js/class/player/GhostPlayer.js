import { AbstractPlayer } from "./AbstractPlayer.js";

export class GhostPlayer extends AbstractPlayer {
    constructor(canvas, ctx, drawingTools, id, collisionDetector, x, y) {
        super(canvas, ctx, drawingTools, id, collisionDetector);
        this.setPos(x, y)
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    update(ghost, delta) {
        
        if (this.vx !== ghost.vx && this.vy !== ghost.vy && !this.rolling) {
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

        let isColl = this.collisionDetector.mapPlayerCollision(this.centerX, this.centerY, this.size);
        this.mapCollHandler([this.vy, this.vx], isColl);
        
        if (this.rolling) {
            this.accelerate(this.rollVel.x, this.rollVel.y);
            if (this.rollVel.x === 0 && this.rollVel.y === 0) {
                this.rollStartTime = Date.now(); 
                console.log("GHOST ROLL")
                if (this.vx === 0 && this.vy === 0) {
                    this.rolling = false;
                } 
                else if (this.vx !== 0 || this.vy !== 0) {
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

        if (fVelX !== 0 || fVelY !== 0) {
            //console.log(this.x, this.y)
            //console.log(fVelX, fVelY)
        }

        this.playerAngle = ghost.playerAngle;

        this.updCenters();
        this.drawSprites(ghost.sprite);
    }

    drawSprites(ghostSprite) {

        this.drawShadow();

        if (!this.playerAngle) {
            this.drawPlayer(ghostSprite);
            this.drawRL();
            this.drawHand(ghostSprite);
        } 
        else {
            let degAngle = this.radToDeg(this.playerAngle);

            if (!(degAngle >= -120 && degAngle <= 120)) {
                this.drawRL();
                this.drawHand(ghostSprite);
                this.drawPlayer(ghostSprite, true);
            } else {
                this.drawPlayer(ghostSprite);
                this.drawRL();
                this.drawHand(ghostSprite);
            }
        }

        this.drawHealthBar();
    }

    drawShadow() {

        this.drawingTools.drawSprite('shadow', this.x + 2, this.y + 2, this.centerX, this.centerY, -this.centerX, -this.centerY);
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

    drawHand(ghostSprite) {

        let xInc = this.playerAngle < 0 ? 17 : 0;
        let yInc = this.playerAngle < 0 ? 2 : 0;

        this.drawingTools.rect(this.x + 5 + xInc, this.y + 31 + yInc, 5, 5,
            this.centerX, this.centerY, -this.centerX, -this.centerY, -this.playerAngle, "ghostColor", false, false, ghostSprite);

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

        this.drawingTools.drawSprite(sprite, this.x + 2 , this.y - 12);
    }

    gotHit() {
        this.health -= 1;
        if (this.health <= 0) {
            this.health = 0;
        }
    }

}