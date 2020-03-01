import { AbstractProjectile } from './AbstractProjectile.js';

export class GhostMissile extends AbstractProjectile {
    constructor(canvas, ctx, drawingTools, collisionDetector, id) {
        super (canvas, ctx, drawingTools, collisionDetector, null, null, null, id)
    }

    set(missile) {
        this.x = (Math.sin(missile.angle) * this.missileLaunchOffset) + missile.coords.x;
        this.y = (Math.cos(missile.angle) * this.missileLaunchOffset) + missile.coords.y;

        this.angle = missile.angle;

        this.vx = missile.vx;
        this.vy = missile.vy;
    }

    update(delta) {

        let hitX = this.x - this.width / 2;
        let hitY = this.y - this.height / 2 + 9;
        let coll = this.collisionDetector.mapMissileCollision(hitX, hitY, 6);

        if (coll) this.bounceCount++;

        if (this.bounceCount <= this.maxBounce) {
            
            if (coll === "left") {
                this.x--;
                this.vx = -this.vx;
                this.angle = -this.angle;
            }
            if (coll === "right") {
                this.x++;
                this.vx = -this.vx;
                this.angle = -this.angle;
            }
            if (coll === "top") {
                this.y--;
                this.vy = -this.vy;
                this.angle = -this.angle + 180 * Math.PI / 180;
            }
            if (coll === "bottom") {
                this.y++;
                this.vy = -this.vy;
                this.angle = -this.angle + 180 * Math.PI / 180;
            }

            this.x += this.vx * delta;
            this.y += this.vy * delta;

            if (!this.hide) {
                this.drawingTools.drawSprite('bullet',this.x - this.width / 2 - 1 , this.y - this.height / 2,
                this.x, this.y, -this.x, -this.y, -this.angle);
            }
            
        }
    }
}