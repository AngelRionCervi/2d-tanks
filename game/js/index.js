const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const frameRate = 1000/60;

import {DrawingTools} from "/js/class/drawingTools/DrawingTools.js";
import {MapManager} from "/js/class/mapManager/MapManager.js";
import {Missile} from "/js/class/weapon/Missile.js"; 
import {Player} from "/js/class/tank/Player.js"; 
import {Mouse} from "/js/class/mouseHandling/Mouse.js";
import {Keyboard} from "/js/class/keyboardHandling/Keyboard.js";
import {CollisionDetector} from "/js/class/collision/CollisionDetector.js";

let drawingTools = new DrawingTools(gameCanvas, ctx);
let mapManager = new MapManager(gameCanvas, ctx);
let player = new Player(gameCanvas, ctx, drawingTools);
let mouse = new Mouse(gameCanvas);
let keyboard = new Keyboard(gameCanvas);


let map = mapManager.getMap();

let curPos;
let vel = [0, 0];
let playerShots = [];

let collisionDetector = new CollisionDetector(player, map, playerShots)


gameCanvas.addEventListener('mousemove', (evt) => {
    curPos = mouse.getMousePos(evt);
});

gameCanvas.addEventListener('mousedown', () => {
    let playerPos = player.getPlayerPos()
    let missile = new Missile(gameCanvas, ctx, curPos, playerPos, drawingTools);
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
    let playerMapColl = collisionDetector.mapPlayerCollision();

    player.draw(vel, playerMapColl);

    if (curPos) {
      player.drawAim(curPos, map);
    } 
    

    playerShots.forEach((missile) => {
        if (!missile.vx && !missile.vy) {
          missile.initDir();
        } 
        let missileMapColl = collisionDetector.mapMissileCollision(missile);
        missile.draw(missileMapColl);
    })
    
    requestAnimationFrame(render);
}


render()




