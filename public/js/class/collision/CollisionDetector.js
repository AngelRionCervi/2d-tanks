export class CollisionDetector {
    constructor(map) {
        this.map = map;
        this.mapCollisionReduction = 5;
    }


    mapPlayerCollision(x, y, size) {

        let playerX = x;
        let playerY = y;
        let collReduction = this.mapCollisionReduction;

        let isColl = [];

        this.map.coords.forEach((v) => {

            //x
            if ((playerY + size / 2 - collReduction > v.y && playerY + size / 2 - collReduction < v.y + v.h)
                || (playerY - size / 2 + collReduction > v.y && playerY - size / 2 + collReduction < v.y + v.h)) {

                if (playerX - size / 2 <= v.x && playerX + size / 2 >= v.x) {
     
                    let leftCorrection = Math.abs(v.x - (playerX - size / 2) - size);
                    if (isColl.length < 2) isColl.push({ type : "left", amount: leftCorrection });

                } else if (playerX - size / 2 <= v.x + v.w && playerX + size / 2 >= v.x) {

                    let rightCorrection = Math.abs((v.x + v.w) - (playerX - size / 2));
                    if (isColl.length < 2) isColl.push({ type : "right", amount: rightCorrection });

                }
            }

            //y
            if ((playerX + size / 2 - collReduction > v.x && playerX + size / 2 - collReduction < v.x + v.w)
                || (playerX - size / 2 + collReduction > v.x && playerX - size / 2 + collReduction < v.x + v.w)) {

                if (playerY - size / 2 <= v.y && playerY + size / 2 >= v.y) {

                    let topCorrection = Math.abs(v.y - (playerY - size / 2) - size);
                    if (isColl.length < 2) isColl.push({ type : "top", amount: topCorrection });

                } else if (playerY - size / 2 <= v.y + v.h && playerY + size / 2 >= v.y) {

                    let bottomCorrection = Math.abs((v.y + v.h) - (playerY - size / 2));
                    if (isColl.length < 2) isColl.push({ type : "bottom", amount: bottomCorrection });

                }
            }
        })

/*
        if (playerX + size / 2 > this.map.width) {
            isColl.add('left');
        } else if (playerX - size / 2 < 0) {
            isColl.add('right');
        }

        if (playerY + size / 2 > this.map.height) {
            isColl.add('top');
        } else if (playerY - size / 2 < 0) {
            isColl.add('bottom');
        }*/

        return isColl;
    }


    mapMissileCollision(x, y, radius) {

        let isColl = "";

        for (let u = 0; u < this.map.coords.length; u++) {

            let collider = this.map.coords[u];

            let colliderLeft = collider.x - radius*2, colliderRight = collider.x + collider.w + radius, colliderTop = collider.y - radius, colliderBottom = collider.y + collider.h + radius*2;
            //check if missile is either touching or within the collider-bounds
            if (x >= colliderLeft && x <= colliderRight && y >= colliderTop && y <= colliderBottom) {

                //check on which side the missile collides with the collider
                let sides = { left: Math.abs(x - colliderLeft), right: Math.abs(x - colliderRight), top: Math.abs(y - colliderTop), bottom: Math.abs(y - colliderBottom) };
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


    playerMissileCollision(rect1, rect2) {
        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y) {
                
            return true;

         } else {
             
            return false
         }
    }


    segSegCollision(px0, py0, px1, py1, px2, py2, px3, py3) {

        let s1_x, s1_y, s2_x, s2_y;
        s1_x = px1 - px0;
        s1_y = py1 - py0;
        s2_x = px3 - px2;
        s2_y = py3 - py2;

        let s, t;
        s = (-s1_y * (px0 - px2) + s1_x * (py0 - py2)) / (-s2_x * s1_y + s1_x * s2_y);
        t = (s2_x * (py0 - py2) - s2_y * (px0 - px2)) / (-s2_x * s1_y + s1_x * s2_y);

        let interX = px0 + (t * (px1 - px0));
        let interY = py0 + (t * (py1 - py0));

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return { x: interX, y: interY };
        } else {
            return false;
        }
    }


    pointDistance(x0, y0, x1, y1) {
        return Math.hypot(x0 - x1, y0 - y1);
    }
}