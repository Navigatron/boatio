'use strict';

// The client has 6 files for code. The server has 3. lol.
// The other 3 game js files need lots of crap declared.
// So this is where we declare it.
//
// (Ik, hoisting and all that. But hoisting accross
// Multiple files? I don't have the pateince to try
// it and debug and all that. Plus, readability.)

// ~~~~~~~~~~~~~~~ Declaration of Variables ~~~~~~~~~~~~~~~

// The cause (and solution) of all our problems.
var socket = io.connect("http://boatio-boatio.rhcloud.com/");
//var socket = io();
// Who does the viewport look at?
var playerToWatch;
// All the players in game.
var players = {};
// All the things
var things = {};
// id -> type map.
var typeOf = {};
// type ->  object Class map.
var objects = {};
// The game canvas
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
// The Background canvas
var bcanvas = document.getElementById('bcanvas');
var bcontext = bcanvas.getContext('2d');
// How many pixels per world unit?
var scale = 32;
// Keep track of when we press a relevent key.
var keyState = {};
//Is everything ready to go? (Lol never. run it anyway, let it crash.)
var online = false;
//Images for Drawing
var images = {
	square: document.getElementById('square'),
	playerBrick: document.getElementById('player'),
	hull: document.getElementById('brick'),
	thruster: document.getElementById('thruster'),
	cannon: document.getElementById('cannon'),
	thrust: document.getElementById('thrust')
};

// ~~~~~~~~~~~~~~~ Declaration of Functions ~~~~~~~~~~~~~~~

//Now this uses components, which haven't been declared yet, but pray the hoisting works...
function worldToScreenSpace(point){//Takes world units, returns pixels.
	//object to return
	var result = {};

	//Where is the target relative to the target player
	result.x = (point.x - things[playerToWatch].transform.position.x)*scale;
	result.y = -(point.y - things[playerToWatch].transform.position.y)*scale;

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
    //TODO - some screen sizes, like, double the background size?
    // I have no freaking idea. Consider looking at this... eventually.
	bcontext.save();
	var s = images['square'].width;
	var pat = bcontext.createPattern(images['square'], "repeat");
	bcontext.fillStyle = pat;
	//Computer science Modulus is not normal modulus. Take Care.
	var point = {x: things[playerToWatch].transform.position.x*scale, y: things[playerToWatch].transform.position.y*scale};
	var a = scale;
	bcontext.translate(-(point.x%a-a*(point.x>0))-a,point.y%a-a*(point.y>0));//In Pixels!
	bcontext.scale(scale/s,scale/s);
	bcontext.fillRect(0,0,window.innerWidth*s/scale+s, window.innerHeight*s/scale+s);
	bcontext.restore();
}

function gameLoop(timestamp) {
    //Physics
    //Collisions (lol no. I'm only writing this once. Just listen to the server.)
    //Object Update
    //Draw to Screen
	updateBackground();
	drawStuff();
    //aaaaaand do it again soon.
	window.requestAnimationFrame(gameLoop);
}

function drawStuff() {
	for(var id in things){
		if(things[id].getComponent('renderer')){
			things[id].getComponent('renderer').clear(context);
		}
	}
	for(var id in things){
		if(things[id].getComponent('renderer')){
			things[id].getComponent('renderer').draw(context);
		}
	}
}
