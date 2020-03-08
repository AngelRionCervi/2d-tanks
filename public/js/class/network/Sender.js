export class Sender {
    constructor(socket) {
        this.socket = socket;
    }

    initPlayer(id, spawnPos, playerSprite, gun) {

        this.socket.emit('initPlayer', id, spawnPos, playerSprite, gun);
    }

    sendKeys(id, keys) {

        this.socket.emit('keys', {keys: keys, id: id});
    }

    sendRoll(id, roll, player) {

        this.socket.emit('roll', { rolling: roll, id: id, player: player });
    }

    sendProjectileInit(id, missile) {

        this.socket.emit('projectileInit', id, missile);
    }

    sendMouseMove(id, curPos) {

        this.socket.emit('mouseMove', id, curPos);
    }

    pingPlayerPos(id, x, y) {

        this.socket.emit('playerPos', id, x, y);
    }

    pingMissilesPos(id, missiles)  {
        
        this.socket.emit('missilesPos', id, missiles);
    }

    sendClientHits(hits) {

        this.socket.emit('clientHits', hits);
    }
}