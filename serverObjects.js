'use strict';

var components = require('./components.js');
//We can do this - node will return the same util object.
var getNewID = require('./util');

class gameObject{
    constructor(id, X, Y, r){
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
    constructor(id, x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey){
        super(id, x, y, r);//, mass, topSpeed, topRotSpeed);
        //this.components.rigidBody = new components.rigidBody(this, mass, topSpeed, topRotSpeed);//object, mass, topSpeed, topRotSpeed
        this.health = health;
        this.sizex = sizex;
        this.sizey = sizey;
    }
}

//A playerBrick is a shipBrick
class playerBrick extends shipBrick{
    constructor(id, x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey){
        super(id, x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
    }
}

//A hullBrick is a shipBrick
class hull extends shipBrick{
    //It's just a generic shipBrick.
}

//A thruster is a shipBrick
class thruster extends shipBrick{
    constructor(id, x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey){
        super(id, x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
    }
}

// Degrees to Radians! *(Math.PI/180)

class player extends gameObject{
    constructor(id, x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey){
        super(id, x, y, r);
        // User input keys
        this._87= false;
        this._65= false;
        this._83= false;
        this._68= false;
        //Rigidbody
        this.components.rigidBody = new components.rigidBody(this, mass, topSpeed, topRotSpeed);//object, mass, topSpeed, topRotSpeed
        //collider
        this.components.collider = new components.collider(this);
        //We are the mamma duck. These the are wee lil duckies.
        var ducklings = {};
        ducklings[0] = {};
        ducklings[0][0] = new playerBrick(getNewID(), x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
        ducklings[0][-1] = new thruster(getNewID(), x, y-1, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
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
            for(x in ducklings){
                for(y in ducklings[x]){
                    var tr = ducklings[x][y].transform;
                    tr.rotation = this.r;
                    tr.position.x = Math.cos(this.r*(Math.PI/180))*x;
                    tr.position.y = Math.sin(this.r*(Math.PI/180))*y;
                }
            }
        };
    }
}

module.exports = {
    gameObject: gameObject,
    shipBrick: shipBrick,
    playerBrick: playerBrick,
    hull: hull,
    thruster: thruster,
    player: player
};
