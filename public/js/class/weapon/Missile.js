export class Missile {
    constructor(canvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.collisionDetector = collisionDetector;
        this.missileAngle = playerAngle;
        this.vx;
        this.vy;
        this.width = 4*2;
        this.height = 6*2;
        this.x = playerPos.x;
        this.y = playerPos.y;
        this.radius = 6;
        this.color = "blue";
        this.speed = 2.2;
        this.shotPos = curPos;
        this.playerPos = playerPos;
        this.lastColl = [];

        this.uuidv4 = () => {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
              (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
          }

        this.id = this.uuidv4();
    }

    initDir() {
        let tx = this.shotPos.x - this.playerPos.x;
        let ty = this.shotPos.y - this.playerPos.y;

        this.drawingTools.circ(tx, ty, 3, 0, Math.PI*180, false, 'blue');

        let dist = this.collisionDetector.pointDistance(this.shotPos.x, this.shotPos.y, this.playerPos.x, this.playerPos.y);

        this.vx = (tx / dist) * this.speed;
        this.vy = (ty / dist) * this.speed;
    }

    draw() {

        let hitX = this.x-this.width/2;
        let hitY = this.y-this.height/2+9;

        let coll = this.collisionDetector.mapMissileCollision(hitX, hitY, 6);

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
            this.missileAngle = -this.missileAngle + 180*Math.PI/180;
        }
        if (coll === "bottom") {
            this.y++;
            this.vy = -this.vy;
            this.missileAngle = -this.missileAngle + 180*Math.PI/180;
        }

        this.x += this.vx;
        this.y += this.vy;
        
        this.drawingTools.drawSprite('bullet', this.x-this.width/2-1, this.y-this.height/2, 
        this.x, this.y, -this.x, -this.y, -this.missileAngle);

        /* missile hitbox
        this.drawingTools.rect(this.x-this.width/2, this.y-this.height/2+9, this.width, this.height, 
        this.x, this.y, -this.x, -this.y, -this.missileAngle, 'blue', true);
        */
    }
}