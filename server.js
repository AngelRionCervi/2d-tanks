const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const socket = require('socket.io');
const server = http.Server(app);
const io = socket(server);
require('./server/helpers/helpers.js')();

const PlayerEntity = require('./server/playerTracking/PlayerEntity');
const Collision = require('./server/collision/BackCollisionDetecor');
const MapMg = require('./server/map/BackMapManager');
const MissileEntity = require('./server/missileTracking/MissileEntity');
const PelletsEntity = require('./server/missileTracking/PelletsEntity');
const ammoTypesClasses = {
    MissileEntity,
    PelletsEntity
}

const tickrate = 1000 / 60;
const snapshotsLength = 200;
const maxMsLag = 500;

const mapManager = new MapMg();
const map = mapManager.getMap();
const collisionDetector = new Collision(map);

app.set('port', 5000);
app.use("/public", express.static(__dirname + "/public"));
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/public/index.html'));
});
server.listen(5000, () => {
    console.log('Starting server on port 5000');
});

let players = [];
let playerKeysBuffer = [];
let playerRollBuffer = [];
let stateSnapshots = [];
let clientHitsBuffer = [];
let confirmedHits = [];


let getPlayer = (id) => players.find(el => el.id === id);
let getPlayerKeysBuffer = (id) => playerKeysBuffer.find(el => el.id === id);
let getPlayerRollBuffer = (id) => playerRollBuffer.find(el => el.id === id);
let getMissile = (idPlayer, idMissile) => {
    let player = getPlayer(idPlayer)
    if (player) {
        return player.projectiles.find(el => el.id === idMissile);
    }
}



io.on('connection', (socket) => {

    socket.on('initPlayer', (id, spawnPos, playerSprite, gun) => {
        console.log('a user connected', socket.id, playerSprite);
        let newPlayer = {
            socketID: socket.id, id: id, angle: 0, coords: { x: 0, y: 0 }, vx: 0, vy: 0,
            entity: new PlayerEntity(id, spawnPos, collisionDetector), projectiles: [], sprite: playerSprite, gun: gun,
        };
        players.push(newPlayer);
    })

    socket.on('keys', (data) => {
        let keys = { id: data.id, keys: { x: data.keys[1], y: data.keys[0] } };
        playerKeysBuffer.unshift(keys);
    })

    socket.on('roll', (data) => {
        let roll = { id: data.id, rolling: data.rolling, vel: data.player };
        playerRollBuffer.unshift(roll);
    })

    socket.on('playerPos', (id, x, y) => {
        let player = getPlayer(id);
        if (player) {
            player.entity.correctPos(x, y);
        }
    })

    socket.on('projectileInit', (id, projectile) => {
        let player = getPlayer(id);
        if (player) {
            player.projectiles.push({
                id: projectile.id, type: projectile.type, angle: projectile.playerAngle, coords: { x: projectile.playerPos.x, y: projectile.playerPos.y },
                entity: new ammoTypesClasses[projectile.type + "Entity"](projectile.curPos, projectile.playerPos, projectile.playerAngle, projectile.id, player.id, collisionDetector)
            });
        }
    })

    socket.on('missilesPos', (id, missiles) => {
        missiles.forEach((m) => {
            let missile = getMissile(id, m.id);
            if (missile) {
                missile.entity.correctPos(m.x, m.y, m.angle);
            }
        })
    })

    socket.on('mouseMove', (id, playerAngle) => {
        let player = getPlayer(id);
        if (player) {
            player.entity.updatePlayerAngle(playerAngle);
        }
    })

    socket.on('clientHits', (hits) => {
        clientHitsBuffer.push(hits);
    })

    socket.on('disconnect', () => {
        let index = players.map(el => el.socketID).indexOf(socket.id);
        if (players[index]) {
            players.splice(index, 1);
        }
    })
});

