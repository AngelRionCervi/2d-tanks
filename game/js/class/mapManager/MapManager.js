export class MapManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = {"width":500,"height":500,"blockSize":50,"coords":[{"id":54,"x":250,"y":200,"block":true}]};
        this.blockColor = "black";
    }

    renderMap(map) {
        let width = map.width;
        let height = map.height;
        let blockSize = map.blockSize;
        let blockCoords = map.coords;

        this.canvas.width = width;
        this.canvas.height = height;

        blockCoords.forEach(v => {
            this.ctx.beginPath();
            this.ctx.rect(v.x, v.y, blockSize, blockSize);
            this.fillStyle = this.blockColor;    
            this.ctx.closePath();
            this.ctx.fill();
        });
                
    }

    getMap() {
        return this.map;
    }
}