export class MapManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = {"width":1000,"height":800,"coords":[{"x":900,"y":700,"w":100,"h":100},{"x":250,"y":700,"w":150,"h":100},{"x":850,"y":150,"w":50,"h":100},{"x":700,"y":150,"w":100,"h":50},{"x":700,"y":300,"w":100,"h":50},{"x":600,"y":150,"w":50,"h":100},{"x":800,"y":100,"w":50,"h":50},{"x":800,"y":250,"w":50,"h":50},{"x":800,"y":350,"w":50,"h":50},{"x":650,"y":100,"w":50,"h":50},{"x":650,"y":250,"w":50,"h":50},{"x":300,"y":0,"w":50,"h":200},{"x":400,"y":100,"w":150,"h":50},{"x":650,"y":100,"w":50,"h":50},{"x":800,"y":100,"w":50,"h":50},{"x":100,"y":150,"w":50,"h":50},{"x":700,"y":150,"w":100,"h":50},{"x":200,"y":200,"w":50,"h":50},{"x":550,"y":250,"w":50,"h":50},{"x":150,"y":300,"w":100,"h":50},{"x":500,"y":300,"w":50,"h":50},{"x":450,"y":400,"w":50,"h":50},{"x":750,"y":500,"w":50,"h":50}],"debugColliders":[[{"type":"yWall","x":903,"y":700,"w":97,"h":3},{"type":"yWall","x":903,"y":797,"w":97,"h":3},{"type":"xWall","x":900,"y":700,"w":3,"h":100},{"type":"xWall","x":997,"y":700,"w":3,"h":100}],[{"type":"yWall","x":253,"y":700,"w":147,"h":3},{"type":"yWall","x":253,"y":797,"w":147,"h":3},{"type":"xWall","x":250,"y":700,"w":3,"h":100},{"type":"xWall","x":397,"y":700,"w":3,"h":100}],[{"type":"yWall","x":853,"y":150,"w":47,"h":3},{"type":"yWall","x":853,"y":247,"w":47,"h":3},{"type":"xWall","x":850,"y":150,"w":3,"h":100},{"type":"xWall","x":897,"y":150,"w":3,"h":100}],[{"type":"yWall","x":703,"y":150,"w":97,"h":3},{"type":"yWall","x":703,"y":197,"w":97,"h":3},{"type":"xWall","x":700,"y":150,"w":3,"h":50},{"type":"xWall","x":797,"y":150,"w":3,"h":50}],[{"type":"yWall","x":703,"y":300,"w":97,"h":3},{"type":"yWall","x":703,"y":347,"w":97,"h":3},{"type":"xWall","x":700,"y":300,"w":3,"h":50},{"type":"xWall","x":797,"y":300,"w":3,"h":50}],[{"type":"yWall","x":603,"y":150,"w":47,"h":3},{"type":"yWall","x":603,"y":247,"w":47,"h":3},{"type":"xWall","x":600,"y":150,"w":3,"h":100},{"type":"xWall","x":647,"y":150,"w":3,"h":100}],[{"type":"yWall","x":803,"y":100,"w":47,"h":3},{"type":"yWall","x":803,"y":147,"w":47,"h":3},{"type":"xWall","x":800,"y":100,"w":3,"h":50},{"type":"xWall","x":847,"y":100,"w":3,"h":50}],[{"type":"yWall","x":803,"y":250,"w":47,"h":3},{"type":"yWall","x":803,"y":297,"w":47,"h":3},{"type":"xWall","x":800,"y":250,"w":3,"h":50},{"type":"xWall","x":847,"y":250,"w":3,"h":50}],[{"type":"yWall","x":803,"y":350,"w":47,"h":3},{"type":"yWall","x":803,"y":397,"w":47,"h":3},{"type":"xWall","x":800,"y":350,"w":3,"h":50},{"type":"xWall","x":847,"y":350,"w":3,"h":50}],[{"type":"yWall","x":653,"y":100,"w":47,"h":3},{"type":"yWall","x":653,"y":147,"w":47,"h":3},{"type":"xWall","x":650,"y":100,"w":3,"h":50},{"type":"xWall","x":697,"y":100,"w":3,"h":50}],[{"type":"yWall","x":653,"y":250,"w":47,"h":3},{"type":"yWall","x":653,"y":297,"w":47,"h":3},{"type":"xWall","x":650,"y":250,"w":3,"h":50},{"type":"xWall","x":697,"y":250,"w":3,"h":50}],[{"type":"yWall","x":303,"y":0,"w":47,"h":3},{"type":"yWall","x":303,"y":197,"w":47,"h":3},{"type":"xWall","x":300,"y":0,"w":3,"h":200},{"type":"xWall","x":347,"y":0,"w":3,"h":200}],[{"type":"yWall","x":403,"y":100,"w":147,"h":3},{"type":"yWall","x":403,"y":147,"w":147,"h":3},{"type":"xWall","x":400,"y":100,"w":3,"h":50},{"type":"xWall","x":547,"y":100,"w":3,"h":50}],[{"type":"yWall","x":653,"y":100,"w":47,"h":3},{"type":"yWall","x":653,"y":147,"w":47,"h":3},{"type":"xWall","x":650,"y":100,"w":3,"h":50},{"type":"xWall","x":697,"y":100,"w":3,"h":50}],[{"type":"yWall","x":803,"y":100,"w":47,"h":3},{"type":"yWall","x":803,"y":147,"w":47,"h":3},{"type":"xWall","x":800,"y":100,"w":3,"h":50},{"type":"xWall","x":847,"y":100,"w":3,"h":50}],[{"type":"yWall","x":103,"y":150,"w":47,"h":3},{"type":"yWall","x":103,"y":197,"w":47,"h":3},{"type":"xWall","x":100,"y":150,"w":3,"h":50},{"type":"xWall","x":147,"y":150,"w":3,"h":50}],[{"type":"yWall","x":703,"y":150,"w":97,"h":3},{"type":"yWall","x":703,"y":197,"w":97,"h":3},{"type":"xWall","x":700,"y":150,"w":3,"h":50},{"type":"xWall","x":797,"y":150,"w":3,"h":50}],[{"type":"yWall","x":203,"y":200,"w":47,"h":3},{"type":"yWall","x":203,"y":247,"w":47,"h":3},{"type":"xWall","x":200,"y":200,"w":3,"h":50},{"type":"xWall","x":247,"y":200,"w":3,"h":50}],[{"type":"yWall","x":553,"y":250,"w":47,"h":3},{"type":"yWall","x":553,"y":297,"w":47,"h":3},{"type":"xWall","x":550,"y":250,"w":3,"h":50},{"type":"xWall","x":597,"y":250,"w":3,"h":50}],[{"type":"yWall","x":153,"y":300,"w":97,"h":3},{"type":"yWall","x":153,"y":347,"w":97,"h":3},{"type":"xWall","x":150,"y":300,"w":3,"h":50},{"type":"xWall","x":247,"y":300,"w":3,"h":50}],[{"type":"yWall","x":503,"y":300,"w":47,"h":3},{"type":"yWall","x":503,"y":347,"w":47,"h":3},{"type":"xWall","x":500,"y":300,"w":3,"h":50},{"type":"xWall","x":547,"y":300,"w":3,"h":50}],[{"type":"yWall","x":453,"y":400,"w":47,"h":3},{"type":"yWall","x":453,"y":447,"w":47,"h":3},{"type":"xWall","x":450,"y":400,"w":3,"h":50},{"type":"xWall","x":497,"y":400,"w":3,"h":50}],[{"type":"yWall","x":753,"y":500,"w":47,"h":3},{"type":"yWall","x":753,"y":547,"w":47,"h":3},{"type":"xWall","x":750,"y":500,"w":3,"h":50},{"type":"xWall","x":797,"y":500,"w":3,"h":50}]]};
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