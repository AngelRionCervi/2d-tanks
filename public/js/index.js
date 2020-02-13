const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const frameRate = 1000 / 100;
const posPingRate = 1000 / 10;
const socket = io('http://localhost:5000');

import { DrawingTools } from "/public/js/class/drawingTools/DrawingTools.js";
import { Sender } from "/public/js/class/network/Sender.js";
import { MapManager } from "/public/js/class/mapManager/MapManager.js";
import { Missile } from "/public/js/class/weapon/Missile.js";
import { Player } from "/public/js/class/tank/Player.js";
import { Mouse } from "/public/js/class/mouseHandling/Mouse.js";
import { Keyboard } from "/public/js/class/keyboardHandling/Keyboard.js";
import { CollisionDetector } from "/public/js/class/collision/CollisionDetector.js";
import { GhostPlayer } from "/public/js/class/ghostPlayer/GhostPlayer.js";
import { GhostMissile } from "./class/ghostMissile/GhostMissile.js";


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

let lastKey = { type: "", key: "" };


sender.initPlayer(player.id, { x: player.x, y: player.y });

gameCanvas.addEventListener('mousemove', (evt) => {
    curPos = mouse.getMousePos(evt);
    let playerAngle = player.getPlayerAngle(curPos);
    sender.sendMouseMove(player.id, playerAngle);
});

gameCanvas.addEventListener('mousedown', () => {
    let playerPos = player.getPlayerPos();
    let playerAngle = player.getPlayerAngle(curPos);
    let missile = new Missile(gameCanvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector);
    if (playerShots.length < 99) {
        playerShots.push(missile);
        sender.sendMissileInit(player.id, { curPos: curPos, playerPos: playerPos, playerAngle: playerAngle, id: missile.id });
    }
});

document.addEventListener('keydown', (evt) => {
    if (lastKey.type !== evt.type || lastKey.key !== evt.key) {
        vel = keyboard.getDirection(evt);
        sender.sendKeys(player.id, vel);
        lastKey.type = evt.type;
        lastKey.key = evt.key;
    }
});

document.addEventListener('keyup', (evt) => {
    if (lastKey.type !== evt.type || lastKey.key !== evt.key) {
        vel = keyboard.getDirection(evt);
        sender.sendKeys(player.id, vel);
        lastKey.type = evt.type;
        lastKey.key = evt.key;
    }
});

socket.on('ghostsData', (playersData) => {
    playersData.forEach((player) => {

        if (!ghostPlayers.map(el => el.id).includes(player.id)) {
            let ghostObj = { id: player.id, entity: new GhostPlayer(gameCanvas, ctx, drawingTools, player.id), coords: { x: player.coords.x, y: player.coords.y }, playerAngle: player.coords.playerAngle, missiles: [] };
            ghostPlayers.push(ghostObj);

        } else {
            let ghost = ghostPlayers.find(el => el.id === player.id);

            if (player.missiles.length !== ghost.missiles.length) {

                let newMissile = player.missiles.find(el => !ghost.missiles.map(e => e.id).includes(el.id));

                if (newMissile) {
                    let missileObj = { id: newMissile.id, entity: new GhostMissile(gameCanvas, ctx, drawingTools, newMissile.id), coords: { x: newMissile.x, y: newMissile.y }, angle: newMissile.missileAngle };
                    ghost.missiles.push(missileObj);
                } else {
                    ghost.missiles = ghost.missiles.filter(el => player.missiles.map(e => e.id).includes(el.id)); // syncs ghost missiles and player missiles
                }

            }

            ghost.coords.x = player.coords.x;
            ghost.coords.y = player.coords.y;
            ghost.playerAngle = player.angle;

            ghost.missiles.forEach((missile, i) => {
                missile.coords.x = player.missiles[i].coords.x;
                missile.coords.y = player.missiles[i].coords.y;
                missile.angle = player.missiles[i].angle;
            })
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

    playerShots.forEach((missile, i, a) => {
        if (!missile.vx && !missile.vy) {
            missile.initDir();
        }
        missile.draw();

        if (missile.bounceCount > missile.maxBounce) {
            a.splice(i, 1);
        }

        let playerMissileColl = collisionDetector.playerMissileCollision({x: player.x, y: player.y, width: player.baseSizeY, height: player.baseSizeY}, 
            {x: missile.x, y: missile.y, width: missile.width, height: missile.height});

        if (playerMissileColl) {
            console.log("player missile coll")
        }
    })

    ghostPlayers.forEach((ghostPlayer) => {

        if (ghostPlayer.id !== player.id) {
            ghostPlayer.entity.update(ghostPlayer);
            ghostPlayer.missiles.forEach((missile) => {
                missile.entity.updatePos(missile.coords.x, missile.coords.y, missile.angle);
            })
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
    playerShots.forEach((m) => {
        let missileCoord = { x: m.x, y: m.y, angle: m.missileAngle, id: m.id };
        missiles.push(missileCoord);
    })
    sender.pingMissilesPos(player.id, missiles);
}, posPingRate)




