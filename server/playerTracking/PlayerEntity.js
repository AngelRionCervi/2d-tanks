module.exports = class PlayerEntity {
    constructor(id, spawnPos) {
        this.id = id;
        this.speed = 1.5;
        this.x = spawnPos.x;
        this.y = spawnPos.y;
        this.lastKeys;
    }

    updateKeys(playerKeys) {

        this.lastKeys = playerKeys.keys;
    }

    updatePos() {

        if (this.lastKeys) {
            this.x += (this.lastKeys.x * this.speed);
            this.y -= (this.lastKeys.y * this.speed);
        }
        
        

        console.log(this.x, this.y)
    }
}