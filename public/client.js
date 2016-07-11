'use strict';

// ~~~~~~~~~~~~~~~ Declaration of Variables ~~~~~~~~~~~~~~~

// The cause (and solution) of all our problems.
var socket = io.connect("http://boatio-boatio.rhcloud.com/");
//var socket = io();
// Who does the viewport look at?
var playerToWatch;
// All the players in game.
var players = {};
// The game canvas
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
// The Background canvas
var bcanvas = document.getElementById('bcanvas');
var bcontext = bcanvas.getContext('2d');
// How many pixels per world unit?
var scale = 32;
// Keep track of when a user presses a relevent key.
var keyState = {};
//Is everything ready to go?
var online = false;
//Images for Drawing
var images = {
	square: document.getElementById('square'),
	player: document.getElementById('player'),
	brick: document.getElementById('brick'),
	thruster: document.getElementById('thruster'),
	cannon: document.getElementById('cannon')
};

// ~~~~~~~~~~~~~~~ Defenition of objects ~~~~~~~~~~~~~~~

function player(x, y, r, sizex, sizey){
	this.x= x;
	this.y= y;
	this.oldX= x;
	this.oldY= y;
	this.boundingX= sizex;
	this.boundingY= sizey;
	this.r = r;
	this.oldR = r;
};
//Static methods! (use less memory)
player.prototype.kys = function(context){
	this.draw(context, true);//We are gone now...
};
player.prototype.updateGraphics = function(context){
	this.draw(context, true);//Erase the oldself
	this.draw(context, false);//create the new self
};
player.prototype.draw = function(context, erase){
	context.save();
	//TODO - Remove GC bait
	// point is in pixels
	var point = erase ? {x: this.oldX, y: this.oldY} : worldToScreenSpace({x: this.x, y: this.y});
	var r = erase ? this.oldR : this.r;
	var scaleFactor = scale/16; //images are 16 pixels big
	context.translate(point.x, point.y);//translation in pixels.

	context.rotate((-r+90)*(Math.PI/180));//Degrees to Radians!
	if(erase){
		//Extra 1px border cleared to account for anti-aliasing. This is in Pixels!
		context.clearRect(-this.boundingX*scale/2-1, -this.boundingY*scale/2-1, this.boundingX*scale+2, this.boundingY*scale+2);
	}else{
		//context.fillStyle=color;//Color defined by landingjs
		//context.fillRect(-this.boundingX/2, -this.boundingY/2, this.boundingX, this.boundingY);
		context.scale(scaleFactor, scaleFactor);//Scale it up!
		context.drawImage(images['player'], -images['player'].width/2, -images['player'].height/2);
		this.oldX = point.x;
		this.oldY = point.y;
		this.oldR = this.r;
	}
	context.restore();
};

// ~~~~~~~~~~~~~~~ Defenition of functions ~~~~~~~~~~~~~~~

function worldToScreenSpace(point){//Takes world units, returns pixels.
	//object to return
	var result = {};

	//Where is the target relative to the target player
	result.x = (point.x - players[playerToWatch].x)*scale;
	result.y = -(point.y - players[playerToWatch].y)*scale;

	//Shift viewport to center on target player
	result.x += (canvas.width/2);
	result.y += (canvas.height/2);

	return result;
}

function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
		bcanvas.width = window.innerWidth;
        bcanvas.height = window.innerHeight;
		console.log('Resize');
		if(online)
		updateBackground();
        drawStuff();
}

function updateBackground(){
	bcontext.save();

	var s = images['square'].width;


	var pat = bcontext.createPattern(images['square'], "repeat");
	bcontext.fillStyle = pat;
	//Computer science Modulus is not normal modulus. Take Care.
	var point = {x: players[playerToWatch].x*scale, y: players[playerToWatch].y*scale};
	var a = scale;
	bcontext.translate(-(point.x%a-a*(point.x>0))-a,point.y%a-a*(point.y>0));//In Pixels!
	bcontext.scale(scale/s,scale/s);
	bcontext.fillRect(0,0,window.innerWidth*s/scale+s, window.innerHeight*s/scale+s);

	bcontext.restore();
}

function howManyOnline(){
	return Object.keys(players).length;
}

function gameLoop(timestamp) {
	updateBackground();
	drawStuff();
	window.requestAnimationFrame(gameLoop);
}

function drawStuff() {
	for(var id in players){
		players[id].updateGraphics(context);
	}
}

// ~~~~~~~~~~~~~~~ Initialization and Start ~~~~~~~~~~~~~~~

socket.on('wake up', function(id){
	console.log('we are online, our id is '+id);
	playerToWatch = id;
	players[id] = new player(0,0,0,1,1);
	online = true;
	//TODO - we're using this for coanvas Initialization. we shouldn't.
	resizeCanvas();
	window.requestAnimationFrame(gameLoop);
});

socket.on('player disconnected', function(id){
	players[id].kys(context);
	delete players[id];
	console.log(id+' disconnected, '+howManyOnline()+' online.');
});

socket.on('playerpos', function(id, x, y, r){
	if(players[id]){
		players[id].x = x;
		players[id].y = y;
		players[id].r = r;
	}else{
		//We're using Standard Angles, not Bearings. Unrotated, things face right.
		players[id] = new player(x, y, r, 1,1);//Bounding Size - 1 world unit
		console.log(id+' connected, '+howManyOnline()+' online.');
	}
});

socket.on('objectData', function(id, data){
	if(players[id]){
		players[id].x = data.x;
		players[id].y = data.y;
		players[id].r = data.r;
	}else{
		//We're using Standard Angles, not Bearings. Unrotated, things face right.
		players[id] = new player(data.x, data.y, data.r, 1,1);//Bounding Size - 1 world unit
		console.log(id+' connected, '+howManyOnline()+' online.');
	}
});

//Position the canvases in the propper order.
canvas.style['z-index'] = '1';
bcanvas.style['z-index'] = '0';

// Keypress Event listeners
window.addEventListener('keydown',function(e){
	var n = e.keyCode || e.which;
	//Do comparison operations before we query our array
	if((n==87 || n==65 || n==83 || n==68) && !keyState[n]){
		socket.emit('keychange', n, true);
		keyState[n] = true;
	}
},true);
window.addEventListener('keyup',function(e){
	var n = e.keyCode || e.which;
	if(n==87 || n==65 || n==83 || n==68){
		socket.emit('keychange', n, false);
		keyState[n] = false;
	}
},true);

// Window resize event listener.
window.addEventListener('resize', resizeCanvas, false);
