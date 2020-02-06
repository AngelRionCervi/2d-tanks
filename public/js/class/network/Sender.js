export class Sender {
    constructor(socket, keyboard, mouse) {
        this.socket = socket;
        this.keyboard = keyboard;
        this.mouse = mouse;
    }

    initPlayer(id, spawnPos) {

        this.socket.emit('initPlayer', id, spawnPos);
    }

    sendKeys(id, keys) {

        this.socket.emit('keys', {keys: keys, id: id});
    }

    sendMissileInit(id, missile) {

        this.socket.emit('missileInit', id, missile);
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
}