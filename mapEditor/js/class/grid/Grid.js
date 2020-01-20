export class Grid {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridWidth = 500;
        this.gridHeight = 500;
        this.gridCoords = [];
        this.blockSize = 50;
        this.lineWidth = 1;
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
                this.gridCoords.push({id: (x+y) / this.blockSize + idStart, x: x, y: y, block: false});
            }

            idStart += this.gridWidth/this.blockSize-1;
        }

        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
        console.log(this.gridCoords)
    }

    fillCell(cursorPos) {
        let roundX = this.roundToPrevMult(cursorPos.x);
        let roundY = this.roundToPrevMult(cursorPos.y);

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