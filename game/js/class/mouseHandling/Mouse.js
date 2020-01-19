export class Mouse {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;
        this.canvas = canvas;
    }

    getMousePos(evt) {
        let rect = this.canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height
        };
    }
}