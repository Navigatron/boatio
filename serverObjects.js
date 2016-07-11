'use strict';

var components = require('./components.js');
//We can do this - node will return the same util object.
var getNewID = require('./util');

class gameObject{
    constructor(type, id, X, Y, r){
        this.type = type;
        this.id = id;
        this.position = {
            x: X,
            y: Y
        };
        this.rotation = r;
        this.update = function(){return;};
        this.components = {
             transform: new components.transform(this, X, Y, r)
       };
       this.transform = this.components['transform'];
    }
}
gameObject.prototype.getComponent = function(type){
      return this.components[type]?this.components[type]:null;
};

class shipBrick extends gameObject{
    constructor(type, id, x, y, r, mass, topSpeed, topRotSpeed, health){
        super(type, id, x, y, r);//, mass, topSpeed, topRotSpeed);
        //this.components.rigidBody = new components.rigidBody(this, mass, topSpeed, topRotSpeed);//object, mass, topSpeed, topRotSpeed
        this.health = health;
    }
}

//A playerBrick is a shipBrick
class playerBrick extends shipBrick{
    constructor(id, x, y, r){
        super('playerBrick', id, x, y, r, 1, 10, 270, 50);//type, id, x, y, r, mass, move, rotate, Health
        this.components.networkView = new components.networkView(this);
    }
}

//A hullBrick is a shipBrick
class hull extends shipBrick{
    //It's just a generic shipBrick.
}

//A thruster is a shipBrick
class thruster extends shipBrick{
    constructor(id, x, y, r){
        super('thruster', id, x, y, r, 1, 10, 270, 5);//type, id, x, y, r, mass, move, rotate, Health
        this.components.networkView = new components.networkView(this);
    }
}

// Degrees to Radians! *(Math.PI/180)

class player extends gameObject{
    constructor(id, x, y, r){
        super('player', id, x, y, r);
        // User input keys
        this._87= false;
        this._65= false;
        this._83= false;
        this._68= false;
        //Rigidbody - object, mass, topSpeed, topRotSpeed
        this.components.rigidBody = new components.rigidBody(this, 1, 10, 270);
        //collider
        this.components.collider = new components.collider(this);
        //networkView - So the client actually gets the data - TODO - player can distinguish types
        this.components.networkView = new components.networkView(this);
        //We are the mamma duck. These the are wee lil duckies.
        this.ducklings = {};
        this.ducklings[0] = {};
        //this.ducklings[0][0] = new playerBrick(getNewID(), x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
        //this.ducklings[0][-1] = new thruster(getNewID(), x, y-1, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
        this.update = function(deltaTime){
            //Handle Player Input
            var vr = this.getComponent('rigidBody');
            if(this._65)//A
                vr.velocity.r += vr.acceleration.rotate*deltaTime;
            if(this._68)//D
                vr.velocity.r -= vr.acceleration.rotate*deltaTime;
            //TODO This is attracts GC. We don't want any GC. Make it go away.
            var vector = {x: Math.cos(this.transform.rotation*(Math.PI/180)), y: Math.sin(this.transform.rotation*(Math.PI/180))};
    		if(this._87){//W
    			vr.velocity.x += vector.x*vr.acceleration.move*deltaTime;
    			vr.velocity.y += vector.y*vr.acceleration.move*deltaTime;
    		}
    		if(this._83){//S
    			vr.velocity.x -= vector.x*vr.acceleration.move*deltaTime;
    			vr.velocity.y -= vector.y*vr.acceleration.move*deltaTime;
    		}
            //Put the Ducks in the Boxes.
            for(x in this.ducklings){
                for(y in this.ducklings[x]){
                    var tr = this.ducklings[x][y].transform;
                    tr.rotation = this.transform.rotation;
                    //zero rotation - ??
                    var theta = (this.transform.rotation-90)*(Math.PI/180);
                    tr.position.x = Number(x)*Math.cos(theta)-Number(y)*Math.sin(theta)+this.transform.position.x;
                    tr.position.y = Number(y)*Math.cos(theta)+Number(x)*Math.sin(theta)+this.transform.position.y;
                }
            }
        };
    }
}
player.prototype.attach = function(duckling, x, y){
    if(!this.ducklings[x])
        this.ducklings[x] = {};
    this.ducklings[x][y] = duckling;
};

module.exports = {
    gameObject: gameObject,
    shipBrick: shipBrick,
    playerBrick: playerBrick,
    hull: hull,
    thruster: thruster,
    player: player
};
