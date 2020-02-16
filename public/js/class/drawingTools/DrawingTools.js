export class DrawingTools {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.playerSprite = {frontRight: this.setSrc("/public/assets/sprites/player/playerBenderFrontRight.png"), frontLeft: this.setSrc("/public/assets/sprites/player/playerBenderFrontLeft.png"),
        backRight: this.setSrc("/public/assets/sprites/player/playerBenderBackRight.png"), backLeft: this.setSrc("/public/assets/sprites/player/playerBenderBackLeft.png")};

        this.RLSprite = {base: this.setSrc("/public/assets/sprites/rocketLauncher/gunNormal.png"), fireAn1: this.setSrc("/public/assets/sprites/rocketLauncher/fireAn1.png"),
        fireAn2: this.setSrc("/public/assets/sprites/rocketLauncher/fireAn2.png"), fireAn3: this.setSrc("/public/assets/sprites/rocketLauncher/fireAn3.png"), 
        baseInv: this.setSrc("/public/assets/sprites/rocketLauncher/gunInversed.png"), fireAn1Inv: this.setSrc("/public/assets/sprites/rocketLauncher/fireAn1Inv.png"),
        fireAn2Inv: this.setSrc("/public/assets/sprites/rocketLauncher/fireAn2Inv.png"), fireAn3Inv: this.setSrc("/public/assets/sprites/rocketLauncher/fireAn3Inv.png")};

        this.groundSprite = {base: this.setSrc("/public/assets/sprites/groundTile.jpg")};

        this.wallSprite = {base: this.setSrc("/public/assets/sprites/wall1.png")};

        this.bulletSprite = {base: this.setSrc("/public/assets/sprites/bullet5.png")};
    }

    setSrc(src) {
        let image = new Image();
        image.src = src;
        return image;
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
            case 'playerFrontRight':
                image = this.playerSprite.frontRight;
                break;
            case 'playerFrontLeft':
                image = this.playerSprite.frontLeft;
                break;
            case 'playerBackRight':
                image = this.playerSprite.backRight;
                break;
            case 'playerBackLeft':
                image = this.playerSprite.backLeft;
                break;
            case 'RL':
                image = this.RLSprite.base;
                break;
            case 'RLinv':
                image = this.RLSprite.baseInv;
                break;
            case 'ground':
                image = this.groundSprite.base;
                break;
            case 'wall':
                image = this.wallSprite.base;
                break;
            case 'bullet':
                image = this.bulletSprite.base;
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