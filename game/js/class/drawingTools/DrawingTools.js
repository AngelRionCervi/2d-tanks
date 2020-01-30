export class DrawingTools {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.tankBaseGreen = new Image();
        this.tankBaseGreen.src = "/assets/sprites/tankBase.png";
        this.canonGreen = new Image();
        this.canonGreen.src = "/assets/sprites/canonGreen.png";
        this.ground = new Image();
        this.ground.src = "/assets/sprites/groundTile.jpg";
        this.wall = new Image();
        this.wall.src = "/assets/sprites/wall1.png";
        this.bullet = new Image();
        this.bullet.src = "/assets/sprites/bullet5.png";
    }

    rect(rectX, rectY, rectW, rectH, trans1X, trans1Y, trans2X, trans2Y, angle, color, stroke = null) {

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(trans1X, trans1Y)
        this.ctx.rotate(angle);
        this.ctx.translate(trans2X, trans2Y)
        this.ctx.rect(rectX, rectY, rectW, rectH);
        this.ctx.closePath();

        if (stroke) {
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        } else {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    dashRect(rectX, rectY, dashWidth, dashLength, trans1X, trans1Y, trans2X, trans2Y, angle, color, dashSize, dashGap, rev) {

        let incGap = 0;

        while (dashLength - dashSize > incGap) {

            let mult = rev ? -incGap : incGap;

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.translate(trans1X, trans1Y)
            this.ctx.rotate(angle);
            this.ctx.translate(trans2X, trans2Y)
            this.ctx.rect(rectX, rectY + mult, dashWidth, dashSize);
            this.ctx.closePath();
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.restore();

            incGap += dashSize + dashGap;
        }

    }

    circ(centerX, centerY, radius, startAngle, endAngle, rev, color) {

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle, rev);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.restore();
    }

    drawSprite(sprite, x, y, trans1X = null, trans1Y = null, trans2X = null, trans2Y = null, angle = null) {

        let image;

        switch (sprite) {
            case 'tankBase':
                image = this.tankBaseGreen;
                break;
            case 'canon':
                image = this.canonGreen;
                break;
            case 'ground':
                image = this.ground;
                break;
            case 'wall':
                image = this.wall;
                break;
            case 'bullet':
                image = this.bullet;
                break;
        }

        this.ctx.save();
        this.ctx.translate(trans1X, trans1Y)
        this.ctx.rotate(angle);
        this.ctx.translate(trans2X, trans2Y)
        this.ctx.drawImage(image, x, y);
        this.ctx.restore();

    }
}