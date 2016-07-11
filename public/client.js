'use strict';

// ~~~~~~~~~~~~~~~ Declaration of Variables ~~~~~~~~~~~~~~~



// ~~~~~~~~~~~~~~~ Defenition of objects ~~~~~~~~~~~~~~~

/*function player(x, y, r, sizex, sizey){
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
	//90-r aligns canvas up to server up - server up is 0 degrees from standard angle, aka right.
	context.rotate((90-r)*(Math.PI/180));//Degrees to Radians!
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
};//*/

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

socket.on('TheresAThing', function(data){
	console.log('There\'s a thing! id:'+data.id+', type:'+data.type);
});

socket.on('objectData', function(id, data){
	if(players[id]){
		players[id].x = data.x;
		players[id].y = data.y;
		players[id].r = data.r;
	}else{
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
