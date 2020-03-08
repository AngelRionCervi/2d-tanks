const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const posPingRate = 1000 / 10;
const socket = io('http://localhost:5000');
const showFPS = true;


import { DrawingTools } from "/public/js/class/drawingTools/DrawingTools.js";
import { Sender } from "/public/js/class/network/Sender.js";
import { MapManager } from "/public/js/class/mapManager/MapManager.js";
import { Missile } from "/public/js/class/weapon/Missile.js";
import { Pellets } from "/public/js/class/weapon/Pellets.js";
import { Shotgun } from "./class/weapon/Shotgun.js";
import { RocketLauncher } from "./class/weapon/RocketLauncher.js";
import { Player } from "/public/js/class/player/Player.js";
import { Mouse } from "/public/js/class/mouseHandling/Mouse.js";
import { Keyboard } from "/public/js/class/keyboardHandling/Keyboard.js";
import { CollisionDetector } from "/public/js/class/collision/CollisionDetector.js";
import { GhostPlayer } from "/public/js/class/player/GhostPlayer.js";
import { GhostMissile } from "./class/weapon/GhostMissile.js";
import { Explosion } from "./class/weapon/Explosion.js";
import { ScreenShake } from "./class/weapon/ScreenShake.js";

let sprites;
let perfProfile;

const fpsProfile = getFPS();
const spritesFetch = new Promise((resolve, reject) => {
    fetch("/public/assets/sprites.json")
        .then(response => response.json())
        .then(json => {
            sprites = json;
            resolve({ playerSprites: "done" });
        })
        .catch(err => {
            console.log(err);
            reject();
        });
})

