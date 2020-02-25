export class ScreenShake {
    constructor() {

        this.duration = 10;
        this.intensity = 2;
        this.elapsedFrames = 0;
        this.ended = false;
        this.rndmFloat = (min, max) =>  Math.random() * (max - min) + min;
    }

    preShake() {
        let dx = this.rndmFloat(-1, 1)*this.intensity;
        let dy = this.rndmFloat(-1, 1)*this.intensity;

        return {dx, dy};
    }

    postShake() {
        if (this.elapsedFrames === this.duration) {
            this.ended = true;
        } else {
            this.elapsedFrames++;
        }
    }
}