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
        let baseSizeY = playerSpecs.baseSizeY;
        let collReduction = this.mapCollisionReduction;

        let isColl = new Set();

        this.map.coords.forEach((v) => {

            //x
            if ((playerY + baseSizeY / 2 - collReduction > v.y && playerY + baseSizeY / 2 - collReduction < v.y + v.h)
                || (playerY - baseSizeY / 2 + collReduction > v.y && playerY - baseSizeY / 2 + collReduction < v.y + v.h)) {

                if (playerX - baseSizeY / 2 <= v.x && playerX + baseSizeY / 2 >= v.x) {

                    isColl.add('left');

                } else if (playerX - baseSizeY / 2 <= v.x + v.w && playerX + baseSizeY / 2 >= v.x) {

                    isColl.add('right');

                }
            }

            //y
            if ((playerX + baseSizeY / 2 - collReduction > v.x && playerX + baseSizeY / 2 - collReduction < v.x + v.w)
                || (playerX - baseSizeY / 2 + collReduction > v.x && playerX - baseSizeY / 2 + collReduction < v.x + v.w)) {

                if (playerY - baseSizeY / 2 <= v.y && playerY + baseSizeY / 2 >= v.y) {

                    isColl.add('top');

                } else if (playerY - baseSizeY / 2 <= v.y + v.h && playerY + baseSizeY / 2 >= v.y) {

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

        let isColl = "";
     
        for (let u = 0; u < this.map.coords.length; u++) {

            let collider = this.map.coords[u];
            let size = missile.radius;

            let colliderLeft = collider.x - size, colliderRight = collider.x + collider.w + size, colliderTop = collider.y - size, colliderBottom = collider.y + collider.h + size;
            //check if missile is either touching or within the collider-bounds
            if (missile.x >= colliderLeft && missile.x <= colliderRight && missile.y >= colliderTop && missile.y <= colliderBottom) {

                //check on which side the missile collides with the collider
                let sides = { left: Math.abs(missile.x - colliderLeft), right: Math.abs(missile.x - colliderRight), top: Math.abs(missile.y - colliderTop), bottom: Math.abs(missile.y - colliderBottom) };
                let side = Math.min(sides.left, sides.right, sides.top, sides.bottom); //returns the side with the smallest distance between missile and collider
                
                //console.log(sides, side)
                if (side == sides.top) {
                    isColl = "top";
                } 
                if (side == sides.left) {
                    isColl = "left";
                }
                if (side == sides.bottom) {
                    isColl = "bottom";
                }
                if (side == sides.right) {
                    isColl = "right";
                }

               
                break;

            } 
        }
       
        return isColl;
    }
}