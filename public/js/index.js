const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const posPingRate = 1000 / 10;
const socket = io('http://localhost:5000');
const showFPS = true;


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
    let player = new Player(gameCanvas, ctx, drawingTools, collisionDetector, perfProfile);
    let mouse = new Mouse(gameCanvas);
    let keyboard = new Keyboard(gameCanvas);
    let sender = new Sender(socket, keyboard, mouse);
    

    let ghostPlayers = [];

    let curPos;
    let vel = [0, 0];
    let playerShots = [];
    let explosions = [];
    let lastRun;
    let playerAngle;
    let screenShake = false;

    let lastKey = { type: "", key: "" };
    let roll = false;


    sender.initPlayer(player.id, { x: player.x, y: player.y }, drawingTools.playerSprite.name);

    gameCanvas.addEventListener('mousemove', (evt) => {
        curPos = mouse.getMousePos(evt);
    });

    gameCanvas.addEventListener('mousedown', () => {
        let playerPos = player.getPlayerPos();
        let playerAngle = player.getPlayerAngle(curPos);
        let missile = new Missile(gameCanvas, ctx, curPos, playerPos, playerAngle, drawingTools, collisionDetector);
        if (playerShots.length < player.maxConcurringMissiles) {
            playerShots.push(missile);
            sender.sendMissileInit(player.id, { curPos: curPos, playerPos: playerPos, playerAngle: playerAngle, id: missile.id });
        }
    });

    document.addEventListener('keydown', (evt) => {
        if (lastKey.type !== evt.type || lastKey.key !== evt.key) {
            vel = keyboard.getKeys(evt);
            sender.sendKeys(player.id, vel);
            lastKey.type = evt.type;
            lastKey.key = evt.key;
            roll = keyboard.getSpaceBar();
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
                    id: player.id, entity: new GhostPlayer(gameCanvas, ctx, drawingTools, player.id, perfProfile),
                    coords: { x: player.coords.x, y: player.coords.y }, vx: 0, vy: 0, playerAngle: player.coords.playerAngle
                    ,missiles: [], sprite: player.sprite, health: player.health
                };

                ghostPlayers.push(ghostObj);
            } 
            else {
                let ghost = ghostPlayers.find(el => el.id === player.id);

                if (player.missiles.length !== ghost.missiles.length) {

                    let newMissile = player.missiles.find(el => !ghost.missiles.map(e => e.id).includes(el.id));

                    if (newMissile) {
                        let missileObj = {
                            id: newMissile.id, entity: new GhostMissile(gameCanvas, ctx, drawingTools, newMissile.id, collisionDetector),
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

    function removeMissile(id, type) {
        if (type === 'player') {
            playerShots = playerShots.filter(el => el.id !== id);
        } else {
            ghostPlayers.forEach((ghost) => {
                if (ghost.missiles.map(el => el.id).includes(id)) {
                    ghost.missiles = ghost.missiles.filter(el => el.id !== id);
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

        if (roll && !player.rolling) player.rolling = true;

        let clientHits = [];

        playerShots.forEach((missile) => {
            if (!missile.vx && !missile.vy) {
                missile.initDir();
            }
            missile.draw(deltaIncrease);

            if (missile.bounceCount > missile.maxBounce) {
                removeMissile(missile.id, "player");
                explosions.push(new Explosion(missile.x, missile.y, missile.id, drawingTools));
                screenShake = new ScreenShake(rndmFloat);
            }

            ghostPlayers.forEach((ghost) => {
                let ghostMissileColl = collisionDetector.playerMissileCollision(
                    { x: ghost.coords.x, y: ghost.coords.y, width: ghost.entity.size, height: ghost.entity.size },
                    { x: missile.x, y: missile.y, width: missile.width, height: missile.height }
                );

                if (ghostMissileColl) {
                    clientHits.push({ missileID: missile.id, shooterID: player.id, targetID: ghost.id, time: Date.now() })
                    missile.hide = true;
                    explosions.push(new Explosion(missile.x, missile.y, missile.id, drawingTools));
                    screenShake = new ScreenShake(rndmFloat);
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
        
        if (clientHits.length > 0)  {
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

        requestAnimationFrame(render);
    }

    render();

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
