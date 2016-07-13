'use strict';

//components
class component{
      constructor(object){
            this.object = object;
            this.active = true;
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
      constructor(object, handle){//handle is a callback function for when we get extra data.
          super(object);
          this.handle = handle;
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
    if(!this.active) return;
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
      constructor(object){
          super(object);
//Does this have children?
//List of child objects
      }
}

class renderer extends component{
    constructor(object){
        super(object);
        this.oldX= object.transform.position.x;
    	this.oldY= object.transform.position.y;
    	this.boundingX= 1;
    	this.boundingY= 1;
    	this.oldR = object.transform.rotation;
    }
}
renderer.prototype.clear = function(context){this.update(context, true);};
renderer.prototype.draw = function(context){this.update(context, false)};
renderer.prototype.update = function(context, erase){
    context.save();
	//TODO - Remove GC bait
	// point is in pixels
	var point = erase ? {x: this.oldX, y: this.oldY} : worldToScreenSpace({x: this.object.transform.position.x, y: this.object.transform.position.y});
	var r = erase ? this.oldR : this.object.transform.rotation;
	var scaleFactor = scale/16; //images are 16 pixels big
	context.translate(point.x, point.y);//translation in pixels.
	//90-r aligns canvas up to server up - server up is 0 degrees from standard angle, aka right.
	context.rotate((90-r)*(Math.PI/180));//Degrees to Radians!
	if(erase){
		//Extra 1px border cleared to account for anti-aliasing. This is in Pixels!
		context.clearRect(-this.boundingX*scale/2-1, -this.boundingY*scale/2-1, this.boundingX*scale+2, this.boundingY*scale+2);
	}else{
		//context.fillStyle=color;//Color defined by landingjs
		//context.fillRect(-this.boundingX/2, -this.boundingY/2, this.boundingX, this.boundingY);
		context.scale(scaleFactor, scaleFactor);//Scale it up!
		context.drawImage(images[this.object.type], -images[this.object.type].width/2, -images[this.object.type].height/2);
		this.oldX = point.x;
		this.oldY = point.y;
		this.oldR = this.object.transform.rotation;
	}
	context.restore();
};
