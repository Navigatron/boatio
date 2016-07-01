'use strict';

// ~~~~~~~~~~~~~~~ Declaration of variables ~~~~~~~~~~~~~~~

// Framework
var app =  require('express')();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);


// Timing Logic
var lastUpdate;
var now = +new Date();
var deltaTime;

// Dictionary of Players by ID.
var players = {};

// ~~~~~~~~~~~~~~~ Defenition of objects ~~~~~~~~~~~~~~~
// TODO - move this to a seperate File - In progress

var sO = require('./serverObjects.js');



// ~~~~~~~~~~~~~~~ Defenition of functions ~~~~~~~~~~~~~~~
// TODO - Order by appearance or alphabetical?

function addForceAtPoint(rigidbody, forceOffsetX, forceOffsetY, forceVectorX,  forceVectorY){
	// Linear Acceleration is Easy, just add it in there.
	rigidbody.vx += forceVectorX;
	rigidbody.vy += forceVectorY;
	// Angular Acceleration is Haaard.
	// Offset vector Crossproduct ForceVector - only need Z component - Divide by Moment of Inertia
	var cross = forceOffsetX*forceVectorY - forceOffsetY * forceVectorX;
}

function onNewPlayer(socket){
	//tell the console
	console.log(socket.id+' connected');
	//Server records this player
	players[socket.id] = new sO.player(socket.id);
	//Clients record this player
	io.emit('playerpos', socket.id, players[socket.id].position.x, players[socket.id].position.y, players[socket.id].rotation);
	//this player records everyone (including themselves)
	for(var id in players){
		socket.emit('playerpos', id, players[id].position.x, players[id].position.y, players[id].rotation);
	}
	//This is last so they have the players before we ask them to do stuff
	//let the player know they're online, so they know to start running things.
	socket.emit('wake up', socket.id);
}

function gameLoop() {
	lastUpdate = now;
	now = +new Date();
	deltaTime = now - lastUpdate;
	deltaTime/=1000;
	for(var id in players){
		players[id].update();
		players[id].step(deltaTime);
		io.emit('playerpos', id, players[id].position.x, players[id].position.y, players[id].rotation);
	}
	//run me at 120 fps
    setTimeout(gameLoop, 8);
}

// ~~~~~~~~~~~~~~~ Initialization and Start ~~~~~~~~~~~~~~~

// so we can serve static files at this resteraunt
app.use(require('express').static('public'));

// route, route, route your bytes, gently down the stream...
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	});

// TODO - get this out of here.
app.get('/health', function(req, res){
  res.writeHead(200);
  res.end();
});

// Defining game logic for Socket.io

io.on('connection',function(socket){

	// When a user connects.
	onNewPlayer(socket);

	// When a user disconnects.
	socket.on('disconnect',function(){
		console.log(socket.id+' disconnected');
		io.emit('player disconnected', socket.id);
		delete players[socket.id];
	});

	// When a user presses a relevent key.
	socket.on('keychange', function(keycode, state){
		if(players[socket.id]){
			players[socket.id]['_'+keycode] = state;
			//console.log('User '+socket.id+' sets '+keycode+' to '+state);
		}else{
			console.log(socket.id + 'Sent keycode before existing');
		}
	});
});

// The machine is constructed, Start it up!
gameLoop();

// Tell our server to listen to the great beyond - put some input into our now running machine.

http.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000, process.env.OPENSHIFT_NODEJS_IP, function(){
    console.log('Express server listening on port ' + (process.env.OPENSHIFT_NODEJS_PORT || 3000));
});
