/*
     ...     ..                        ..       ..
  .=*8888x <"?88h.               x .d88"  x .d88"
 X>  '8888H> '8888                5888R    5888R
'88h. `8888   8888         u      '888R    '888R        .u
'8888 '8888    "88>     us888u.    888R     888R     ud8888.
 `888 '8888.xH888x.  .@88 "8888"   888R     888R   :888'8888.
   X" :88*~  `*8888> 9888  9888    888R     888R   d888 '88%"
 ~"   !"`      "888> 9888  9888    888R     888R   8888.+"
  .H8888h.      ?88  9888  9888    888R     888R   8888L
 :"^"88888h.    '!   9888  9888   .888B .  .888B . '8888c. .+
 ^    "88888hx.+"    "888*""888"  ^*888%   ^*888%   "88888%
        ^"**""        ^Y"   ^Y'     "%       "%       "YP'
                                                            v. 1.0.5
federico.ghedina@gmail.com
Build #175 on 9/10/2018 @ 22:57:30
Size: ~3KB

*/
function Balle(executor){var self=this, done=false;this.status=Balle.STATUSES.PENDING;this.value=undefined;this.cause=undefined;this.resolvers=[];this.rejectors=[];this.finalizers=[];executor=executor || function(){};try{executor(function ___SOLVER(value){if(done || self.status !==Balle.STATUSES.PENDING)return;done=true;self.status=Balle.STATUSES.FULFILLED;self.value=value;self.resolvers.forEach(function(then){then(self.value);}, self);self.finalizers.forEach(function(finalize){finalize(self.value);}, self);}, function ___REJECTOR(cause){if(done || self.status !==Balle.STATUSES.PENDING)return;done=true;self.status=Balle.STATUSES.REJECTED;self.cause=cause;self.rejectors.forEach(function(rejector){rejector(self.cause);}, self);self.finalizers.forEach(function(finalize){finalize(self.cause);}, self);});}catch(e){return Balle.reject(e.message);}return this;}Balle.prototype.then=function(res, rej){switch(this.status){case Balle.STATUSES.PENDING:this.resolvers.push(res);rej && this.rejectors.push(rej);break;case Balle.STATUSES.FULFILLED:return res(this.value);}return this;};Balle.prototype.catch=function(rej){switch(this.status){case Balle.STATUSES.PENDING:this.rejectors.push(rej);break;default:return rej(this.cause);}return this;};Balle.prototype.finally=function(cb){this.finalizers.push(cb);return this;};Balle.STATUSES={PENDING:'PENDING', FULFILLED:'FULFILLED', REJECTED:'REJECTED'};Balle._isFunc=function(f){return typeof f==='function';};Balle._isIterable=function(obj){if(obj==null){return false;}return Balle._isFunc(obj[Symbol.iterator]);};Balle.one=function(exec){return new Balle(exec);};Balle.all=function(pros){if(!Balle._isIterable(pros)){return Balle.reject('Balle.all acceps an Iterable Promise only');}var results=[], l=pros.length, solN=0;return new Balle(function(resolve, reject){pros.forEach(function(pro, i){pro.then(function(v){solN++;results[i]=v;solN==l && resolve(results);}).catch(reject);});});};Balle.race=function(pros){if(!Balle._isIterable(pros)){return Balle.reject('Balle.race acceps an Iterable Promise only');}return new Balle(function(resolve, reject){pros.forEach(function(pro){pro.then(resolve).catch(reject)});});};Balle.chain=function(pros){if(!Balle._isIterable(pros)){return Balle.reject('Balle.chain acceps an Iterable Promise only');}const l=pros.length;return new Balle(function(res, rej){(function chain(index, r){return index==l ? res(r):pros[index](r).then(function(r){chain(++index, r);}).catch(function(r){rej(r);});})(0);});};Balle.reject=function(cause){return new Balle(function(s, r){return r(cause);});};Balle.resolve=function(mix){return new Balle(function(res, rej){mix instanceof Balle ? mix.then(res).catch(rej):res(mix);});};typeof module !=='undefined' &&(module.exports=Balle);