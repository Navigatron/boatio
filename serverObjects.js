'use strict';

var components = require('./components.js');
//We can do this - node will return the same util object.
var getNewID = require('./util');

class gameObject{
    constructor(type, id, X, Y, r){
        this.type = type;
        this.id = id;
        this.components = {
             transform: new components.transform(this, X, Y, r)
       };
       this.transform = this.components['transform'];
    }
}
gameObject.prototype.getComponent = function(type){
      return this.components[type]?this.components[type]:null;
};
gameObject.prototype.update = function(deltaTime){
    //yeah.
};
class shipBrick extends gameObject{
    constructor(type, id, x, y, r, mass, topSpeed, topRotSpeed, health, attached){
        super(type, id, x, y, r);//, mass, topSpeed, topRotSpeed);
        //this.components.rigidBody = new components.rigidBody(this, mass, topSpeed, topRotSpeed);//object, mass, topSpeed, topRotSpeed
        this.health = health;
        this.attached = attached;
        this.components.networkView = new components.networkView(this);
        this.components.networkView.active = !attached;//If we're on a boat, don't worry about networks.
    }
}

//A playerBrick is a shipBrick
class playerBrick extends shipBrick{
    constructor(id, x, y, r, attached){
        super('playerBrick', id, x, y, r, 1, 10, 270, 50, attached);//type, id, x, y, r, mass, move, rotate, Health
    }
}

//A hullBrick is a shipBrick
class hull extends shipBrick{
    constructor(id, x, y, r, attached){
        super('hull', id, x, y, r, 1, 10, 270, 15, attached);//type, id, x, y, r, mass, move, rotate, Health
    }
}

class cannon extends shipBrick{
    constructor(id, x, y, r, attached){
        super('cannon', id, x, y, r, 1, 10, 270, 5, attached);//type, id, x, y, r, mass, move, rotate, Health
    }
}

//A thruster is a shipBrick
class thruster extends shipBrick{
    constructor(id, x, y, r, attached){
        super('thruster', id, x, y, r, 1, 10, 270, 5, attached);//type, id, x, y, r, mass, move, rotate, Health, attached
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
        //networkView - So the client actually gets the data
        this.components.networkView = new components.networkView(this);
        //We are the mamma duck. These the are wee lil duckies.
        this.ducklings = {};
        this.ducklings[0] = {};

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

            //Tell the networkView to sync our velocity as well.
            this.getComponent('networkView').extra = {
                x: vr.velocity.x,
                y: vr.velocity.y,
                r: vr.velocity.r
            };
        };
    }
}
player.prototype.attach = function(io, duckling, x, y){
    if(!this.ducklings[x])
        this.ducklings[x] = {};
    this.ducklings[x][y] = duckling;
    //attach A to B at X,Y
    io.emit('attach', duckling.id, this.id, x, y);
};

module.exports = {
    gameObject: gameObject,
    shipBrick: shipBrick,
    playerBrick: playerBrick,
    hull: hull,
    cannon: cannon,
    thruster: thruster,
    player: player
};
