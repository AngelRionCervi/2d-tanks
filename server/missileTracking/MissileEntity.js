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
        this.lastColl = [];
        this.bounceCount = 0;
        this.maxBounce = 1;
    }

    initDir() {
        let tx = this.shotPos.x - this.playerPos.x;
        let ty = this.shotPos.y - this.playerPos.y;

        let dist = this.collisionDetector.pointDistance(this.shotPos.x, this.shotPos.y, this.playerPos.x, this.playerPos.y);

        this.vx = (tx / dist) * this.speed;
        this.vy = (ty / dist) * this.speed;
    }

    updatePos() {

        let hitX = this.x - this.width / 2;
        let hitY = this.y - this.height / 2 + 9;

        let coll = this.collisionDetector.mapMissileCollision(hitX, hitY, 6);

        if (coll) this.bounceCount++;

        if (this.bounceCount <= 1) {

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

            this.x += this.vx;
            this.y += this.vy;
        }
    }

    correctPos(x, y, angle) {
        this.x = x;
        this.y = y;
        this.missileAngle = angle;
    }

    updateDeltaPos(delta) {
        this.x += this.vx * delta;
        this.y += this.vy * delta;
    }
}