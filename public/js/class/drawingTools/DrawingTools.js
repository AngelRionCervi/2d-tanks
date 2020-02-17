export class DrawingTools {
    constructor(canvas, ctx, spritesJSON) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.spritesJSON = spritesJSON;

        this.sprites = { players: [], weapons: [], map: [] };

        this.parts = {
            players: ['frontLeft', 'frontRight', 'backLeft', 'backRight'],
            weapons: ['normal', 'inversed', 'bullet'],
            map: ['ground', 'wall'],
        }

        Object.keys(this.sprites).forEach(key => {
            this.spritesJSON[key].forEach(type => {
                let set = {};
                set.name = type.name;
                this.parts[key].forEach(part => {
                    let ext = part === "ground" ? ".jpg" : ".png";
                    set[part] = this.setSrc("/public/assets/sprites/" + type.root + part + ext);
                })
                this.sprites[key].push(set);
            })
        })

        this.playerSprite = this.sprites.players[Math.floor(Math.random() * this.sprites.players.length)];

        console.log('SPRITES', this.sprites, this.playerSprite);
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
                image = this.sprites.weapons.find(el => el.name === "gun").normal;
                break;
            case 'RLinv':
                image = this.sprites.weapons.find(el => el.name === "gun").inversed;
                break;
            case 'bullet':
                image = this.sprites.weapons.find(el => el.name === "gun").bullet;
                break;
            case 'ground':
                image = this.sprites.map.find(el => el.name === "base").ground;
                break;
            case 'wall':
                image = this.sprites.map.find(el => el.name === "base").wall;
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