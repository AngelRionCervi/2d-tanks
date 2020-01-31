const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const frameRate = 1000/60;

import {DrawingTools} from "/public/js/class/drawingTools/DrawingTools.js";
import {MapManager} from "/public/js/class/mapManager/MapManager.js";
import {Missile} from "/public/js/class/weapon/Missile.js"; 
import {Player} from "/public/js/class/tank/Player.js"; 
import {Mouse} from "/public/js/class/mouseHandling/Mouse.js";
import {Keyboard} from "/public/js/class/keyboardHandling/Keyboard.js";
import {CollisionDetector} from "/public/js/class/collision/CollisionDetector.js";


let drawingTools = new DrawingTools(gameCanvas, ctx);
let mapManager = new MapManager(gameCanvas, ctx, drawingTools);
let map = mapManager.getMap();
let collisionDetector = new CollisionDetector(map)
let player = new Player(gameCanvas, ctx, drawingTools, collisionDetector);
let mouse = new Mouse(gameCanvas);
let keyboard = new Keyboard(gameCanvas);



let curPos;
let vel = [0, 0];
let playerShots = [];


gameCanvas.addEventListener('mousemove', (evt) => {
    curPos = mouse.getMousePos(evt);
});

gameCanvas.addEventListener('mousedown', () => {
    let playerPos = player.getPlayerPos();
    let playerAngle = player.getPlayerAngle(curPos);
    let missile = new Missile(gameCanvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector);
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

    mapManager.renderMap(map);
    
    player.draw(vel);

    if (curPos) {
      player.drawAim(curPos, map);
    } 

    playerShots.forEach((missile) => {
        if (!missile.vx && !missile.vy) {
          missile.initDir();
        } 
        missile.draw();
    })
    
    requestAnimationFrame(render);
}


render()




