export class Grid {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridWidth = 1000;
        this.gridHeight = 800;
        this.blockSize = 50;
        this.gridCoords = new Array(this.gridWidth / this.blockSize);
        this.lineWidth = 1;
        this.colliderW = 3;
        this.cellFillStyle = "black";

        this.roundToPrevMult = (n) => Math.ceil((n - this.blockSize) / this.blockSize) * this.blockSize;
        this.initCoords = () => {
            for (let u = 0; u < this.gridCoords.length; u++) {
                this.gridCoords[u] = new Array(this.gridHeight / this.blockSize);
            }
        }
    }

    create() {

        this.initCoords();

        this.canvas.width = this.gridWidth;
        this.canvas.height = this.gridHeight;

        let idStart = 0;

        for (let x = 0; x < this.gridWidth; x += this.blockSize) {
            for (let y = 0; y < this.gridHeight; y += this.blockSize) {

                this.ctx.lineWidth = this.lineWidth;

                if (y !== 0) {
                    this.ctx.moveTo(this.lineWidth / 2 + x, this.lineWidth / 2 + y);
                    this.ctx.lineTo(this.lineWidth / 2 + x + this.blockSize, this.lineWidth / 2 + y);
                    this.ctx.lineTo(this.lineWidth / 2 + x + this.blockSize, this.lineWidth / 2 + y + this.blockSize);
                } else {
                    this.ctx.moveTo(this.lineWidth / 2 + x + this.blockSize, this.lineWidth / 2 + y);
                    this.ctx.lineTo(this.lineWidth / 2 + x + this.blockSize, this.lineWidth / 2 + y + this.blockSize);
                }

                let colliders = [{ type: 'yWall', x: x + this.colliderW, y: y, w: this.blockSize - this.colliderW, h: this.colliderW }, //top
                { type: 'yWall', x: x + this.colliderW, y: y + this.blockSize - this.colliderW, w: this.blockSize - this.colliderW, h: this.colliderW }, //bottom
                { type: 'xWall', x: x, y: y, w: this.colliderW, h: this.blockSize }, //left
                { type: 'xWall', x: x + this.blockSize - this.colliderW, y: y, w: this.colliderW, h: this.blockSize }]; //right

                let cellObj = { id: (x + y) / this.blockSize + idStart, x: x, y: y, blockColliders: colliders, block: false }

                this.gridCoords[x / this.blockSize][y / this.blockSize] = cellObj;
            }

            let minSide = Math.min(this.gridWidth, this.gridHeight)
            idStart += minSide / this.blockSize - 1;
        }

        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
    }

    fillCell(cursorPos) {
        let roundX = this.roundToPrevMult(cursorPos.x);
        let roundY = this.roundToPrevMult(cursorPos.y);

        let flatCoord = this.gridCoords.flat();

        let targetCell = flatCoord.filter(n => n.x === roundX && n.y === roundY)[0];
        flatCoord[targetCell.id].block = true;

        this.ctx.beginPath();
        this.ctx.rect(roundX + 1, roundY + 1, this.blockSize - 1, this.blockSize - 1);
        this.ctx.fillStyle = this.cellFillStyle;
        this.ctx.fill();
        this.ctx.closePath();
    }

    getMap() {

        this.normalize();

        return { width: this.gridWidth, height: this.gridHeight, blockSize: this.blockSize, coords: this.gridCoords.filter(n => n.block === true) };
    }

    normalize() {
        let grid = this.gridCoords;
        let rows = { x: [], y: [] };

        for (let u = 0; u < grid.length; u++) {

            let fGrid = grid[u].filter(n => n.block === true);
            let rowLength = 0;

            if (fGrid.length > 0) {
                for (let k = 0; k < fGrid.length; k++) {

                    let nextY;
                    if (k < fGrid.length - 1) {
                        nextY = fGrid[k + 1].y;
                    }

                    rowLength++;

                    if (nextY - fGrid[k].y !== this.blockSize) {
                        let x = fGrid[k - rowLength + 1].x;
                        let y = fGrid[k - rowLength + 1].y;

                        if (rowLength > 0) {
                            let blockObj = { x: x, y: y, l: rowLength };
                            rows.y.push(blockObj);
                        }

                        rowLength = 0;
                    }
                }
            }
        }

        console.log('rows', rows);
    }
}