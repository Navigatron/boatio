'use strict';

// ~~~~~~~~~~~~~~~ Declaration of variables ~~~~~~~~~~~~~~~

// Framework
//var app =  require('express')();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

//TODO - LESS SPAGHETTI
module.exports = function(http){
	var io = require('socket.io')(http);
};

// Timing Logic
var lastUpdate;
var now = +new Date();
var deltaTime;

// Dictionary of Players by ID.
var players = {};

// ~~~~~~~~~~~~~~~ Defenition of objects ~~~~~~~~~~~~~~~
// TODO - move this to a seperate File - In progress

var sO = require('./serverObjects.js');
sO.test();
var sb = new sO.shipBrick(1,2,3,4,5);

var player = function(id){
	// Keep track of key presses
		this._87= false;
		this._65= false;
		this._83= false;
		this._68= false;
	// Position and Rotation
		this.x = 0;
		this.y = 0;
		this.r = 90;
	// Velocitiy Vector Components
		this.vx = 0;
		this.vy = 0;
		this.vr = 0;
	// Dampening
		this.dx = 0.9;
		this.dy = 0.9;
		this.dr = 0.9;
	// Maximum velocities
		this.mvms = 5; // Maximum Velocity Vector Magnitude Squared
		this.mvr = 270;
	// Acceleration
		this.movAccel = 10;
		this.rotAccel = 90;
	// Other
		this.id = id; //Identification
}

player.prototype.doPhysics = function(deltaTime){
	// Rotations
		// input
			if(this._65)//A
				this.vr += this.rotAccel*deltaTime;
			if(this._68)//D
				this.vr -= this.rotAccel*deltaTime;
		// Drag
			this.vr -= Math.max(Math.abs(this.vr*this.dr),Math.abs(1/this.mvr * this.vr * this.vr)) * deltaTime * sign(this.vr);
		// Apply
			this.r+=this.vr * deltaTime;
		// Bonus to prevent big-ass numbers
			if(this.r>360) this.r -= 360;
			if(this.r<0) this.r += 360;

	// Movement
	// var oops = {x: this.x, y: this.y};
		// Account for Rotation (This is why we did rotation first)
			var vector = getVector(this.r); //TODO This is attracts GC. We don't want any GC. Make it go away.
		// input
			if(this._87){//W
				this.vx += vector.x*this.movAccel*deltaTime;
				this.vy += vector.y*this.movAccel*deltaTime;
			}
			if(this._83){//S
				this.vx -= vector.x*this.movAccel*deltaTime;
				this.vy -= vector.y*this.movAccel*deltaTime;
			}
		// Drag
			this.vx -= Math.max(Math.abs(this.vx*this.dx),Math.abs(getQuadDrag(this.vx, this.vx, this.vy, this.mvms))) * deltaTime * sign(this.vx);
			this.vy -= Math.max(Math.abs(this.vy*this.dy),Math.abs(getQuadDrag(this.vy, this.vx, this.vy, this.mvms))) * deltaTime * sign(this.vy);
		// Apply
			this.x += this.vx * deltaTime;
			this.y += this.vy * deltaTime;

			// if(!this.x || !this.y) console.log(oops);

	// Done - pack and ship.
	// TODO - only update when needed
		io.emit('playerpos', this.id, this.x, this.y, this.r);
}

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

function getQuadDrag(dir, vx, vy, mvms){
	return dir==0?0:1/(dir/Magnitude(vx, vy)*mvms)*dir*dir;
}

function getVector(angle){
	angle *= (Math.PI/180);//Degrees to Radians!
	return {x: Math.cos(angle), y: Math.sin(angle)};
}

//Because Nodejs does not have Math.sign like all modern browsers do.
function sign(num){
	return num?num<0?-1:1:0;
}

function Magnitude(x, y){
	return Math.sqrt(x*x+y*y);
}

function onNewPlayer(socket){
	//tell the console
	console.log(socket.id+' connected');
	//Server records this player
	players[socket.id] = new player(socket.id);
	//Clients record this player
	io.emit('playerpos', socket.id, players[socket.id].x, players[socket.id].y, players[socket.id].r);
	//this player records everyone (including themselves)
	for(var id in players){
		socket.emit('playerpos', players[id].id, players[id].x, players[id].y, players[id].r);
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
		players[id].doPhysics(deltaTime);
	}
	//run me at 120 fps
    setTimeout(gameLoop, 8);
}

// ~~~~~~~~~~~~~~~ Initialization and Start ~~~~~~~~~~~~~~~

// so we can serve static files at this resteraunt
//app.use(require('express').static('public'));

// route, route, route your bytes, gently down the stream...
// app.get('/', function(req, res){
// 	res.sendFile(__dirname + '/index.html');
// 	});

// TODO - get this out of here.
// app.get('/health', function(req, res){
//   res.writeHead(200);
//   res.end();
// });

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

// The machine is running, Start putting things into it.
//TODO - get this outa here.

//Aight. Forget all this fanciness. We listen on port 80. Okay?
// http.listen(/*process.env.NODE_PORT || 3000*/80,function(){
// 	console.log("listening on *:3000");
// });