setInterval(() => {

    let packet = [];
/*
    clientHitsBuffer.forEach((clientHit) => {

        clientHit.forEach((hit) => {

            let snapshotsTimes = stateSnapshots.map(el => el.time);
            let closestSnapshotTime = closest(snapshotsTimes, hit.time);
            let snapshot = stateSnapshots[snapshotsTimes.indexOf(closestSnapshotTime)];
            let targetPlayer = snapshot.players.find(el => el.id === hit.targetID); //finds the targeted player;
            let shooterProjectiles = getPlayer(hit.shooterID).projectiles;
            let delta = Math.abs(closestSnapshotTime - hit.time);

            if (delta <= maxMsLag) {
                shooterProjectiles.forEach((projectile, i, a) => {
                    delta /= 1000;
                    delta += 1;
                    projectile.entity.updateDeltaPos(delta);
                     clients and server do not run at the same speed, so we need to adjsut the position of the projectile based on the difference between 
                    the time at which player shot the projectile and the time at which the snapshot has been taken 
                    projectile.coords.x = projectile.entity.x;
                    projectile.coords.y = projectile.entity.y;

                    let projectilePlayerColl = collisionDetector.playerProjectileCollision(
                        { x: targetPlayer.coords.x, y: targetPlayer.coords.y, width: targetPlayer.entity.size, height: targetPlayer.entity.size },
                        { x: projectile.coords.x, y: projectile.coords.y, width: projectile.entity.width, height: projectile.entity.height }
                    );

                    if (projectilePlayerColl) {
                        confirmedHits.push({ projectileID: projectile.id, shooterID: projectile.entity.playerID, targetID: targetPlayer.id, time: Date.now() });
                        getPlayer(targetPlayer.id).entity.gotHit();
                        a.splice(i, 1);
                    }
                })
            }
        })
    })*/

    players.forEach((player, playerIndex, playersArray) => {

        let playerNewKeys = getPlayerKeysBuffer(player.id);
        let playerNewRoll = getPlayerRollBuffer(player.id);

        if (playerNewKeys) {
            player.entity.updateKeys(playerNewKeys);
        }

        if (playerNewRoll) {
            if (playerNewRoll.rolling) {
                player.entity.rolling = true;
            }
        }

        player.entity.updatePos();

        player.coords.x = player.entity.x;
        player.coords.y = player.entity.y;
        player.vx = player.entity.vx;
        player.vy = player.entity.vy;
        player.angle = player.entity.playerAngle;
        player.health = player.entity.health;
        player.rolling = player.entity.rolling;

        if (player.projectiles.length > 0) {
            player.projectiles.forEach((projectile, i, a) => {

                if (!projectile.entity.fired) {
                    projectile.entity.initDir();
                }
                projectile.entity.updatePos();

                if (projectile.type === "Missile") {
                    if (projectile.entity.bounceCount > projectile.entity.maxBounce) {
                        a.splice(i, 1);
                    }
                    projectile.coords.x = projectile.entity.x;
                    projectile.coords.y = projectile.entity.y;
                    projectile.vx = projectile.entity.vx;
                    projectile.vy = projectile.entity.vy;
                    projectile.angle = projectile.entity.missileAngle;
                }
                else if (projectile.type === "Pellets") {

                    if (projectile.entity.pellets.length === 0) {
                        a.splice(i, 1);
                    }

                    projectile.pellets = projectile.entity.pellets;
                    //console.log([projectile.entity.pellets.map(el => el.x), projectile.entity.pellets.map(el => el.y)]);
                }
            })
        }

        // creates a lightweight object (without entities) to send to clients;
        let filteredObj = Object.filter(player, val => getKeyByValue(player, val) !== "entity");
        let filteredprojectiles = [];

        filteredObj.projectiles.forEach((m) => {
            let filteredM = Object.filter(m, val => getKeyByValue(m, val) !== "entity");
            filteredprojectiles.push(filteredM);
        })

        filteredObj.projectiles = filteredprojectiles;
        packet.push(filteredObj);
    })


    packet.time = Date.now();

    // saves a snapshot of the current tick;
    stateSnapshots.unshift({ players: players, time: packet.time });

    if (stateSnapshots.length > snapshotsLength) {
        stateSnapshots.splice(-1, 1);
    }

    io.emit('ghostsData', { ghostsData: packet, hits: confirmedHits });

    confirmedHits = [];
    playerKeysBuffer = [];
    playerRollBuffer = [];
    clientHitsBuffer = [];

}, tickrate)

