export class ScreenShake {
    constructor(rndmFloat) {
        this.duration = 10;
        this.intensity = 2;
        this.elapsedFrames = 0;
        this.ended = false;
        this.rndmFloat = rndmFloat;
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