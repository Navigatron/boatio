'use strict';

//objects for the server - Handle all physics and important actions.

function gameObject(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
    this.update = function(){return;};
}

shipBrick.prototype = gameObject;
shipBrick.prototype.constructor = shipBrick;
function shipBrick(x, y, r, health, sizex, sizey){
    this.prototype.constructor.call(this, x, y, r);
    this.health = health;
    this.sizex = sizex;
    this.sizey = sizey;
}

function playerBrick(){
    // User input keys
    this._87= false;
    this._65= false;
    this._83= false;
    this._68= false;
    this.rigidBody = new rigidBody(0,0,1,5,270);
    this.update = function(){
        //ahh... now what
    };
}

function hullBrick(){
    this.rigidBody = new rigidBody(0,0,1, 5, 270);
}

function test(){
    console.log('Hello from the serverObjects class');
}

function rigidBody(x, y, mass, topSpeed, topRotSpeed){
    this.centerOfGravity = {
        x: x,
        y: y
    };
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

module.exports = {
    rigidBody: rigidBody,
    gameObject: gameObject,
    shipBrick: shipBrick,
    playerBrick: playerBrick,
    hullBrick: hullBrick,
    test: test
};
