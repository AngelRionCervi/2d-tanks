export class DrawingTools {
    constructor(canvas, ctx, spritesJSON) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.spritesJSON = spritesJSON;

        this.sprites = { players: [], gun: [], mapBase: [], shadow: [], healthBar: [], explosion: [] };

        this.parts = {
            players: [
                'IdleFrontLeft1', 'IdleFrontRight1', 'IdleBackLeft1', 'IdleBackRight1',
                'IdleFrontLeft2', 'IdleFrontRight2', 'IdleBackLeft2', 'IdleBackRight2',
                'RunFrontLeft1', 'RunFrontRight1', 'RunBackLeft1', 'RunBackRight1',
                'RunFrontLeft2', 'RunFrontRight2', 'RunBackLeft2', 'RunBackRight2',
                'RunFrontLeft3', 'RunFrontRight3', 'RunBackLeft3', 'RunBackRight3',
                'RunFrontLeft4', 'RunFrontRight4', 'RunBackLeft4', 'RunBackRight4',
            ],
            gun: ['normal', 'inversed', 'bullet'],
            mapBase: [
                'ground1', 'ground2', 'ground3',
                'wall'
            ],
            shadow: ['shadow'],
            healthBar: ['healthBar0', 'healthBar1', 'healthBar2', 'healthBar3'],
            explosion: ['explosion0', 'explosion1', 'explosion2', 'explosion3', 'explosion4', 'explosion5', 'explosion6', 'explosion7', 'explosion8']
        }

        Object.keys(this.sprites).forEach(key => {
            this.spritesJSON[key].forEach(type => {
                let set = {};
                set.name = type.name;
                if (key === "players") set.handColor = type.handColor;
                this.parts[key].forEach(part => {
                    set[part] = this.setSrc("/public/assets/sprites/" + type.root + part + ".png");
                })
                this.sprites[key].push(set);
            })
        })

        this.playerSprite = this.sprites.players[Math.floor(Math.random() * this.sprites.players.length)];
    }

    setSrc(src) {
        if (!src) return;
        let image = new Image();
        image.src = src;
        return image;
    }

    getModel(type) {
        return this.sprites[type][0];
    }

    rect(rectX, rectY, rectW, rectH, trans1X, trans1Y, trans2X, trans2Y, angle, color, stroke = null, lineWidth = null, ghostSprite = null) {

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(trans1X, trans1Y)
        this.ctx.rotate(angle);
        this.ctx.translate(trans2X, trans2Y)
        this.ctx.rect(rectX, rectY, rectW, rectH);
        this.ctx.closePath();

        if (stroke) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }
        else {
            if (color === "handColor") {
                this.ctx.fillStyle = this.playerSprite.handColor;
            } else if (color === "ghostColor") {
                this.ctx.fillStyle = this.sprites.players.find(el => el.name === ghostSprite).handColor;
            } else {
                this.ctx.fillStyle = color;
            }
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

    debugCirc(x, y, r) {
        this.circ(x, y, r, 0, Math.PI*180, false, "red");
    }

    drawSprite(spriteType, x, y, trans1X = null, trans1Y = null, trans2X = null, trans2Y = null, angle = null, ghostSprite = null, animationIndex = null) {

        let playerSpriteSet = ghostSprite ? this.sprites.players.find(el => el.name === ghostSprite) : this.playerSprite;

        let image;

        switch (spriteType) {
            case 'playerIdleFrontRight':
                image = playerSpriteSet["IdleFrontRight" + animationIndex];
                break;
            case 'playerIdleFrontLeft':
                image = playerSpriteSet["IdleFrontLeft" + animationIndex];
                break;
            case 'playerIdleBackRight':
                image = playerSpriteSet["IdleBackRight" + animationIndex];
                break;
            case 'playerIdleBackLeft':
                image = playerSpriteSet["IdleBackLeft" + animationIndex];
                break;
            case 'playerRunFrontRight':
                image = playerSpriteSet["RunFrontRight" + animationIndex];
                break;
            case 'playerRunFrontLeft':
                image = playerSpriteSet["RunFrontLeft" + animationIndex];
                break;
            case 'playerRunBackRight':
                image = playerSpriteSet["RunBackRight" + animationIndex];
                break;
            case 'playerRunBackLeft':
                image = playerSpriteSet["RunBackLeft" + animationIndex];
                break;
            case 'shadow':
                image = this.getModel("shadow").shadow;
                break;
            case 'RL':
                image = this.getModel("gun").normal;
                break;
            case 'RLinv':
                image = this.getModel("gun").inversed;
                break;
            case 'bullet':
                image = this.getModel("gun").bullet;
                break;
            case 'wall':
                image = this.getModel("mapBase").wall;
                break;
        }

        if (spriteType.includes('explosion')) {
            let explosionFrame = spriteType.split('_').pop();
            image = this.getModel("explosion")["explosion" + explosionFrame];
        }

        if (spriteType.includes('healthBar')) {
            let healBarNbr = spriteType.split('_').pop();
            image = this.getModel("healthBar")["healthBar" + healBarNbr];
        }

        if (spriteType.includes('ground')) {
            let tileNbr = spriteType.split('_').pop();
            image = this.getModel("mapBase")["ground" + tileNbr];
        }

        this.ctx.save();
        this.ctx.translate(trans1X, trans1Y)
        this.ctx.rotate(angle);
        this.ctx.translate(trans2X, trans2Y)
        this.ctx.drawImage(image, x, y);
        this.ctx.restore();
    }
}