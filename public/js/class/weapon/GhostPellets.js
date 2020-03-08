import { AbstractProjectile } from './AbstractProjectile.js';

export class GhostPellets extends AbstractProjectile {
    constructor(canvas, ctx, drawingTools, collisionDetector, id, pellets) {
        super (canvas, ctx, drawingTools, collisionDetector, null, null, null, id)
        this.pellets = pellets;
        this.collidedPellets = [];
    }

    set() {
        
        if (this.pellets) {
            console.log(this.pellets);
        }

        this.pellets.forEach((pellet) => {
            pellet.vx = pellet.vx;
            pellet.vy = pellet.vy;
        })
    }

    update(delta) {
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
    }
    
}