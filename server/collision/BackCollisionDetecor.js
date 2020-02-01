module.exports = class BackCollisionDetector {
    constructor(map) {
        this.map = map;
        this.mapCollisionReduction = 5;
    }

    mapPlayerCollision(x, y, size) {

        let playerX = x;
        let playerY = y;
        let collReduction = this.mapCollisionReduction;

        let isColl = new Set();

        this.map.coords.forEach((v) => {

            //x
            if ((playerY + size / 2 - collReduction > v.y && playerY + size / 2 - collReduction < v.y + v.h)
                || (playerY - size / 2 + collReduction > v.y && playerY - size / 2 + collReduction < v.y + v.h)) {

                if (playerX - size / 2 <= v.x && playerX + size / 2 >= v.x) {

                    isColl.add('left');

                } else if (playerX - size / 2 <= v.x + v.w && playerX + size / 2 >= v.x) {

                    isColl.add('right');

                }
            }

            //y
            if ((playerX + size / 2 - collReduction > v.x && playerX + size / 2 - collReduction < v.x + v.w)
                || (playerX - size / 2 + collReduction > v.x && playerX - size / 2 + collReduction < v.x + v.w)) {

                if (playerY - size / 2 <= v.y && playerY + size / 2 >= v.y) {

                    isColl.add('top');

                } else if (playerY - size / 2 <= v.y + v.h && playerY + size / 2 >= v.y) {

                    isColl.add('bottom');

                }
            }
        })

        if (playerX + size / 2 > this.map.width) {
            isColl.add('left');
        } else if (playerX - size / 2 < 0) {
            isColl.add('right');
        }

        if (playerY + size / 2 > this.map.height) {
            isColl.add('top');
        } else if (playerY - size / 2 < 0) {
            isColl.add('bottom');
        }

        return isColl;
    }
}