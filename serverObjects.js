'use strict';

function gameObject(X, Y, r){
    this.position = {
        x: X,
        y: Y
    };
    this.rotation = r;
    this.update = function(){return;};
}

//A rigidBody is a gameObject.
rigidBody.prototype = gameObject;
rigidBody.prototype.constructor = rigidBody;
function rigidBody(x, y, r, mass, topSpeed, topRotSpeed){
    rigidBody.prototype.constructor.call(this, x, y, r);
    this.velocity = {
        x: 0,
        y: 0,
        r: 0,
        magnitude : function(){
            return Math.sqrt(this.x*this.x + this.y*this.y);
        }
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
rigidBody.prototype.calculateMomentOfInertia = function(masses){

};
rigidBody.prototype.step = function(deltaTime){
    //Drag
    for(var key in this.velocity){
        var linearDragPerSecond = this.velocity[key] * this.dampening[key];
        var quadraticDragPerSecond = getQuadraticDrag((this.velocity[key]/this.velocity.magnitude()*this.topSpeed),this.velocity[key]);
        this.velocity[key] -= Math.max(Math.abs(linearDragPerSecond),Math.abs(quadraticDragPerSecond)) * deltaTime * (this.velocity[key]?this.velocity[key]<0?-1:1:0);
    }
    //Move
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.rotation += this.velocity.r * deltaTime;
};
rigidBody.prototype.getQuadraticDrag = function(maximumVelocity, actualVelocity){
    return actualVelocity==0?0:1/maximumVelocity*actualVelocity*actualVelocity;
};

//A shipBrick is a rigidBody
shipBrick.prototype = rigidBody;
shipBrick.prototype.constructor = shipBrick;
function shipBrick(x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey){
    this.prototype.constructor.call(this, x, y, r, mass, topSpeed, topRotSpeed);
    this.health = health;
    this.sizex = sizex;
    this.sizey = sizey;
}

//A playerBrick is a shipBrick
playerBrick.prototype = shipBrick;
playerBrick.prototype.constructor = playerBrick;
function playerBrick(x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey, id){
    this.prototype.constructor.call(this, x, y, r, mass, topSpeed, topRotSpeed, health, sizex, sizey);
    //Our ID
    this.id = id;
    // User input keys
    this._87= false;
    this._65= false;
    this._83= false;
    this._68= false;
    this.update = function(){
        if(this._65)//A
            this.vr += this.acceleration.rotate*deltaTime;
        if(this._68)//D
            this.vr -= this.acceleration.rotate*deltaTime;
        //TODO This is attracts GC. We don't want any GC. Make it go away.
        var vector = {x: Math.cos(this.rotation*(Math.PI/180)), y: Math.sin(this.rotation*(Math.PI/180))};
		if(this._87){//W
			this.vx += vector.x*this.movAccel*deltaTime;
			this.vy += vector.y*this.movAccel*deltaTime;
		}
		if(this._83){//S
			this.vx -= vector.x*this.movAccel*deltaTime;
			this.vy -= vector.y*this.movAccel*deltaTime;
		}
    };
}

//A hullBrick is a shipBrick
hullBrick.prototype = shipBrick;
hullBrick.prototype.constructor = shipBrick;
function hullBrick(){
    //It's just a generic shipBrick.
}

module.exports = {
    rigidBody: rigidBody,
    gameObject: gameObject,
    shipBrick: shipBrick,
    playerBrick: playerBrick,
    hullBrick: hullBrick
};
