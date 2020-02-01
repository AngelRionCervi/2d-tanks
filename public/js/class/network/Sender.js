export class Sender {
    constructor(socket, keyboard, mouse) {
        this.socket = socket;
        this.keyboard = keyboard;
        this.mouse = mouse;
    }

    initPlayer(id, spawnPos) {

        this.socket.emit('initPlayer', id, spawnPos);
    }

    sendKeys(keys, id) {

        this.socket.emit('keys', {keys: keys, id: id});
    }
}