Promise.all([spritesFetch, fpsProfile]).then((promiseObjs) => { //waits for all async fetch

    promiseObjs.forEach((obj) => {
        if (obj.hasOwnProperty("fps")) {
            perfProfile = obj.fps > 100 ? "high" : "normal";
        }
    })

    let drawingTools = new DrawingTools(gameCanvas, ctx, sprites);
    let mapManager = new MapManager(gameCanvas, ctx, drawingTools, rndmInteger);
    let map = mapManager.getMap();
    let collisionDetector = new CollisionDetector(map)
    let player = new Player(gameCanvas, ctx, drawingTools, collisionDetector);
    let mouse = new Mouse(gameCanvas);
    let keyboard = new Keyboard(gameCanvas);
    let sender = new Sender(socket, keyboard, mouse);
    let curPos = null;

    const weapons = {
        shotgun: new Shotgun(ctx, drawingTools, player.getPlayerPos(), player.getPlayerAbsolutePos(), player.playerAngle, "Pellets"),
        RL: new RocketLauncher(ctx, drawingTools, player.getPlayerPos(), player.getPlayerAbsolutePos(), player.playerAngle, "Missile")
    }

    let ghostPlayers = [];

    let vel = [0, 0];
    let playerShots = [];
    let explosions = [];
    let lastRun;
    let playerAngle;
    let screenShake = false;

    let lastKey = { type: "", key: "" };
    let roll = false;
    let rollKeyUp = true;


    sender.initPlayer(player.id, { x: player.x, y: player.y }, drawingTools.playerSprite.name);

    gameCanvas.addEventListener('mousemove', (evt) => {
        curPos = mouse.getMousePos(evt);
    });

    gameCanvas.addEventListener('mousedown', () => {
        let playerPos = player.getPlayerPos();
        let playerAngle = player.getPlayerAngle(curPos);
        let projectile;
        if (player.currentGun === "RL") {
            projectile = { type: "Missile", obj: new Missile(gameCanvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector) };
            if (playerShots.filter(el => el.type === "Missile").length < player.maxConcurringMissiles) {
                playerShots.push(projectile);
                sender.sendMissileInit(player.id, { curPos: curPos, playerPos: playerPos, playerAngle: playerAngle, id: projectile.obj.id });
            }
        }
        else if (player.currentGun === "shotgun") {
            projectile = { type: "Pellets", obj: new Pellets(gameCanvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector) };
            playerShots.push(projectile);
        }
    });

    document.addEventListener('keydown', (evt) => {
        if (lastKey.type !== evt.type || lastKey.key !== evt.key) {
            vel = keyboard.getKeys(evt);
            sender.sendKeys(player.id, vel);
            lastKey.type = evt.type;
            lastKey.key = evt.key;
            roll = keyboard.getSpaceBar();
            if (roll && player.rollTimeoutDone && !player.rolling && (player.vx || player.vy)) {
                player.rollTimeoutDone = false;
                player.rolling = true;
                sender.sendRoll(player.id, roll, { vx: player.vx, vy: player.vy });
                roll = false;
            }
        }
    });

    document.addEventListener('keyup', (evt) => {
        if (lastKey.type !== evt.type || lastKey.key !== evt.key) {
            vel = keyboard.getKeys(evt);
            sender.sendKeys(player.id, vel);
            lastKey.type = evt.type;
            lastKey.key = evt.key;
            roll = keyboard.getSpaceBar();
        }
    });

    socket.on('ghostsData', (ghosts) => {

        let disconnectDude = ghostPlayers.find(el => !ghosts.ghostsData.map(e => e.id).includes(el.id))

        if (disconnectDude) {
            ghostPlayers = ghostPlayers.filter(el => el.id !== disconnectDude.id); //remove ghost if the id isnt in the session anymore
            console.log(disconnectDude.id + " has disconnected")
        }

        ghosts.ghostsData.forEach((player) => {
            if (!ghostPlayers.map(el => el.id).includes(player.id)) {
                let ghostObj = {
                    id: player.id, entity: new GhostPlayer(gameCanvas, ctx, drawingTools, player.id, collisionDetector, player.coords.x, player.coords.y),
                    coords: { x: player.coords.x, y: player.coords.y }, vx: 0, vy: 0, playerAngle: player.coords.playerAngle,
                    missiles: [], sprite: player.sprite, health: player.health, rolling: player.rolling
                };

                ghostPlayers.push(ghostObj);
            }
            else {
                let ghost = ghostPlayers.find(el => el.id === player.id);

                if (player.missiles.length !== ghost.missiles.length) {

                    let newMissile = player.missiles.find(el => !ghost.missiles.map(e => e.id).includes(el.id));

                    if (newMissile) {
                        let missileObj = {
                            id: newMissile.id, entity: new GhostMissile(gameCanvas, ctx, drawingTools, collisionDetector, newMissile.id),
                            coords: { x: newMissile.x, y: newMissile.y }, vx: 0, vy: 0, angle: newMissile.missileAngle, set: false
                        };
                        ghost.missiles.push(missileObj);

                    } else {
                        ghost.missiles.forEach((missile) => {
                            if (!player.missiles.map(e => e.id).includes(missile.id)) {
                                explosions.push(new Explosion(missile.entity.x, missile.entity.y, missile.entity.id, drawingTools));
                            }
                        })
                        ghost.missiles = ghost.missiles.filter(el => player.missiles.map(e => e.id).includes(el.id)); //remove missile if the missile isnt in the session
                    }
                }

                ghost.coords.x = player.coords.x;
                ghost.coords.y = player.coords.y;
                ghost.vx = player.vx;
                ghost.vy = player.vy;
                ghost.playerAngle = player.angle;
                ghost.entity.health = player.health;
                ghost.entity.rolling = player.rolling;


                ghost.missiles.forEach((missile, i) => {
                    if (player.missiles[i]) {
                        missile.coords.x = player.missiles[i].coords.x;
                        missile.coords.y = player.missiles[i].coords.y;
                        missile.vx = player.missiles[i].vx;
                        missile.vy = player.missiles[i].vy;
                        missile.angle = player.missiles[i].angle;
                    }
                })
            }
        })

        ghosts.hits.forEach((hit) => {
            if (hit.shooterID === player.id && hit.targetID === player.id) {
                console.log("you hit yourself :<")
                player.gotHit();
            }
            else if (hit.shooterID === player.id) {
                console.log("hit : " + hit.targetID);
                let ghost = ghostPlayers.find(el => el.id === hit.targetID);
                ghost.entity.gotHit();
            }
            else if (hit.targetID === player.id) {
                console.log("hit by : " + hit.shooterID);
                player.gotHit();
            }

            if (hit.shooterID === player.id) {
                removeMissile(hit.missileID, 'player');
            }
            else {
                removeMissile(hit.missileID, 'ghost');
            }

        })
    })

    function removeMissile(id, player) {
        if (player === 'player') {
            playerShots = playerShots.filter(el => el.obj.id !== id);
        } else {
            ghostPlayers.forEach((ghost) => {
                if (ghost.missiles.map(el => el.obj.id).includes(id)) {
                    ghost.missiles = ghost.missiles.filter(el => el.obj.id !== id);
                }
            })
        }
    }


    function render() {

        if (!lastRun) {
            lastRun = performance.now();
            render()
            return;
        }

        let delta = (performance.now() - lastRun) / 1000;
        let deltaIncrease = delta * 100;
        lastRun = performance.now();
        let fps = 1 / delta;

        //ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        let shakeX = 0;
        let shakeY = 0;

        if (screenShake) {
            let shake = screenShake.preShake();
            shakeX = shake.dx;
            shakeY = shake.dy;
        }

        mapManager.renderMap(map, shakeX, shakeY);

        if (screenShake) {
            screenShake.postShake();
            if (screenShake.ended) {
                screenShake = false;
            }
        }

        player.draw(vel, deltaIncrease);

        if (curPos) player.drawAim(curPos, map);

        weapons[player.currentGun].draw(player.currentGun, player.getPlayerPos(), player.getPlayerAbsolutePos(), player.getPlayerAngle());

        let clientHits = [];

        playerShots.forEach((projectile) => {
            if (!projectile.obj.fired) {
                projectile.obj.initDir();
            }
            projectile.obj.draw(deltaIncrease);
 
            if (projectile.type === "Missile") {
                if (projectile.obj.bounceCount > projectile.obj.maxBounce) {
                    removeMissile(projectile.obj.id, "player");
                    explosions.push(new Explosion(projectile.obj.x, projectile.obj.y, projectile.obj.id, drawingTools));
                    screenShake = new ScreenShake(rndmFloat);
                    projectile.obj.fired = false;
                }
            }
            else if (projectile.type === "Pellets") {
                if (projectile.obj.collidedPellets.length > 0) {
                    projectile.obj.collidedPellets.forEach((pellet) => {
                        explosions.push(new Explosion(pellet.x, pellet.y, pellet.id, drawingTools));
                        screenShake = new ScreenShake(rndmFloat);
                    })
                    projectile.obj.collidedPellets = [];
                }
            }
            

            ghostPlayers.forEach((ghost) => {
                if (ghost.id !== player.id) {
                    let ghostProjectileColl = collisionDetector.playerMissileCollision(
                        { x: ghost.coords.x, y: ghost.coords.y, width: ghost.entity.size, height: ghost.entity.size },
                        { x: projectile.obj.x, y: projectile.obj.y, width: projectile.obj.width, height: projectile.obj.height }
                    );

                    if (ghostProjectileColl) {
                        clientHits.push({ missileID: projectile.obj.id, shooterID: player.id, targetID: ghost.id, time: Date.now() })
                        projectile.obj.hide = true;
                        explosions.push(new Explosion(projectile.obj.x, projectile.obj.y, projectile.id, drawingTools));
                        screenShake = new ScreenShake(rndmFloat);
                    }
                }
            })
        })

        ghostPlayers.forEach((ghostPlayer) => {
            if (ghostPlayer.id !== player.id) {
                ghostPlayer.entity.update(ghostPlayer, deltaIncrease);
                ghostPlayer.missiles.forEach((missile) => {
                    if (!missile.set) { // once a initial pos and missile vels are set, its all front end, except if collision with player (server authority)
                        missile.entity.set(missile);
                        missile.set = true;
                    }
                    else {
                        missile.entity.update(deltaIncrease);
                    }
                })
            }
        })

        explosions.forEach((explosion, i, a) => {
            if (!explosion.started) {
                explosion.started = true;
            } else {
                explosion.animate();
                if (explosion.ended) {
                    a.splice(i, 1);
                }
            }
        })

        if (clientHits.length > 0) {
            sender.sendClientHits(clientHits);
        }

        if (curPos) {
            let currentPlayerAngle = player.getPlayerAngle(curPos);
            if (currentPlayerAngle !== playerAngle) {
                sender.sendMouseMove(player.id, currentPlayerAngle);
            }
            playerAngle = currentPlayerAngle;
        }

        if (showFPS) showFps(fps, ctx);

    }

    setInterval(() => {
        render();
    }, 1000 / 144)

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

})
