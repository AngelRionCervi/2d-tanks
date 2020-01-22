export class CollisionDetector {
    constructor(player, map, missiles) {
        this.player = player;
        this.map = map;
        this.missiles = missiles;
        this.mapCollisionReduction = 5;
    }

    mapPlayerCollision() {

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

    mapMissileCollision(missile) {

        let blockSize = this.map.blockSize + 5;
        let collReduction = 5;
        let baseSizeY = 6;
        let colliderW = 3;
        let isColl = "";

        this.map.coords.forEach((collider) => {

            let colliderLeft = collider.x - baseSizeY, colliderRight = collider.x + blockSize, colliderTop = collider.y - baseSizeY, colliderBottom = collider.y + blockSize;
            //check if missile is either touching or within the collider-bounds
            if (missile.x >= colliderLeft && missile.x <= colliderRight && missile.y >= colliderTop && missile.y <= colliderBottom) {

                //check on which side the missile collides with the collider
                let sides = { left: Math.abs(missile.x - colliderLeft), right: Math.abs(missile.x - colliderRight), top: Math.abs(missile.y - colliderTop), bottom: Math.abs(missile.y - colliderBottom) };
                let side = Math.min(sides.left, sides.right, sides.top, sides.bottom); //returns the side with the smallest distance between missile and collider
                console.log(sides, side);
                if (side == sides.top) {
                    isColl = "yColl";
                } if (side == sides.left) {
                    isColl = "xColl";
                }

                if (side == sides.bottom) {
                    isColl = "yColl";
                }
                if (side == sides.right) {
                    isColl = "xColl";
                }

                if (missile.lastColl.length > 2) {
                    missile.lastColl.splice(0, 1);
                } else if (missile.lastColl.length === 2) {
                    if (missile.lastColl[0] === missile.lastColl[1]) {
                        isColl = "";
                    }
                }

                missile.lastColl.push(isColl);

            } else if (missile.lastColl.length !== 0) {
                missile.lastColl = [];
            }
            
        })
        if (missile.lastColl.length !== 0) {
            console.log(missile.lastColl)
        }
        return isColl;
    }

}