export class MapManager {
    constructor(canvas, ctx, drawingTools, rndmInteger) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.drawingTools = drawingTools;
        this.rndmInteger = rndmInteger;
        this.blockColor = "black";
        this.spriteSize = 64;
        this.groundTileSize = 320;
        this.totalGroundType = 3;
        this.map = {"width":1280,"height":768,"coords":[{"x":512,"y":256,"w":256,"h":256},{"x":1088,"y":128,"w":192,"h":64},{"x":1088,"y":320,"w":192,"h":128},{"x":1088,"y":576,"w":192,"h":64},{"x":0,"y":128,"w":192,"h":64},{"x":0,"y":320,"w":192,"h":128},{"x":0,"y":576,"w":192,"h":64},{"x":0,"y":64,"w":64,"h":64},{"x":0,"y":192,"w":64,"h":128},{"x":0,"y":448,"w":64,"h":128},{"x":0,"y":640,"w":64,"h":64},{"x":0,"y":0,"w":1280,"h":64},{"x":0,"y":704,"w":1280,"h":64},{"x":1216,"y":64,"w":64,"h":64},{"x":1216,"y":192,"w":64,"h":128},{"x":1216,"y":448,"w":64,"h":128},{"x":1216,"y":640,"w":64,"h":64},{"x":768,"y":64,"w":64,"h":128},{"x":768,"y":576,"w":64,"h":128},{"x":448,"y":64,"w":64,"h":128},{"x":448,"y":576,"w":64,"h":128},{"x":0,"y":0,"w":1,"h":1280},{"x":0,"y":768,"w":1280,"h":1},{"x":0,"y":0,"w":1280,"h":1},{"x":1280,"y":0,"w":1,"h":768}],"debugColliders":[]}
        this.groundTilesNbr = [];

        for (let i = 0; i < this.map.width; i += this.groundTileSize) {
            for (let j = 0; j < this.map.height; j += this.groundTileSize) {
                this.groundTilesNbr.push(this.rndmInteger(1, this.totalGroundType))
            }
        }

        this.groundTilesNbr.push(this.rndmInteger(1, this.totalGroundType)) // we actually need 1 more;
    }

    renderMap(map, shakeX, shakeY) {
        let width = map.width;
        let height = map.height;
        let blockCoords = map.coords;

        this.canvas.width = width;
        this.canvas.height = height;

        this.ctx.imageSmoothingEnabled = false;

        let gIndex = 0;
        for (let i = 0; i < width; i += this.groundTileSize) {
            for (let j = 0; j < height; j += this.groundTileSize) {
                gIndex++;
                this.drawingTools.drawSprite('ground_' + this.groundTilesNbr[gIndex], i + shakeX, j + shakeY);
            }
        }

        blockCoords.forEach(v => {
            if (v.w > 1 && v.h > 1) {
                for (let i = v.x; i < v.x + v.w; i += this.spriteSize) {
                    for (let j = v.y; j < v.y + v.h; j += this.spriteSize) {
                        this.drawingTools.drawSprite('wall', i + shakeX, j + shakeY);
                    }
                }
            }
        });
        //this.debugColliders(map.debugColliders);
    }

    debugColliders(colliders) {

        colliders.forEach((collider) => {
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