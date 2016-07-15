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

var sO = require('./serverObjects.js');
var getNewID = require('./util.js');


// ~~~~~~~~~~~~~~~ Defenition of functions ~~~~~~~~~~~~~~~
// TODO - Order by appearance or alphabetical?

function getNewID(){
	_idCounter++;
	return _idCounter;
}

// This shouldnt exist.
// function addForceAtPoint(rigidbody, forceOffsetX, forceOffsetY, forceVectorX,  forceVectorY){
// 	// Linear Acceleration is Easy, just add it in there.
// 	rigidbody.vx += forceVectorX;
// 	rigidbody.vy += forceVectorY;
// 	// Angular Acceleration is Haaard.
// 	// Offset vector Crossproduct ForceVector - only need Z component - Divide by Moment of Inertia
// 	var cross = forceOffsetX*forceVectorY - forceOffsetY * forceVectorX;
// }

function onNewPlayer(socket){
	console.log(socket.id+' connected');
	//Inform the newbie of everything else. Position data will come shortly.
	for(var key in things){
			socket.emit('TheresAThing', {
				id: things[key].id,
				type: things[key].type
			});
	}
	for(var key in things){
		if(things[key].type=='player'){
			for(var x in things[key].ducklings){
				for(var y in things[key].ducklings[x]){
					socket.emit('attach',things[key].ducklings[x][y].id,key,x,y);
				}
			}
		}
	}
	//id, x, y, r
	var id = addNew(new sO.player(0, 0, 0, 90));
	// Add the starter player bricks
	/*
	   /i\
	|=||@||=|
	/-\   /-\

	*/
	things[id].attach(io, things[addNew(new sO.cannon(0,0,0,0, true))],	       0, 1);
	things[id].attach(io, things[addNew(new sO.hull(0,0,0,0, true))],		  -1, 0);
	things[id].attach(io, things[addNew(new sO.playerBrick(0,0,0,0, true))],   0, 0);
	things[id].attach(io, things[addNew(new sO.hull(0,0,0,0, true))],		   1, 0);
	things[id].attach(io, things[addNew(new sO.thruster(0,0,0,0, true))],     -1,-1);
	things[id].attach(io, things[addNew(new sO.thruster(0,0,0,0, true))],      1,-1);

	players[socket.id] = id;
	var tr = things[id].transform;
	socket.emit('wake up', id);
}

function addNew(thing){
	var id = getNewID();
	things[id] = thing;
	thing.id = id;
	io.emit('TheresAThing', {
		id: thing.id,
		type: thing.type
	});
	return id;
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
	var tested = {};
	for(var id in things){
		if(things[id].getComponent('collider') && !things[id].getComponent('collider').child){
			tested[id]=true;
			for(var ido in things){
				if(id!=ido && things[ido].getComponent('collider') && !things[ido].getComponent('collider').child)
					detectCollision(things[id].getComponent('collider'), things[ido].getComponent('collider'));
			}
		}
	}
	//Object update
	for(var id in things){
		things[id].update(deltaTime);
	}
	//Everything is calculated, push current data to players.
	for(var id in things){
		if(things[id].getComponent('networkView')){
			things[id].getComponent('networkView').push(io);
		}
	}
	//8 =120 fps. 50=20fps. Clients handle their own physics, we just keep track.
    setTimeout(gameLoop, 50);
}

function detectCollision(colliderA, colliderB){
	var smallestAxis;
	var overlap=99999;

	var axis = colliderA.getAxis();
	for (var index = 0; index < axis.length; ++index){
		console.log('A['+index+']. x:'+axis[index].x+', y:'+axis[index].y+'.');
		//Project A onto Axis AAAGGGGHHHHHHHHHH fine.
		var projectionA = colliderA.project(axis[index]);
		//Project B onto Axis
		var projectionB = colliderB.project(axis[index]);
		//If no overlap, return.
		if(!doTheseProjectionsOverlap(projectionA, projectionB)){
			return false;
		}else{
			var t = howMuchDoTheseProjectionsOverlap(projectionA, projectionB);
			if(t<overlap){
				overlap = t;
				smallestAxis = axis[index];
			}
		}
	}

	//I'm not convinced we need all these axis.
	axis = colliderB.getAxis();
	for (var index = 0; index < axis.length; ++index){
		//Project A onto Axis AAAGGGGHHHHHHHHHH fine.
		var projectionA = colliderA.project(axis[index]);
		//Project B onto Axis
		var projectionB = colliderB.project(axis[index]);
		//If no overlap, return.
		if(!doTheseProjectionsOverlap(projectionA, projectionB)){
			return false;
		}else{
			var t = howMuchDoTheseProjectionsOverlap(projectionA, projectionB);
			if(t<overlap){
				overlap = t;
				smallestAxis = axis[index];
			}
		}
	}
	//If A is a parent
		//Loop through A's Children
			//detectCollision(A's child, B);
			//return, we're done here.
	//If B is a parent
		//Loop through B's Children
			//detectCollision(B's child, A);
			//return, we're done here.

	console.log('Yee there\'s a collision! a:'+colliderA.object.id+', b:'+colliderB.object.id+'.');
	//There is a collision, All are not parents, Dispatch onCollision events to relevant parties.
	//TODO - inverse overlap on one of these. Which one? Idk.
	colliderA.object.onCollision(smallestAxis, overlap, colliderB);
	colliderB.object.onCollision(smallestAxis, -overlap, colliderA);
}

function doTheseProjectionsOverlap(a, b){
	if(a.max > b.min && a.max < b.max)//a.max is within B.
		return true;
	if(a.min > b.min && a.min < b.max)//a.min is within B.
		return true;
	if(b.max > a.min && b.max < a.max)//b.max is within A.
		return true;
	if(b.min > a.min && b.min < a.max)//b.min is within A.
		return true;
	return false;
}

function howMuchDoTheseProjectionsOverlap(a, b){//This is really hard.
	//    |---------|
	//        |<-?->|
	//        |---------|
	if(a.max > b.min && a.max < b.max){//a.max is within B
		if(a.min > b.min && a.min < b.max){//A is completely within B.
			return Math.min(a.max-b.min,b.max-a.min);
		}else{//Only a.max is within B.
			return a.max-b.min;
		}
	}else if(a.min > b.min && a.min < b.max){//Only a.min is within B.
		return b.max-a.min;
	}else{//A is not within B... either No overlap, or A contains B.
		if(b.max<a.max && b.min>a.min){//B is completely within A. Now what.
			return Math.min(b.max-a.min, a.max-b.min);
		}else{//There was no overlap.
			console.log('These two projections do not overlap.');
		}
	}
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
		things[players[socket.id]].kys(things);
		//delete things[players[socket.id]]//handled by playerObject.
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
