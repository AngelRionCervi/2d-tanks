import { AbstractProjectile } from './AbstractProjectile.js';

export class Pellets extends AbstractProjectile {
    constructor(canvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector) {
        super(canvas, ctx, drawingTools, collisionDetector, curPos, playerPos, playerAngle, null);
        this.pelletCount = 5;
        this.spreadSize = 2;
        this.startSpreadAngle = -(this.spreadSize / 2);
        this.pellets = [];
        this.collidedPellets = [];
        this.pelletIds = [];

        for (let u = 0; u < this.pelletCount; u++) {
            this.pelletIds[u] = "pellet_" + this.uuidv4();
            this.startSpreadAngle += this.spreadSize / (this.pelletCount + 1);
            this.pellets[u] = { x: this.x, y: this.y, vx: 0, vy: 0, id: this.pelletIds[u], angle: this.missileAngle + this.startSpreadAngle };
        }
    }

    initDir() {
        let dist = this.collisionDetector.pointDistance(this.shotPos.x, this.shotPos.y, this.playerPos.x, this.playerPos.y);

        this.pellets.forEach((pellet) => {
            let tx = dist * Math.sin(pellet.angle);
            let ty = dist * Math.cos(pellet.angle);

            pellet.vx = (tx / dist) * this.speed;
            pellet.vy = (ty / dist) * this.speed;
        })

        this.fired = true;
    }

    draw(delta) {

        for (let u = 0; u < this.pellets.length; u++) {
            let hitX = this.pellets[u].x - this.width / 2;
            let hitY = this.pellets[u].y - this.height / 2 + 9;

            let coll = this.collisionDetector.mapMissileCollision(hitX, hitY, 6);

            if (coll) {
                this.collidedPellets.push({ x: this.pellets[u].x, y: this.pellets[u].y, id: this.pellets[u].id })
                this.pellets.splice(u, 1);
            }

            if (this.pellets[u]) {
                this.pellets[u].x += this.pellets[u].vx * delta;
                this.pellets[u].y += this.pellets[u].vy * delta;

                this.drawingTools.drawSprite('shotgunAmmo', this.pellets[u].x - this.width / 2 - 1, this.pellets[u].y - this.height / 2,
                    this.pellets[u].x, this.pellets[u].y, -(this.pellets[u].x), -(this.pellets[u].y), -this.pellets[u].angle);
            }
        }

        /* missile hitbox
        this.drawingTools.rect(this.x-this.width/2, this.y-this.height/2+9, this.width, this.height, 
        this.x, this.y, -this.x, -this.y, -this.missileAngle, 'blue', true);
        */
    }
}