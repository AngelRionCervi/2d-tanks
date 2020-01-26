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
        let yGrid = this.gridCoords;
        let rows = { x: [], y: [] };

        let xGrid = [];

        for (let u = 0; u < yGrid[0].length; u++) {
            xGrid.push([]);
        }

        for (let n = 0; n < yGrid.length; n++) {
            for (let u = 0; u < yGrid[n].length; u++) {
                xGrid[u].push(yGrid[n][u]);
            }
        }

        let id = 0;

        Object.keys(rows).forEach((key, index) => {

            let idInc = index === 0 ? 0 : 1;
            let grid = index === 0 ? xGrid : yGrid;
            let invKey = key === 'x' ? 'y' : 'x';

            id += idInc;

            for (let u = 0; u < grid.length; u++) {

                let fGrid = grid[u].filter(n => n.block === true);
                let rowLength = 0;

                if (fGrid.length > 0) {
                    for (let k = 0; k < fGrid.length; k++) {

                        let next;
                        if (k < fGrid.length - 1) {
                            next = fGrid[k + 1][key];
                        }

                        rowLength++;

                        if (next - fGrid[k][key] !== this.blockSize) {
                            let x = fGrid[k - rowLength + 1][invKey];
                            let y = fGrid[k - rowLength + 1][key];

                            if (rowLength > 0) {
                                let blockObj = { id: id, [invKey]: x, [key]: y, l: rowLength * this.blockSize };
                                rows[key].push(blockObj);
                            }

                            rowLength = 0;
                            id++;
                        }

                    }
                }
            }
        })

        let xRows = rows.x;
        let stackedX = [];
        
        let sortedX = [];
        let sortedXY = [];

        let doneL = [];
        let doneX = [];

        for (let i = 0; i < xRows.length; i++) {
            if (!doneL.includes(xRows[i].l) || !doneX.includes(xRows[i].x)) {
                doneL.push(xRows[i].l);
                doneX.push(xRows[i].x);
                sortedX.push(xRows.filter(el => el.x === xRows[i].x && el.l === xRows[i].l));
            }
        }


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
   

        let yCount = 0;
        for (let i = 0; i < sortedXY.length; i++) {

            for (let j = 0; j < sortedXY[i].length; j++) {
                yCount++;

                if (j === sortedXY[i].length-1) {
                    let block = { x: sortedXY[i][0].x, y: sortedXY[i][0].y, w: sortedXY[i][0].l, h: yCount * this.blockSize };
                    stackedX.push(block);
                    yCount = 0;
                }
            }
        }



        console.log('rows', rows);
        console.log('stack', stackedX);
    }
}