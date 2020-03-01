import { AbstractProjectile } from './AbstractProjectile.js';

export class Missile extends AbstractProjectile {
    constructor(canvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector) {
        super (canvas, ctx, drawingTools, collisionDetector, curPos, playerPos, playerAngle, null)
    }

    initDir() {
        let tx = this.shotPos.x - this.playerPos.x;
        let ty = this.shotPos.y - this.playerPos.y;

        let dist = this.collisionDetector.pointDistance(this.shotPos.x, this.shotPos.y, this.playerPos.x, this.playerPos.y);

        this.vx = (tx / dist) * this.speed;
        this.vy = (ty / dist) * this.speed;
    }

    draw(delta) {

        let hitX = this.x - this.width / 2;
        let hitY = this.y - this.height / 2 + 9;

        let coll = this.collisionDetector.mapMissileCollision(hitX, hitY, 6);

        if (coll) this.bounceCount++;

        if (this.bounceCount <= this.maxBounce) {
            
            if (coll === "left") {
                this.x--;
                this.vx = -this.vx;
                this.missileAngle = -this.missileAngle;
            }
            if (coll === "right") {
                this.x++;
                this.vx = -this.vx;
                this.missileAngle = -this.missileAngle;
            }
            if (coll === "top") {
                this.y--;
                this.vy = -this.vy;
                this.missileAngle = -this.missileAngle + 180 * Math.PI / 180;
            }
            if (coll === "bottom") {
                this.y++;
                this.vy = -this.vy;
                this.missileAngle = -this.missileAngle + 180 * Math.PI / 180;
            }

            this.x += this.vx * delta;
            this.y += this.vy * delta;

            if (!this.hide) {
                this.drawingTools.drawSprite('bullet',this.x - this.width / 2 - 1 , this.y - this.height / 2,
                this.x, this.y, -(this.x), -(this.y), -this.missileAngle);
            }
            
        }

        /* missile hitbox
        this.drawingTools.rect(this.x-this.width/2, this.y-this.height/2+9, this.width, this.height, 
        this.x, this.y, -this.x, -this.y, -this.missileAngle, 'blue', true);
        */
    }
}