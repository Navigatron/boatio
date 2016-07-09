'use strict';

var components = require('./components.js');

class gameObject{
    constructor(X, Y, r){
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
    constructor(x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey){
        super(x, y, r);//, mass, topSpeed, topRotSpeed);
        //this.components.rigidBody = new components.rigidBody(this, mass, topSpeed, topRotSpeed);//object, mass, topSpeed, topRotSpeed
        this.health = health;
        this.sizex = sizex;
        this.sizey = sizey;
    }
}

//A playerBrick is a shipBrick
class playerBrick extends shipBrick{
    constructor(x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey, id){
        super(x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
        //Our ID
        this.id = id;
    }
}

//A hullBrick is a shipBrick
class hullBrick extends shipBrick{
    //It's just a generic shipBrick.
}

// Degrees to Radians! *(Math.PI/180)

class player extends gameObject{
    constructor(x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey, id){
        super(x, y, r);
        //Our ID
        this.id = id;
        // User input keys
        this._87= false;
        this._65= false;
        this._83= false;
        this._68= false;
        //Rigidbody
        this.components.rigidBody = new components.rigidBody(this, mass, topSpeed, topRotSpeed);//object, mass, topSpeed, topRotSpeed
        //collider
        this.components.collider = new components.collider();
        //We are the mamma duck. These the are wee lil duckies.
        var ducklings = {};
        ducklings[0][0] = new playerBrick(x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey, id+'sub');
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
                for(y in duckings[x]){
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
    hullBrick: hullBrick,
    player: player
};
