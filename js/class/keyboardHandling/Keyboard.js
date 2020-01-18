export class Keyboard {
    constructor(canvas) {
        this.canvas = canvas;
        this.pressedDirKeys = [0, 0, 0, 0]
    }

    getDirection(evt) {

        this.registerDirKeys(evt);

        let directions = [0, 0];

        if (this.pressedDirKeys[0]) {
            directions[0] = 1;
        }
        if (this.pressedDirKeys[1]) {
            directions[0] = -1;
        }
        if (this.pressedDirKeys[2]) {
            directions[1] = -1;
        }
        if (this.pressedDirKeys[3]) {
            directions[1] = 1;
        }

        
        if (this.pressedDirKeys[0] && this.pressedDirKeys[1]) { // z and s
            directions[0] = 0;
        } else if (this.pressedDirKeys[2] && this.pressedDirKeys[3]) { // q and d
            directions[1] = 0;
        }
        

        return directions;
    }

    registerDirKeys(evt) {
        if (evt.type === "keydown") {

            switch (evt.key) {
                case 'z':
                    this.pressedDirKeys[0] = 1;
                    break;
                case 's':
                    this.pressedDirKeys[1] = 1;
                    break;
                case 'q':
                    this.pressedDirKeys[2] = 1;
                    break;
                case 'd':
                    this.pressedDirKeys[3] = 1;
                    break;
            }

        } else if (evt.type === "keyup") {

            switch (evt.key) {
                case 'z':
                    this.pressedDirKeys[0] = 0;
                    break;
                case 's':
                    this.pressedDirKeys[1] = 0;
                    break;
                case 'q':
                    this.pressedDirKeys[2] = 0;
                    break;
                case 'd':
                    this.pressedDirKeys[3] = 0;
                    break;
            }
        }
    }
}