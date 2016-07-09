'use strict';

//components
class component{
      constructor(object){
            this.object = object;
      }
}
component.prototype.getComponent = function(type){
      return this.object.getComponent(type);
};

class transform extends component{
      constructor(object, X, Y, r){
            super(object);
            this.position = {
                  x: X,
                  y: Y
            };
            this.rotation = r;
      }
}

class networkView extends component{
      constructor(){

      }
}

class rigidBody extends component{
    constructor(object, mass, topSpeed, topRotSpeed){
        super(object);
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
    var transform = this.getComponent('transform');
    transform.position.x += this.velocity.x * deltaTime;
    transform.position.y += this.velocity.y * deltaTime;
    transform.rotation += this.velocity.r * deltaTime;
};
rigidBody.prototype.getQuadraticDrag = function(maximumVelocity, actualVelocity){
    return actualVelocity==0?0:1/maximumVelocity*actualVelocity*actualVelocity;
};

class collider extends component{
      constructor(){
//Does this have children?
//List of child objects
//
      }
}

module.exports = {
      component: component,
      transform: transform,
      networkView: networkView,
      rigidBody: rigidBody,
      collider: collider
};
