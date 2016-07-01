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
    this.mass = mass;
    this.topSpeed = topSpeed;
    this.momentOfInertia = 0;
    this.topRotSpeed = topRotSpeed;
}
rigidBody.prototype.addLinearForce = function(x, y){
    this.velocity.x += x/this.mass;
    this.velocity.y += y/this.mass;
};
rigidBody.prototype.addRotationalForce = function(r){

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
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.rotation += this.velocity.r;
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
playerBrick.prototype.constructor = shipBrick;
function playerBrick(){
    // User input keys
    this._87= false;
    this._65= false;
    this._83= false;
    this._68= false;
    this.update = function(){
        //ahh... now what
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
