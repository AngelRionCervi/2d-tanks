let showFps = (fps, ctx) => {
    ctx.fillStyle = "black";
    ctx.font = "normal 16pt Arial";

    ctx.fillText(fps.toFixed() + " fps", 10, 26);
}

let getFPS = () =>
        new Promise(resolve =>
            requestAnimationFrame(t1 =>
                requestAnimationFrame(t2 => resolve({fps: 1000 / (t2 - t1)}))
            )
        )