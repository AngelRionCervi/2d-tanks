const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const socket = require('socket.io');
const server = http.Server(app);
const io = socket(server);

const PlayerEntity = require('./server/playerTracking/PlayerEntity');
const Collision = require('./server/collision/BackCollisionDetecor');
const MapMg = require('./server/map/BackMapManager');
const MissileEntity = require('./server/missileTracking/MissileEntity');

const tickrate = 1000 / 60;
const snapshotsLength = 10;

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
let stateSnapshots = [];
let clientHitsBuffer = [];
let serverHitsBuffer = [];

let getPlayer = (id) => players.find(el => el.id === id);
let getPlayerKeysBuffer = (id) => playerKeysBuffer.find(el => el.id === id);

let getMissile = (idPlayer, idMissile) => {
    let player = getPlayer(idPlayer)
    if (player) {
        return player.missiles.find(el => el.id === idMissile);
    }
}



io.on('connection', (socket) => {

    socket.on('initPlayer', (id, spawnPos) => {
        console.log('a user connected');
        let newPlayer = { id: id, angle: 0, coords: { x: 0, y: 0 }, vx: 0, vy: 0, entity: new PlayerEntity(id, spawnPos, collisionDetector), missiles: [] };
        players.push(newPlayer);
    })

    socket.on('keys', (data) => {
        let keys = { id: data.id, keys: { x: data.keys[1], y: data.keys[0] } };

        playerKeysBuffer.unshift(keys);
    })

    socket.on('playerPos', (id, x, y) => {
        let player = getPlayer(id);

        if (player) {
            player.entity.correctPos(x, y);
        }
    })

    socket.on('missileInit', (id, missile) => {
        let player = getPlayer(id);
        player.missiles.push({
            id: missile.id, angle: missile.playerAngle, coords: { x: missile.playerPos.x, y: missile.playerPos.y },
            entity: new MissileEntity(missile.curPos, missile.playerPos, missile.playerAngle, missile.id, collisionDetector)
        });
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
});

setInterval(() => {
    players.forEach((player) => {

        let playerNewKeys = getPlayerKeysBuffer(player.id);

        if (playerNewKeys) {
            player.entity.updateKeys(playerNewKeys);
        }

        player.entity.updatePos();

        player.coords.x = player.entity.x;
        player.coords.y = player.entity.y;
        player.vx = player.entity.vx;
        player.vy = player.entity.vy;
        player.angle = player.entity.playerAngle;

        if (player.missiles.length > 0) {
            player.missiles.forEach((missile, i, a) => {

                if (!missile.entity.vx && !missile.entity.vy) {
                    missile.entity.initDir();
                }
                missile.entity.updatePos();

                if (missile.entity.bounceCount > missile.entity.maxBounce) {
                    a.splice(i, 1);
                }

                missile.coords.x = missile.entity.x;
                missile.coords.y = missile.entity.y;
                missile.vx = missile.entity.vx;
                missile.vy = missile.entity.vy;
                missile.angle = missile.entity.missileAngle;
                
            })
        }
        /*
        players.map(el => el.missiles).forEach((missile) => {

            let missilePlayerColl = collisionDetector.playerMissileCollision({ x: player.coords.x, y: player.coords.y, 
                width: player.entity.baseSizeY, height: player.entity.baseSizeY }, 
                { x: missile.coords.x, y: missile.coords.y, width: missile.entity.width, height: missile.entity.height });
            console.log(missilePlayerColl, missile.coords.x, missile.coords.y)
            if (missilePlayerColl) {
                serverHitsBuffer.push({ playerID: player.id, targetID: missile.id });
            }
        })*/
    })

    let missiles = [...players.map(el => el.missiles.filter(e => {
        
    }))]

    console.log(...players.map(el => el.missiles));
    //console.log(serverHitsBuffer)
    serverHitsBuffer = [];
    playerKeysBuffer = [];
    clientHitsBuffer = [];

    // filters entity object for lighter payload, there's probably something better to do lol
    let packet = JSON.parse(JSON.stringify(players));

    packet.forEach((pack) => {
        delete pack.entity;
        pack.missiles.forEach((missile) => {
            delete missile.entity;
        })
    })

    stateSnapshots.unshift(packet);

    if (stateSnapshots.length > snapshotsLength) {
        stateSnapshots.splice(-1, 1);
    }

    io.emit('ghostsData', packet);
}, tickrate)

