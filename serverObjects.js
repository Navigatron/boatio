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
        this.components.rigidBody = new components.rigidBody(this, mass, topSpeed, topRotSpeed);//object, mass, topSpeed, topRotSpeed
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
        // User input keys
        this._87= false;
        this._65= false;
        this._83= false;
        this._68= false;
        this.update = function(deltaTime){
            var vr = this.getComponent('rigidBody');
            if(this._65)//A
                vr.velocity.r += vr.acceleration.rotate*deltaTime;
            if(this._68)//D
                vr.velocity.r -= vr.acceleration.rotate*deltaTime;
            //TODO This is attracts GC. We don't want any GC. Make it go away.
            var vector = {x: Math.cos(transform.rotation*(Math.PI/180)), y: Math.sin(transform.rotation*(Math.PI/180))};
    		if(this._87){//W
    			vr.velocity.x += vector.x*vr.acceleration.move*deltaTime;
    			vr.velocity.y += vector.y*vr.acceleration.move*deltaTime;
    		}
    		if(this._83){//S
    			vr.velocity.x -= vector.x*vr.acceleration.move*deltaTime;
    			vr.velocity.y -= vector.y*vr.acceleration.move*deltaTime;
    		}
        };
    }
}

//A hullBrick is a shipBrick
class hullBrick extends shipBrick{
    //It's just a generic shipBrick.
}

module.exports = {
    gameObject: gameObject,
    shipBrick: shipBrick,
    playerBrick: playerBrick,
    hullBrick: hullBrick
};
