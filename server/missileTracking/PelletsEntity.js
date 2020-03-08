module.exports = class Missile {
    constructor(curPos, playerPos, playerAngle, id, playerID, collisionDetector) {
        this.missileAngle = playerAngle;
        this.shotPos = curPos;
        this.playerPos = playerPos;
        this.id = id;
        this.playerID = playerID;
        this.collisionDetector = collisionDetector;
        this.vx;
        this.vy;
        this.width = 4 * 2;
        this.height = 6 * 2;
        this.x = playerPos.x;
        this.y = playerPos.y;
        this.radius = 6;
        this.speed = 2.2;
        this.fired = false;

        this.pelletCount = 5;
        this.spreadSize = 2;
        this.startSpreadAngle = -(this.spreadSize / 2);
        this.pellets = [];
        this.collidedPellets = [];

        for (let u = 0; u < this.pelletCount; u++) {
            this.startSpreadAngle += this.spreadSize / (this.pelletCount+1);
            this.pellets[u] = { x: this.x, y: this.y, vx: 0, vy: 0, id: "pellet_" + this.uuidv4, angle: this.missileAngle + this.startSpreadAngle };
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

    updatePos(delta) {

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
            }
        }
    }

    correctPos(x, y, angle) {
        /*
        this.pellets.forEach((pellet) => {
            pellet.x = x;
            pellet.y = y;
            pellet.angle = angle;
        })*/
    }

    updateDeltaPos(delta) {
        /*
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        */
    }
}