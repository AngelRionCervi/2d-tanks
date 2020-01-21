export class MapManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = {"width":500,"height":500,"blockSize":50,"coords":[{"id":20,"x":100,"y":0,"block":true},{"id":29,"x":100,"y":450,"block":true},{"id":30,"x":150,"y":0,"block":true},{"id":31,"x":150,"y":50,"block":true},{"id":38,"x":150,"y":400,"block":true},{"id":39,"x":150,"y":450,"block":true},{"id":40,"x":200,"y":0,"block":true},{"id":41,"x":200,"y":50,"block":true},{"id":44,"x":200,"y":200,"block":true},{"id":45,"x":200,"y":250,"block":true},{"id":48,"x":200,"y":400,"block":true},{"id":49,"x":200,"y":450,"block":true},{"id":50,"x":250,"y":0,"block":true},{"id":51,"x":250,"y":50,"block":true},{"id":54,"x":250,"y":200,"block":true},{"id":55,"x":250,"y":250,"block":true},{"id":58,"x":250,"y":400,"block":true},{"id":59,"x":250,"y":450,"block":true},{"id":60,"x":300,"y":0,"block":true},{"id":61,"x":300,"y":50,"block":true},{"id":68,"x":300,"y":400,"block":true},{"id":69,"x":300,"y":450,"block":true},{"id":70,"x":350,"y":0,"block":true},{"id":79,"x":350,"y":450,"block":true}]};
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