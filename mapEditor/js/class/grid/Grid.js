export class Grid {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridWidth = 1000;
        this.gridHeight = 800;
        this.gridCoords = [];
        this.blockSize = 50;
        this.lineWidth = 1;
        this.colliderW = 3;
        this.cellFillStyle = "black";

        this.roundToPrevMult = (n) => Math.ceil((n-this.blockSize)/this.blockSize)*this.blockSize
    }

    create() { 
        this.canvas.width = this.gridWidth;
        this.canvas.height = this.gridHeight;

        let idStart = 0;

        for (let x = 0; x < this.gridWidth; x += this.blockSize) {
            for (let y = 0; y < this.gridHeight; y += this.blockSize) {

                this.ctx.lineWidth = this.lineWidth;

                if(y !== 0) {   
                    this.ctx.moveTo(this.lineWidth/2 + x, this.lineWidth/2 + y);
                    this.ctx.lineTo(this.lineWidth/2 + x + this.blockSize, this.lineWidth/2 + y);
                    this.ctx.lineTo(this.lineWidth/2 + x + this.blockSize, this.lineWidth/2 + y + this.blockSize); 
                } else {
                    this.ctx.moveTo(this.lineWidth/2 + x + this.blockSize, this.lineWidth/2 + y);
                    this.ctx.lineTo(this.lineWidth/2 + x + this.blockSize, this.lineWidth/2 + y + this.blockSize); 
                }

                let colliders = [{type: 'yWall', x: x+this.colliderW, y: y, w: this.blockSize-this.colliderW, h: this.colliderW}, //top
                {type: 'yWall', x: x+this.colliderW, y: y+this.blockSize-this.colliderW, w: this.blockSize-this.colliderW, h: this.colliderW}, //bottom
                {type: 'xWall', x: x, y: y, w: this.colliderW, h: this.blockSize}, //left
                {type: 'xWall', x: x+this.blockSize-this.colliderW, y: y, w: this.colliderW, h: this.blockSize}]; //right

                let cellObj = {id: (x+y) / this.blockSize + idStart, x: x, y: y, blockColliders: colliders, block: false}

                this.gridCoords.push(cellObj);
            }

            let minSide = Math.min(this.gridWidth, this.gridHeight)
            idStart += minSide/this.blockSize-1;
        }
 
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
    }

    fillCell(cursorPos) {
        let roundX = this.roundToPrevMult(cursorPos.x);
        let roundY = this.roundToPrevMult(cursorPos.y);

        console.log(roundX)

        let targetCell = this.gridCoords.filter(n => n.x === roundX && n.y === roundY)[0];
        this.gridCoords[targetCell.id].block = true;

        this.ctx.beginPath();
        this.ctx.rect(roundX+1, roundY+1, this.blockSize-1, this.blockSize-1);
        this.ctx.fillStyle = this.cellFillStyle;
        this.ctx.fill();
        this.ctx.closePath();
    }

    getMap() {
        return {width: this.gridWidth, height: this.gridHeight, blockSize: this.blockSize, coords: this.gridCoords.filter(n => n.block === true)};
    }
}