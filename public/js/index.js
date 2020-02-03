const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const frameRate = 1000/60;
const posPingRate = 200;
const socket = io('http://localhost:5000');

import {DrawingTools} from "/public/js/class/drawingTools/DrawingTools.js";
import {Sender} from "/public/js/class/network/Sender.js";
import {MapManager} from "/public/js/class/mapManager/MapManager.js";
import {Missile} from "/public/js/class/weapon/Missile.js"; 
import {Player} from "/public/js/class/tank/Player.js"; 
import {Mouse} from "/public/js/class/mouseHandling/Mouse.js";
import {Keyboard} from "/public/js/class/keyboardHandling/Keyboard.js";
import {CollisionDetector} from "/public/js/class/collision/CollisionDetector.js";
import {GhostPlayer} from "/public/js/class/ghostPlayer/GhostPlayer.js";


let drawingTools = new DrawingTools(gameCanvas, ctx);
let mapManager = new MapManager(gameCanvas, ctx, drawingTools);
let map = mapManager.getMap();
let collisionDetector = new CollisionDetector(map)
let player = new Player(gameCanvas, ctx, drawingTools, collisionDetector);
let mouse = new Mouse(gameCanvas);
let keyboard = new Keyboard(gameCanvas);
let sender = new Sender(socket, keyboard, mouse);

let ghostPlayers = [];

let curPos;
let vel = [0, 0];
let playerShots = [];


sender.initPlayer(player.id, {x: player.x, y: player.y});

gameCanvas.addEventListener('mousemove', (evt) => {
    curPos = mouse.getMousePos(evt);
});

gameCanvas.addEventListener('mousedown', () => {
    let playerPos = player.getPlayerPos();
    let playerAngle = player.getPlayerAngle(curPos);
    let missile = new Missile(gameCanvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector);
    playerShots.push(missile);
    sender.sendMissileInit(player.id, {curPos: curPos, playerPos: playerPos, playerAngle: playerAngle, id: missile.id});
});

document.addEventListener('keydown', (evt) => {
    vel = keyboard.getDirection(evt);
    sender.sendKeys(player.id, vel);
});

document.addEventListener('keyup', (evt) => {
    vel = keyboard.getDirection(evt);
    sender.sendKeys(player.id, vel);
});

socket.on('playersData', (playersData) => {
    playersData.forEach((v)=>{
        console.log(playersData)
        if (!ghostPlayers.map(el => el.id).includes(v.id)) {
            ghostPlayers.push({ id: v.id, entity: new GhostPlayer(gameCanvas, ctx, drawingTools, v.id), coords: {x: v.entity.x, y: v.entity.y} });
        } else {
            let ghost = ghostPlayers.filter(el => el.id === v.id)[0];
            ghost.coords.x = v.entity.x;
            ghost.coords.y = v.entity.y;
        }
    })
})


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

    ghostPlayers.forEach((ghostPlayer) => {
        if (ghostPlayer.id !== player.id) {
            ghostPlayer.entity.updatePos(ghostPlayer.coords.x, ghostPlayer.coords.y);
        }
    })
}

setInterval(() => {
    render()
}, frameRate)

// ping player position
setInterval(() => {
    sender.pingPlayerPos(player.id, player.x, player.y);

    let missiles = [];
    playerShots.forEach((v)=>{
        let missileCoord = {x: v.x, y: v.y, id: v.id};
        missiles.push(missileCoord);
    })
    sender.pingMissilesPos(player.id, missiles);
}, posPingRate)




