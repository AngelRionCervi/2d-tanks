const express = require('express');
const http = require('http');
let app = express();
const path = require('path');
const socketIO = require('socket.io');
const server = http.Server(app);
const io = socketIO(server);
app.set('port', 5000);

app.use("/public", express.static(__dirname + "/public"));

app.get('/', function(request, response) {
  response.sendFile(path.join( __dirname, '/public/index.html'));
});// Starts the server.

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

