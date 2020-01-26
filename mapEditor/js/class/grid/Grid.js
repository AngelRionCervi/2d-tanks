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

        let nMap = this.normalize();

        return nMap;
    }

    normalize() { // it couldn't get worse rly
        let yGrid = this.gridCoords;
        let xGrid = [];

        let xRows = [];
        
        let sortedX = [];
        let sortedXY = [];

        let doneL = [];
        let doneX = [];

        let stacked = [];
        let yCount = 0;
        let id = 0;

        // "invert yGrid to make a grid based on X"
        for (let u = 0; u < yGrid[0].length; u++) {
            xGrid.push([]);
        }

        for (let n = 0; n < yGrid.length; n++) {
            for (let u = 0; u < yGrid[n].length; u++) {
                xGrid[u].push(yGrid[n][u]);
            }
        }

        // identify if there is a block and make rows of X blocks;
        for (let u = 0; u < xGrid.length; u++) {

            let fGrid = xGrid[u].filter(n => n.block === true);
            let rowLength = 0;

            if (fGrid.length > 0) {
                for (let k = 0; k < fGrid.length; k++) {

                    let next;
                    if (k < fGrid.length - 1) {
                        next = fGrid[k + 1].x;
                    }

                    rowLength++;

                    if (Math.abs(next - fGrid[k].x) !== this.blockSize) {
                        let x = fGrid[k - rowLength + 1].x;
                        let y = fGrid[k - rowLength + 1].y;

                        if (rowLength > 0) {
                            let blockObj = { id: id, y: y, x: x, l: rowLength * this.blockSize };
                            xRows.push(blockObj);
                        }

                        rowLength = 0;
                        id++;
                    }
                }
            }
        }

        // filter the rows by length xStart;
        for (let i = 0; i < xRows.length; i++) {
            if (!doneL.includes(xRows[i].l) || !doneX.includes(xRows[i].x)) {
                doneL.push(xRows[i].l);
                doneX.push(xRows[i].x);
                sortedX.push(xRows.filter(el => el.x === xRows[i].x && el.l === xRows[i].l));
            }
        }

        // filter the rows by Y gaps;
        for (let i = 0; i < sortedX.length; i++) {

            let subArrLen = sortedX[i].length;

            for (let j = sortedX[i].length - 1; j > 0; j--) {
                if (Math.abs(sortedX[i][j].y - sortedX[i][j - 1].y) !== this.blockSize) {

                    sortedXY.unshift(sortedX[i].slice(j, subArrLen));
                    subArrLen = j;
                }

                if (j === 1) {
                    sortedXY.unshift(sortedX[i].slice(j - 1, subArrLen));
                }
            }

            if (subArrLen === 1) {
                sortedXY.push([sortedX[i][0]]);
            }
        }

        // assemble the blocks
        for (let i = 0; i < sortedXY.length; i++) {
            for (let j = 0; j < sortedXY[i].length; j++) {
                yCount++;
                
                if (j === sortedXY[i].length - 1) {
                    let block = { x: sortedXY[i][0].x, y: sortedXY[i][0].y, w: sortedXY[i][0].l, h: yCount * this.blockSize };
                    stacked.push(block);
                    yCount = 0;
                }
            }
        }


        console.log('stacked cheese : ', stacked);

        return stacked;
    }
}