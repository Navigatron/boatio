'use strict';

var name='unnamed';
var quest='ffa';
var color='#F7D';


//Set player name
function onNameChosen(){
	var field = document.getElementById('namebox');
	name = field.value;
	if(!nameIsValid(name)){
		askForANewName(field);
		return false;
	}
	console.log("'"+name+"' selected as name");
	document.getElementById("namediv").style.display = "none";
	//document.getElementById("questdiv").style.display = "block";
	//Screw quest and color, just go right for the game.
		document.getElementById("landing").style.display = "none";
		document.getElementById("game").style.display = "block";
		getGoin();
	return false;
}
function askForANewName(field){
	field.value = 'No Empty Names';
	field.style.color = 'red';
}
function nameIsValid(name){
	if(name=='' || name=='No Empty Names')
		return false;
	return true;
}

//set player quest

function onQuestChosen(q){
	quest = q;
	console.log("'"+q+"' selected as quest");
	//Hide name selection stuff, show chatroom underneath.
	document.getElementById("questdiv").style.display = "none";
	document.getElementById("colordiv").style.display = "block";
	return false;
}

//set player favorite color
function onColorChosen(q){
	color = q;
	console.log("'"+q+"' selected as color");
	//Hide name selection stuff, show chatroom underneath.
	document.getElementById("landing").style.display = "none";
	document.getElementById("game").style.display = "block";
    getGoin();//Load the game scripts
	return false;
}

//Load the game scripts
//<script type="text/javascript" src="/client.js"></script>
function getGoin(){
	//First, Globals.
	var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = './clientGlobals.js';
    document.getElementsByTagName('head')[0].appendChild(newScript);
	//Then Components
	newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = './clientComponents.js';
    document.getElementsByTagName('head')[0].appendChild(newScript);
	//Then Objects
	newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = './clientObjects.js';
    document.getElementsByTagName('head')[0].appendChild(newScript);
	//Then the guy who runs this mess.
    newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = './client.js';
    document.getElementsByTagName('head')[0].appendChild(newScript);
}
