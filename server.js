const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const socketIO = require('socket.io');
const server = http.Server(app);
const io = socketIO(server);

const PlayerEntity = require('./server/playerTracking/PlayerEntity');
const Map = require('./server/map/Map');


app.set('port', 5000);
app.use("/public", express.static(__dirname + "/public"));
app.get('/', (request, response) => {
  response.sendFile(path.join( __dirname, '/public/index.html'));
});
server.listen(5000, () => {
  console.log('Starting server on port 5000');
});



let players = [];

let playerKeysBuffer = [];

io.on('connection', (socket) => {
  
    socket.on('initPlayer', (id, spawnPos) => {
        console.log('a user connected');
        let newPlayer = {id: id, player: new PlayerEntity(id, spawnPos)};
        players.push(newPlayer);
    })

    socket.on('keys', (data) => {
        let keys = { id: data.id, keys: {x: data.keys[1], y: data.keys[0] }};
        
        playerKeysBuffer.unshift(keys);
    })
});

setInterval(() => {
    players.forEach((v) => {
        
        let playerKeys = playerKeysBuffer.filter(el => el.id === v.id)[0];
        
        if (playerKeys) {
            v.player.updateKeys(playerKeys);
        }
        
        v.player.updatePos();

        console.log(v.player.lastKeys);
    })
    playerKeysBuffer = [];
}, 1000/60)

