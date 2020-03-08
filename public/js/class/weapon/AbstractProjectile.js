export class AbstractProjectile {
    constructor(canvas, ctx, drawingTools, collisionDetector, curPos = null, playerPos = null, playerAngle = null,  id = null) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.collisionDetector = collisionDetector;
        this.missileAngle = playerAngle;
        this.playerPos = playerPos;
        this.id = id;
        this.vx;
        this.vy;
        this.width = 4 * 2;
        this.height = 6 * 2;
        this.radius = 6;
        this.color = "blue";
        this.speed = 2.2;
        this.shotPos = curPos;
        this.lastColl = [];
        this.bounceCount = 0;
        this.maxBounce = 1;
        this.missileLaunchOffset = 40;
        this.hide = false;
        this.fired = false;
        
        if (this.playerPos) {
            this.x = Math.sin(this.missileAngle) * this.missileLaunchOffset + playerPos.x;
            this.y = Math.cos(this.missileAngle) * this.missileLaunchOffset + playerPos.y;
        }
        
        this.uuidv4 = () => {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        this.id = id ? id : this.uuidv4();
    }

    
}