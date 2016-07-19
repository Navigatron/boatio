'use strict';

//Connect to the server. Everything has been initialized.
//	socket = io.connect("http://boatio-boatio.rhcloud.com/");
 	socket = io();

// ~~~~~~~~~~~~~~~ Run this mess. ~~~~~~~~~~~~~~~

socket.on('wake up', function(id){
	console.log('we are online, our id is '+id);
	playerToWatch = id;
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
	things[data.id] = new objects[data.type](data.id,0,0,0);
	if(data.type=='player')
		console.log(data.id+' connected via TheresAThing.');
});

socket.on('objectData', function(id, data){
	if(things[id]){
		things[id].transform.position.x = data.x;
		things[id].transform.position.y = data.y;
		things[id].transform.rotation = data.r;
		if(Object.keys(data.extra).length!=0){
			//console.log('got some extra data. id:'+id+', data:'+data+', extra:'+data.extra);
			if(things[id].getComponent('networkView'))
				things[id].getComponent('networkView').handle(data.extra);
		}
	}else{
		console.warn('Got object data for something that doesnt exist');
	}
});

socket.on('attach', function(a, b, x, y){
	console.log('Attaching '+a+' to '+b+' at '+x+','+y+'.');
	things[b].attach(things[a],x,y);
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
		if(online)
			things[playerToWatch]['_'+n] = true;
	}
},true);
window.addEventListener('keyup',function(e){
	var n = e.keyCode || e.which;
	if(n==87 || n==65 || n==83 || n==68){
		socket.emit('keychange', n, false);
		keyState[n] = false;
		if(online)
			things[playerToWatch]['_'+n] = false;
	}
},true);

// Window resize event listener.
window.addEventListener('resize', resizeCanvas, false);
//When we disconnect, tell the server.
window.addEventListener('unload', function(){socket.disconnect()}, false);
