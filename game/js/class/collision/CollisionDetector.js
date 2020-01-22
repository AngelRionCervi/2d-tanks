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

        let blockSize = this.map.blockSize;
        let collReduction = 5;
        let baseSizeY = 6;
        let colliderW = 3;
        let isColl = "";

        this.map.coords.forEach((collider) => {
            //coord.blockColliders.forEach((collider) => {

                

                        let missileLeft = missile.x - baseSizeY, missileRight = missile.x + baseSizeY, missileTop = missile.y - baseSizeY, missileBottom = missile.y + baseSizeY;
                        let colliderLeft = collider.x, colliderRight = collider.x + blockSize, colliderTop = collider.y, colliderBottom = collider.y + blockSize;
                        //check if missile is either touching or within the collider-bounds
                        if (missileRight >= colliderLeft && missileLeft <= colliderRight && missileBottom >= colliderTop && missileTop <= colliderBottom) {
                            if (missile.y + baseSizeY == colliderTop || missile.y - baseSizeY == colliderBottom) { 
                                isColl = ""; 
                            } //missile is already colliding with top or bottom side of collider
                            else if (missile.x + baseSizeY == colliderLeft || missile.x - baseSizeY == colliderRight) { 
                                isColl = ""; 
                            } //missile is already colliding with left or right side of collider
                            else if (missileRight > colliderLeft && missileLeft < colliderRight && missileBottom > colliderTop && missileTop < colliderBottom) {
                                //check on which side the missile collides with the collider
                                var sides = { left: Math.abs(missileRight - colliderLeft), right: Math.abs(missileLeft - colliderRight), top: Math.abs(missileBottom - colliderTop), bottom: Math.abs(missileTop - colliderBottom) };
                                var side = Math.min(sides.left, sides.right, sides.top, sides.bottom); //returns the side with the smallest distance between missile and collider

                                if (side == sides.top) { 
                                   console.log('top coll')
                                   isColl = "yColl";
                                } else if (side == sides.left) { 
                                    console.log('left coll')
                                    isColl = "xColl";
                                } 

                                //first check top, than left
                                else if (side == sides.bottom) { 
                                    console.log('bottom coll')
                                    isColl = "yColl";
                                } else if (side == sides.right) { 
                                    console.log('right coll')
                                    isColl = "xColl";
                                } //first check bottom, than right
                                
                            }
                        }
/*
                        if (missile.x > collider.x && missile.x < collider.x + colliderW) {
                            isColl = "yColl";
                        } else {
                            isColl = "xColl";
                        }*/

                    
                

            //})
        })

        return isColl;
    }

}