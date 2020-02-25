const showFps = (fps, ctx) => {
    ctx.fillStyle = "white";
    ctx.font = "normal 16pt Arial";

    ctx.fillText(fps.toFixed() + " fps", 10, 26);
}

const rndmInteger = (min, max) => {
    max += 1;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const rndmFloat = (min, max) =>  Math.random() * (max - min) + min;

const getFPS = () =>
        new Promise(resolve =>
            requestAnimationFrame(t1 =>
                requestAnimationFrame(t2 => resolve({fps: 1000 / (t2 - t1)}))
            )
        )