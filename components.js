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
component.prototype.update = function(){};

class transform extends component{
      constructor(object, X, Y, r, parent){
            super(object);
            this.position = {
                  x: X,
                  y: Y
            };
            this.rotation = r;
            if(parent) this.parent = parent;

            //get parent(){return this.parent;};
            //set parent(parent){this.parent = parent;};
      }
}
transform.prototype.translate = function(x, y){
    this.position.x += x;
    this.position.y += y;
};
transform.prototype.update = function(){

};

class networkView extends component{
      constructor(object){
          super(object);
          this.extra = {};//For extra data to sync.
      }
}
networkView.prototype.push = function(io){
    if(!this.active) return;
    var data = {
        x: this.object.transform.position.x,
        y: this.object.transform.position.y,
        r: this.object.transform.rotation,
        //How do we incorperate rigidbody data? I got this bro, no worries.
        extra: this.extra
    };
    io.emit('objectData', this.object.id, data);
};

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
    constructor(object, mesh){
        super(object);
        //Vertecies - array of objects - each object {x:,y:}
        this.mesh = mesh;
        this.rotatedMesh = [{},{},{},{}];
        //Are we a top-level collider?
        this.child = false;
        //Does this have children?
        this.hasChildren = false;
        //List of child objects
        this.children = [];
    }
}
collider.prototype.attach =  function(child){
    this.hasChildren = true;
    this.children.push(child);
    child.child = true;
};
collider.prototype.getAxis = function(){
    var ret = []; //this to return
    //Apply rotation to each Vertex.
    //this.rotateMesh();
    //LoopdeyLoop and stuff.
    for (var index = 0; index < this.rotatedMesh.length; ++index){
        var index2 = index==this.rotatedMesh.length-1?0:index+1;
        var axis = {x:this.rotatedMesh[index].y-this.rotatedMesh[index2].y,y:-(this.rotatedMesh[index].x-this.rotatedMesh[index2].x)};
        axis = normalize(axis);
        ret.push(axis);
    }
    //If two of the axis are parallel, remove one of them.
    for (var index = 0; index < ret.length; ++index){
        for (var index2 = 0; index2 < ret.length; ++index2){
            if(index!=index2 && ret[index] && ret[index2] && ret[index].x/ret[index2].x == ret[index].y/ret[index2].y)
                ret.splice(index2, 1);
        }
    }
    return ret;
};
collider.prototype.rotateMesh = function(){
    this.rotatedMesh.length = this.mesh.length;
    for (var index = 0; index < this.mesh.length; ++index){
        this.rotatedMesh[index] = {};
        var theta = (this.object.transform.rotation-90)*(Math.PI/180);
        this.rotatedMesh[index].x = Number(this.mesh[index].x)*Math.cos(theta)-Number(this.mesh[index].y)*Math.sin(theta)+this.object.transform.position.x;
        this.rotatedMesh[index].y = Number(this.mesh[index].y)*Math.cos(theta)+Number(this.mesh[index].x)*Math.sin(theta)+this.object.transform.position.y;
    }
};
collider.prototype.project = function(axis){//axis = {x:,y:}
    var max = dotProduct(this.rotatedMesh[0], axis);
    var min = max;
    for (var index = 0; index < this.rotatedMesh.length; ++index){
        var d = dotProduct(this.rotatedMesh[index], axis);
        if(d>max){
            max = d;
        }else if(d<min){
            min = d;
        }
    }
    return {min:min, max:max};
};

function normalize(axis){//axis = {x:,y:}
    var length = Math.sqrt(axis.x*axis.x+axis.y*axis.y);
    axis.x/=length;
    axis.y/=length;
    return axis;
}

function dotProduct(a, b){
    return a.x*b.x+a.y*b.y;
}

module.exports = {
      component: component,
      transform: transform,
      networkView: networkView,
      rigidBody: rigidBody,
      collider: collider
};
