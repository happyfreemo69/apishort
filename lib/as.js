var ApiClient = require('./apiClient');
var util = require('util');
var handler = {
  get: function(target, name) {
    if(name == '__proxy'){
        return true;
    }
    if(name == 'then'){
        return function(fn){
            return target.acc.then(fn);
        }
    }
    if(name == 'catch'){
        return function(fn){
            return target.acc.catch(fn);
        }
    }

    if(typeof(name)!='string' || ['inspect', 'constructor', 'valueOf'].includes(name)){
        return target[name]
    }

    if(name in Object.getPrototypeOf(target)){
        return target[name]();
    }

    return target.fetch(name);
  }
};

function As(arr, headers){
    this.fetched = false;
    this.acc = Promise.resolve(arr);
    this.headers = headers || {};
    this.__wrapper = null;
}

As.prototype.hasLink = function(k){
    if(!this.arr.length){
        return false;
    }
    if(!this.arr[0]){
        return false;
    }
    if(!this.arr[0].links){
        return false;
    }
    return this.arr[0].links[k];
}

As.prototype.reduce = function(){

    return (...args)=>{
        this.acc = this.acc.then(arr=>{
            //assumes reduce is synchrone
            var coll = arr.reduce.apply(arr, args);
            return Promise.resolve(coll);
        });
        return this.__wrapper;
    }
}

As.prototype.lastStack = function(){
    return this.stack[this.stack.length-1];
}

//note: pagination not handled
As.prototype.fetch = function(k){
    return (query=null)=>{
        this.acc = this.acc.then(arr=>{

            var dfds = arr.map(x=>{
                if(!x.links[k]){
                    throw `${k} link not found in ${JSON.stringify(x)}`;
                }
                return ApiClient.fetch(x.links[k], query, this.headers);
            })
            return $.Promise.all(dfds).then(arr=>{
                return arr.reduce((acc,x)=>acc.concat(x.items && x.items || x),[]);
            })

        })

        return this.__wrapper;
    }
    
}

function $(x, headers){
    if(x && x.__proxy){
        return x;
    }
    if(Array.isArray(x)){
        var as = new As(x, headers
            )
        var p = new Proxy(as, handler);
        as.__wrapper = p;
        return p;
    }
    throw 'expect x: Proxy or collection like';
}
$.Promise = Promise;

module.exports = $