export class MapManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = {"width":1000,"height":800,"coords":[{"x":750,"y":350,"w":50,"h":100},{"x":200,"y":350,"w":50,"h":100},{"x":850,"y":250,"w":150,"h":50},{"x":850,"y":500,"w":150,"h":50},{"x":400,"y":250,"w":200,"h":300},{"x":0,"y":250,"w":150,"h":50},{"x":0,"y":500,"w":150,"h":50},{"x":800,"y":150,"w":50,"h":50},{"x":800,"y":600,"w":50,"h":50},{"x":150,"y":150,"w":50,"h":50},{"x":150,"y":600,"w":50,"h":50},{"x":950,"y":100,"w":50,"h":150},{"x":950,"y":300,"w":50,"h":200},{"x":950,"y":550,"w":50,"h":150},{"x":450,"y":100,"w":100,"h":100},{"x":450,"y":600,"w":100,"h":100},{"x":0,"y":100,"w":50,"h":150},{"x":0,"y":300,"w":50,"h":200},{"x":0,"y":550,"w":50,"h":150},{"x":900,"y":50,"w":50,"h":50},{"x":900,"y":700,"w":50,"h":50},{"x":50,"y":50,"w":50,"h":50},{"x":50,"y":700,"w":50,"h":50},{"x":100,"y":0,"w":800,"h":50},{"x":100,"y":750,"w":800,"h":50},{"x":100,"y":0,"w":800,"h":50},{"x":50,"y":50,"w":50,"h":50},{"x":900,"y":50,"w":50,"h":50},{"x":150,"y":150,"w":50,"h":50},{"x":800,"y":150,"w":50,"h":50},{"x":0,"y":250,"w":150,"h":50},{"x":850,"y":250,"w":150,"h":50}]};
        this.blockColor = "black";
    }

    renderMap(map) {
        let width = map.width;
        let height = map.height;
        let blockCoords = map.coords;

        this.canvas.width = width;
        this.canvas.height = height;

        blockCoords.forEach(v => {
            this.ctx.beginPath();
            this.ctx.rect(v.x, v.y, v.w, v.h);
            this.ctx.fillStyle = this.blockColor;    
            this.ctx.closePath();
            this.ctx.fill();

            //this.debugColliders(v.blockColliders);
        });      
    }

    debugColliders(colliders) {

        colliders.forEach((v)=>{
            let fillStyle
            if (v.type === "yWall") {
                fillStyle = "red";
            } else {
                fillStyle = "green";
            }
            this.ctx.beginPath();
            this.ctx.rect(v.x, v.y, v.w, v.h);
            this.ctx.fillStyle = fillStyle;    
            this.ctx.closePath();
            this.ctx.fill();
        })
        
    }

    getMap() {
        return this.map;
    }
}