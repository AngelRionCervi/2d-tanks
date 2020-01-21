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

        let isColl = false;

        this.map.coords.forEach((v) => {
            
                //x
                if ((playerY + baseSizeY/2 - collReduction > v.y && playerY + baseSizeY/2 - collReduction < v.y + blockSize) 
                || (playerY - baseSizeY/2 + collReduction > v.y && playerY - baseSizeY/2 + collReduction < v.y + blockSize)) {

                    if (playerX - baseSizeY/2 <= v.x && playerX + baseSizeY/2 >= v.x) {
                        console.log("left coll")
                        isColl = 'left';

                    } else if (playerX - baseSizeY/2 <= v.x + blockSize && playerX + baseSizeY/2 >= v.x) {
                        console.log("right coll")
                        isColl = 'right';

                    }
                //y
                } else if ((playerX + baseSizeY/2 - collReduction > v.x && playerX + baseSizeY/2 - collReduction < v.x + blockSize) 
                || (playerX - baseSizeY/2 + collReduction > v.x && playerX - baseSizeY/2 + collReduction < v.x + blockSize)) {

                    if (playerY - baseSizeY/2 <= v.y && playerY + baseSizeY/2 >= v.y) {
                        console.log("top coll")
                        isColl = 'top';

                    } else if (playerY - baseSizeY/2 <= v.y + blockSize && playerY + baseSizeY/2 >= v.y) {
                        console.log("bottom coll")
                        isColl = 'bottom';

                    }
                }
            
        })

        return isColl;
    }

}