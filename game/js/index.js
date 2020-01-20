const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const frameRate = 1000/60;

import {Missile} from "/js/class/weapon/Missile.js"; 
import {Player} from "/js/class/tank/Player.js"; 
import {Mouse} from "/js/class/mouseHandling/Mouse.js";
import {Keyboard} from "/js/class/keyboardHandling/Keyboard.js";


let player = new Player(gameCanvas, ctx);
let mouse = new Mouse(gameCanvas);
let keyboard = new Keyboard(gameCanvas);

let curPos;
let vel = [0, 0];
let playerShots = [];

gameCanvas.addEventListener('mousemove', (evt) => {
    curPos = mouse.getMousePos(evt);
});

gameCanvas.addEventListener('mousedown', () => {
    let playerPos = player.getPlayerPos()
    let missile = new Missile(gameCanvas, ctx, curPos, playerPos);
    playerShots.push(missile);
});

document.addEventListener('keydown', (evt) => {
  vel = keyboard.getDirection(evt);
});

document.addEventListener('keyup', (evt) => {
  vel = keyboard.getDirection(evt);
});

function render() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  
    if (curPos) {
        player.draw(vel, curPos);
        player.drawAim(curPos);
    } else {
        player.draw(vel);
    }

    playerShots.forEach((missile) => {
        if (!missile.vx && !missile.vy) {
          missile.initDir();
        } 
        missile.draw();
    })

}

setInterval(()=>{
  render()
}, frameRate)


