export class Mouse {
    constructor(canvas) {
        this.canvas = canvas;
    }

    getCursorPos(evt) {
        let rect = this.canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height
        };
    }
}