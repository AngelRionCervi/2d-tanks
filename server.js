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
const Missile = require('./server/missileTracking/MissileEntity');

const tickrate = 1000 / 60;

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
let getMissile = (idPlayer, idMissile) => getPlayer(idPlayer).missiles.filter(el => el.id === idMissile)[0];
let getPlayerKeysBuffer = (id) => playerKeysBuffer.filter(el => el.id === id)[0];



io.on('connection', (socket) => {

    socket.on('initPlayer', (id, spawnPos) => {
        console.log('a user connected');
        let newPlayer = { id: id, entity: new PlayerEntity(id, spawnPos, CollisionDetector), missiles: [] };
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
        player.missiles.push(new Missile(missile.curPos, missile.playerPos, missile.playerAngle, missile.id, CollisionDetector));
    })

    socket.on('missilesPos', (id, missiles) => {
        missiles.forEach((v) => {
            let missile = getMissile(id, v.id);
            if (missile) {
                missile.correctPos(v.x, v.y);
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
    players.forEach((v, i) => {
        
        let playerNewKeys = getPlayerKeysBuffer(v.id);
        
        if (playerNewKeys) {
            v.entity.updateKeys(playerNewKeys);
        }

        if (v.missiles.length > 0) {
            v.missiles.forEach((missile) => {
                if (!missile.vx && !missile.vy) {
                    missile.initDir();
                }
                missile.updatePos();
            })
        }

        v.entity.updatePos();
    })

    playerKeysBuffer = [];                               
   
    io.emit('ghostsData', players);
}, tickrate)

