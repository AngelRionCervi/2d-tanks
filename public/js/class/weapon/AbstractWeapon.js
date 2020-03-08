export class AbstractWeapon {
    constructor(ctx, drawingTools, playerPos, playerAbsolutePos, playerAngle) {
        this.ctx = ctx;
        this.drawingTools = drawingTools;
        this.playerPos = playerPos;
        this.playerAbsolutePos = playerAbsolutePos;
        this.playerAngle = playerAngle;
        this.doesExplode;
        this.fireOnHold;
        this.bulletsPerFire;
    }

    draw(weapon, pos, absolutePos, angle) {
        this.playerPos = pos;
        this.playerAbsolutePos = absolutePos;
        this.playerAngle = angle;
        
        let sprite = this.playerAngle < 0 ? weapon + 'inv' : weapon;

        this.drawingTools.drawSprite(sprite, this.playerAbsolutePos.x,this.playerAbsolutePos.y + 20, this.playerPos.x - 1, this.playerPos.y,
            -(this.playerAbsolutePos.x + this.width / 2), -(this.playerAbsolutePos.y + this.height / 2 - 5), -this.playerAngle);
    }
}