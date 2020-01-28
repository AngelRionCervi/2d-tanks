export class MapManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = {"width":1000,"height":800,"coords":[{"x":550,"y":200,"w":100,"h":100},{"x":200,"y":50,"w":50,"h":50},{"x":200,"y":500,"w":50,"h":100},{"x":200,"y":50,"w":50,"h":50},{"x":250,"y":150,"w":50,"h":50},{"x":400,"y":150,"w":50,"h":50},{"x":550,"y":150,"w":50,"h":50},{"x":300,"y":200,"w":50,"h":50},{"x":0,"y":0,"w":1000,"h":1},{"x":0,"y":800,"w":1000,"h":1},{"x":0,"y":0,"w":1,"h":800},{"x":1000,"y":0,"w":0,"h":800}],"debugColliders":[[{"type":"yWall","x":553,"y":200,"w":97,"h":3},{"type":"yWall","x":553,"y":297,"w":97,"h":3},{"type":"xWall","x":550,"y":200,"w":3,"h":100},{"type":"xWall","x":647,"y":200,"w":3,"h":100}],[{"type":"yWall","x":203,"y":50,"w":47,"h":3},{"type":"yWall","x":203,"y":97,"w":47,"h":3},{"type":"xWall","x":200,"y":50,"w":3,"h":50},{"type":"xWall","x":247,"y":50,"w":3,"h":50}],[{"type":"yWall","x":203,"y":500,"w":47,"h":3},{"type":"yWall","x":203,"y":597,"w":47,"h":3},{"type":"xWall","x":200,"y":500,"w":3,"h":100},{"type":"xWall","x":247,"y":500,"w":3,"h":100}],[{"type":"yWall","x":203,"y":50,"w":47,"h":3},{"type":"yWall","x":203,"y":97,"w":47,"h":3},{"type":"xWall","x":200,"y":50,"w":3,"h":50},{"type":"xWall","x":247,"y":50,"w":3,"h":50}],[{"type":"yWall","x":253,"y":150,"w":47,"h":3},{"type":"yWall","x":253,"y":197,"w":47,"h":3},{"type":"xWall","x":250,"y":150,"w":3,"h":50},{"type":"xWall","x":297,"y":150,"w":3,"h":50}],[{"type":"yWall","x":403,"y":150,"w":47,"h":3},{"type":"yWall","x":403,"y":197,"w":47,"h":3},{"type":"xWall","x":400,"y":150,"w":3,"h":50},{"type":"xWall","x":447,"y":150,"w":3,"h":50}],[{"type":"yWall","x":553,"y":150,"w":47,"h":3},{"type":"yWall","x":553,"y":197,"w":47,"h":3},{"type":"xWall","x":550,"y":150,"w":3,"h":50},{"type":"xWall","x":597,"y":150,"w":3,"h":50}],[{"type":"yWall","x":303,"y":200,"w":47,"h":3},{"type":"yWall","x":303,"y":247,"w":47,"h":3},{"type":"xWall","x":300,"y":200,"w":3,"h":50},{"type":"xWall","x":347,"y":200,"w":3,"h":50}],[{"type":"yWall","x":3,"y":0,"w":997,"h":3},{"type":"yWall","x":3,"y":-2,"w":997,"h":3},{"type":"xWall","x":0,"y":0,"w":3,"h":1},{"type":"xWall","x":997,"y":0,"w":3,"h":1}],[{"type":"yWall","x":3,"y":800,"w":997,"h":3},{"type":"yWall","x":3,"y":798,"w":997,"h":3},{"type":"xWall","x":0,"y":800,"w":3,"h":1},{"type":"xWall","x":997,"y":800,"w":3,"h":1}],[{"type":"yWall","x":3,"y":0,"w":-2,"h":3},{"type":"yWall","x":3,"y":797,"w":-2,"h":3},{"type":"xWall","x":0,"y":0,"w":3,"h":800},{"type":"xWall","x":-2,"y":0,"w":3,"h":800}],[{"type":"yWall","x":1003,"y":0,"w":-3,"h":3},{"type":"yWall","x":1003,"y":797,"w":-3,"h":3},{"type":"xWall","x":1000,"y":0,"w":3,"h":800},{"type":"xWall","x":997,"y":0,"w":3,"h":800}]]};
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
        });      

        this.debugColliders(map.debugColliders);
    }

    debugColliders(colliders) {

        colliders.forEach((collider)=>{
            collider.forEach((v) => {
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
            
        })
        
    }

    getMap() {
        return this.map;
    }
}