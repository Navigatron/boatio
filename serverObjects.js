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
    }
}
gameObject.prototype.getComponent = function(type){
      return this.components[type]?this.components[type]:null;
};

/*// - To be deleted
//Alright boys and girls, we're going to go full 2016 on this code right here.
//Javascript was not intended for this. Don't try this at home.
class rigidBody extends gameObject{
    constructor(x, y, r, mass, topSpeed, topRotSpeed){
        //Classes! Extending! Constructors! Super! Oh snap!
        super(x, y, r);
        this.velocity = {
            x: 0,
            y: 0,
            r: 0
        };
        this.dampening = {
            x: 0.9,
            y: 0.9,
            r: 0.9
        };
        this.acceleration = {
            move: 10,
            rotate: 90
        };
        this.mass = mass;
        this.topSpeed = topSpeed;
        this.momentOfInertia = 1;
        this.topRotSpeed = topRotSpeed;
    }
}
rigidBody.prototype.addLinearForce = function(x, y){
    this.velocity.x += x/this.mass;
    this.velocity.y += y/this.mass;
};
rigidBody.prototype.addRotationalForce = function(r){
    this.rotation += r/this.momentOfInertia;
};
rigidBody.prototype.addMass = function(mass, x, y){
    this.mass += mass;
};
rigidBody.prototype.magnitude = function(x, y){
    return Math.sqrt(x*x+y*y);
};
rigidBody.prototype.step = function(deltaTime){
    //Drag
    for(var key in this.velocity){
        var linearDragPerSecond = this.velocity[key] * this.dampening[key];
        var quadraticDragPerSecond = this.getQuadraticDrag((this.velocity[key]/this.magnitude(this.velocity.x, this.velocity.y)*this.topSpeed),this.velocity[key]);
        this.velocity[key] -= Math.max(Math.abs(linearDragPerSecond),Math.abs(quadraticDragPerSecond)) * deltaTime * (this.velocity[key]?this.velocity[key]<0?-1:1:0);
    }
    //Move
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.rotation += this.velocity.r * deltaTime;
};
rigidBody.prototype.getQuadraticDrag = function(maximumVelocity, actualVelocity){
    return actualVelocity==0?0:1/maximumVelocity*actualVelocity*actualVelocity;
};//*/

//A shipBrick is a rigidBody
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
            if(this._65)//A
                this.velocity.r += this.acceleration.rotate*deltaTime;
            if(this._68)//D
                this.velocity.r -= this.acceleration.rotate*deltaTime;
            //TODO This is attracts GC. We don't want any GC. Make it go away.
            var vector = {x: Math.cos(this.rotation*(Math.PI/180)), y: Math.sin(this.rotation*(Math.PI/180))};
    		if(this._87){//W
    			this.velocity.x += vector.x*this.acceleration.move*deltaTime;
    			this.velocity.y += vector.y*this.acceleration.move*deltaTime;
    		}
    		if(this._83){//S
    			this.velocity.x -= vector.x*this.acceleration.move*deltaTime;
    			this.velocity.y -= vector.y*this.acceleration.move*deltaTime;
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
