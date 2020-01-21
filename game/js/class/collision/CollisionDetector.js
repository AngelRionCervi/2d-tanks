export class CollisionDetector {
    constructor(player, map, missiles) {
        this.player = player;
        this.map = map;
        this.missiles = missiles;
        this.mapCollisionReduction = 5;
    }

    mapPlayerCollision() {
        //console.log(this.player.getPlayerPos())
        let playerPos = this.player.getPlayerPos();
        let playerSpecs = this.player.getPlayerSpecs();

        let playerX = playerPos.x;
        let playerY = playerPos.y;
        let baseSizeX = playerSpecs.baseSizeX;
        let baseSizeY = playerSpecs.baseSizeY;
        let collReduction = this.mapCollisionReduction;
        let blockSize = this.map.blockSize;

        let isColl = new Set();

        this.map.coords.forEach((v) => {

            //x
            if ((playerY + baseSizeY / 2 - collReduction > v.y && playerY + baseSizeY / 2 - collReduction < v.y + blockSize)
                || (playerY - baseSizeY / 2 + collReduction > v.y && playerY - baseSizeY / 2 + collReduction < v.y + blockSize)) {

                if (playerX - baseSizeY / 2 <= v.x && playerX + baseSizeY / 2 >= v.x) {

                    isColl.add('left');

                } else if (playerX - baseSizeY / 2 <= v.x + blockSize && playerX + baseSizeY / 2 >= v.x) {

                    isColl.add('right');

                }
            }

            //y
            if ((playerX + baseSizeY / 2 - collReduction > v.x && playerX + baseSizeY / 2 - collReduction < v.x + blockSize)
                || (playerX - baseSizeY / 2 + collReduction > v.x && playerX - baseSizeY / 2 + collReduction < v.x + blockSize)) {

                if (playerY - baseSizeY / 2 <= v.y && playerY + baseSizeY / 2 >= v.y) {

                    isColl.add('top');

                } else if (playerY - baseSizeY / 2 <= v.y + blockSize && playerY + baseSizeY / 2 >= v.y) {

                    isColl.add('bottom');

                }
            }
        })

        if (playerX + baseSizeY / 2 > this.map.width) {
            isColl.add('left');
        } else if (playerX - baseSizeY / 2 < 0) {
            isColl.add('right');
        }

        if (playerY + baseSizeY / 2 > this.map.height) {
            isColl.add('top');
        } else if (playerY - baseSizeY / 2 < 0) {
            isColl.add('bottom');
        }
        

        return isColl;
    }

}