function showFps(fps, ctx) {
    ctx.fillStyle = "black";
    ctx.font = "normal 16pt Arial";

    ctx.fillText(fps.toFixed() + " fps", 10, 26);
}