'use strict';

// ~~~~~~~~~~~~~~~ Run this mess. ~~~~~~~~~~~~~~~

socket.on('wake up', function(id){
	console.log('we are online, our id is '+id);
	playerToWatch = id;
	things[id] = new player(id,0,0,1);
	online = true;
	//TODO - we're using this for canvas Initialization. we shouldn't.
	resizeCanvas();
	window.requestAnimationFrame(gameLoop);
});

socket.on('player disconnected', function(id){
	things[id].kys(context);
	delete things[id];
	console.log(id+' disconnected.');
});

socket.on('TheresAThing', function(data){
	console.log('There\'s a thing! id:'+data.id+', type:'+data.type);
	typeOf[data.id]=data.type;
});// Use a map? id -> type ?

socket.on('objectData', function(id, data){
	if(things[id]){
		things[id].transform.position.x = data.x;
		things[id].transform.position.y = data.y;
		things[id].transform.rotation = data.r;
	}else{
		if(typeOf[id]){
			things[id] = new objects[typeOf[id]](id,data.x, data.y, data.r)
			if(typeOf[id]=='player')
				console.log(id+' connected.');
		}else{
			things[id] = new playerBrick(id, data.x, data.y, data.r);
			console.error('Unknown Object data recieved. id:'+id);
		}
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
