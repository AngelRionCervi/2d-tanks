export class GhostMissile {
    constructor(canvas, ctx, drawingTools, id) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.drawingTools = drawingTools;
        this.id = id;
        this.width = 4*2;
        this.height = 6*2;
        this.radius = 6;;
        this.speed = 2.2;
        this.x = 0;
        this.y = 0;
    }

 

    updatePos(x, y, angle) {

        this.x = x;
        this.y = y;
        
        this.drawingTools.drawSprite('bullet', this.x-this.width/2-1, this.y-this.height/2, 
        this.x, this.y, -this.x, -this.y, -angle);
      
    }
}