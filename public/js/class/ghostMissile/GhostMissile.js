export class GhostMissile {
    constructor(canvas, ctx, drawingTools, id, collisionDetector) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.id = id;
        this.collisionDetector = collisionDetector;
        this.width = 4*2;
        this.height = 6*2;
        this.x;
        this.y;
        this.vx;
        this.vy;
        this.angle;
        this.missileLaunchOffset = 40;
        this.maxBounce = 1;
        this.bounceCount = 0;
    }

    set(missile) {
        this.x = (Math.sin(missile.angle) * this.missileLaunchOffset) + missile.coords.x;
        this.y = (Math.cos(missile.angle) * this.missileLaunchOffset) + missile.coords.y;

        this.angle = missile.angle;

        this.vx = missile.vx;
        this.vy = missile.vy;
    }

    update() {

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

            this.x += this.vx;
            this.y += this.vy;

            this.drawingTools.drawSprite('bullet',this.x - this.width / 2 - 1 , this.y - this.height / 2,
            this.x, this.y, -(this.x), -(this.y), -this.angle);
        }
    }
}