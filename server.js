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

const tickrate = 1000 / 100;

const mapManager = new MapMg();
const map = mapManager.getMap();
const CollisionDetector = new Collision(map);

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

let getPlayer = (id) => players.filter(el => el.id === id)[0];
let getPlayerKeysBuffer = (id) => playerKeysBuffer.filter(el => el.id === id)[0];

let getMissile = (idPlayer, idMissile) => {
    let player = getPlayer(idPlayer)
    if (player) {
        return player.missiles.filter(el => el.id === idMissile)[0];
    }
}



io.on('connection', (socket) => {

    socket.on('initPlayer', (id, spawnPos) => {
        console.log('a user connected');
        let newPlayer = { id: id, angle: 0, coords: { x: 0, y: 0 }, entity: new PlayerEntity(id, spawnPos, CollisionDetector), missiles: [] };
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
            entity: new MissileEntity(missile.curPos, missile.playerPos, missile.playerAngle, missile.id, CollisionDetector)
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
});

setInterval(() => {
    players.forEach((player, i) => {

        let playerNewKeys = getPlayerKeysBuffer(player.id);

        if (playerNewKeys) {
            player.entity.updateKeys(playerNewKeys);
        }

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
                missile.angle = missile.entity.missileAngle;
            })
        }

        player.entity.updatePos();

        player.coords.x = player.entity.x;
        player.coords.y = player.entity.y;
        player.angle = player.entity.playerAngle;
    })

    playerKeysBuffer = [];

    // filters entity object for lighter payload
    let packet = JSON.parse(JSON.stringify(players));

    packet.forEach((pack) => {
        delete pack.entity;
        pack.missiles.forEach((missile) => {
            delete missile.entity;
        })
    })

    io.emit('ghostsData', packet);
}, tickrate)

