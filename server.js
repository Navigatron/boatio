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

// socket ID --> player Object ID.
var players = {};

//This holds the universe. player Object ID --> player Object.
var things = {};

// ID counter for /our/ ID system.
var _idCounter = 0;

// ~~~~~~~~~~~~~~~ Defenition of objects ~~~~~~~~~~~~~~~
// TODO - move this to a seperate File - In progress

var sO = require('./serverObjects.js');



// ~~~~~~~~~~~~~~~ Defenition of functions ~~~~~~~~~~~~~~~
// TODO - Order by appearance or alphabetical?

function getNewID(){
	_idCounter++;
	return _idCounter;
}

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
				//x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey, id
	var id = getNewID();
	things[id] = new sO.player(0, 0, 90, 1, 10, 270, 20, 1, 1, id);
	players[socket.id] = id;

	var tr = things[id].getComponent('transform');
	//Clients record this player
	io.emit('playerpos', id, tr.position.x, tr.position.y, tr.rotation);
	//this player records everyone (including themselves)
	for(var ido in things){
		socket.emit('playerpos', ido, things[ido].getComponent('transform').position.x, things[ido].getComponent('transform').position.y, things[ido].getComponent('transform').rotation);
	}
	//This is last so they have the players before we ask them to do stuff
	//let the player know they're online, so they know to start running things.
	socket.emit('wake up', id);
}

function gameLoop() {
	//Calculate deltaTime
	lastUpdate = now;
	now = +new Date();
	deltaTime = now - lastUpdate;
	deltaTime/=1000;

	//Physics step
	for(var id in things){
		if(things[id].getComponent('rigidBody')){
			things[id].getComponent('rigidBody').step(deltaTime);
		}
	}

	//Collision Detection
	//Broad Detection
	//Narrow Detection

	//So ... How do we do this?
	for(var id in things){
		for(var ido in things){
			if(id != ido && things[id].getComponent('rigidBody')){
				things[id].getComponent('rigidBody').step(deltaTime);
			}
		}
	}

	//Push to players -- we don't do this -- the networkView component does this

	//Object update

	for(var id in things){
		things[id].update(deltaTime);
		//things[id].step(deltaTime);
		io.emit('playerpos', id, things[id].transform.position.x, things[id].transform.position.y, things[id].transform.rotation);
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
		io.emit('player disconnected', players[socket.id]);
		delete things[players[socket.id]]
		delete players[socket.id];
	});

	// When a user presses a relevent key.
	socket.on('keychange', function(keycode, state){
		if(things[players[socket.id]]){
			things[players[socket.id]]['_'+keycode] = state;
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
