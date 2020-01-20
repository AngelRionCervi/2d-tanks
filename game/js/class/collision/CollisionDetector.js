export class CollisionDetector {
    constructor(player, map, missiles) {
        this.player = player;
        this.map = map;
        this.missiles = missiles;
    }

    mapPlayerCollision() {
        //console.log(this.player.getPlayerPos())
        let playerPos = this.player.getPlayerPos();
        let playerSpecs = this.player.getPlayerSpecs();

        let playerX = playerPos.x;
        let playerY = playerPos.y;
        let baseSizeX = playerSpecs.baseSizeX;
        let baseSizeY = playerSpecs.baseSizeY;
        let blockSize = this.map.blockSize;

        let isColl = false;

        this.map.coords.forEach((v) => {
            // first check if player is inside first pixels of square
            if (playerX + baseSizeX/2 >= v.x
                && playerX - baseSizeX/2 <= v.x + blockSize 
                && playerY + baseSizeY/2 >= v.y 
                && playerY - baseSizeY/2 <= v.y + blockSize) {
                
                //then checks for the sides 
               
                // x
                if (playerY - baseSizeY/2 > v.y && playerY - baseSizeY/2 < v.y + blockSize) {
                    if (playerX + baseSizeX/2 <= v.x) {
                        console.log("left coll")
                        isColl = 'left';

                    } else if (playerX + baseSizeX/2 >= v.x + blockSize) {
                        console.log("right coll")
                        isColl = 'right';

                    }
                }
               
                // y
                if (playerX - baseSizeX/2 > v.x && playerX - baseSizeX/2 < v.x + blockSize) {
                    if (playerY + baseSizeY/2 <= v.y) {
                        console.log("top coll")
                        isColl = 'top';

                    } else if (playerY + baseSizeY/2 >= v.y + blockSize) {
                        console.log("bottom coll")
                        isColl = 'bottom';

                    }
                }
            } 
        })

        return isColl;
    }

}