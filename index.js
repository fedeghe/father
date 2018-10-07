/**
 * 
 * @param {*} executor 
 */
function Father(executor) {
    var self = this,
        done = false;
    this.status = Father.STATUSES.PENDING;
    this.value = undefined;
    this.cause = undefined;
    this.thens = [];
    this.onCatch = undefined;
    this.onFinally = undefined;
    try {
        executor(function ___SOLVER(value) {
            if (done || self.status !== Father.STATUSES.PENDING) return;
            done = true;
            self.status = Father.STATUSES.FULFILLED;
            self.value = value;
            self.thens.forEach(function (then) {
                then(self.value);
            }, self);
            Father._isFunc(self.onFinally) && self.onFinally(self.value)
        }, function ___REJECTOR(cause) {
            if (done || self.status !== Father.STATUSES.PENDING) return;
            done = true;
            if (self.status !== Father.STATUSES.PENDING) return;
            self.status = Father.STATUSES.REJECTED;
            self.cause = cause;
            Father._isFunc(self.onCatch) && self.onCatch(self.cause);
            Father._isFunc(self.onFinally) && self.onFinally(self.cause);
        });
    } catch(e) {
        this.catch(e.message);
    }
    return this;
}

Father.prototype.then = function (cb) {
    switch (this.status) {
        case Father.STATUSES.PENDING:
            this.thens.push(cb);
            break;
        case Father.STATUSES.FULFILLED:
            cb(this.value);
            break;
    }
    
    return this;
};

Father.prototype.catch = function (cb) {
    this.onCatch = cb;
    return this;
};

Father.prototype.finally = function (cb) {
    this.onFinally = cb;
    return this;
};

/**
 * STATIC section
 */
Father.STATUSES = {
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED'
};

Father._isFunc = function (f) { return typeof f === 'function';};

Father._isIterable = function (obj) {
    if (obj == null) { return false; }
    return Father._isFunc(obj[Symbol.iterator]);
};

Father.all = function (pros) {
    //check iterability of pros
    if (!Father._isIterable(pros)){
        throw new Error('Father.all acceps an Iterable Promise only');
    }
    var results = [],
        l = pros.length,
        solN = 0;

    return new Father(function (resolve, reject) {
        pros.forEach((pro, i) => {
            pro.then(function (v) {
                solN++;
                results[i] = v;
                solN == l && resolve(results);
            }, reject);
        });
    });
};

Father.race = function (pros) {
    //check iterability of pros
    if (!Father._isIterable(pros)) {
        throw new Error('Father.race acceps an Iterable Promise only');
    }
    return new Father(function (resolve, reject) {
        pros.forEach(pro => pro.then(resolve).catch(reject));
    });
};

Father.reject = function (cause) {
    return new Father(function (s, r) {r(cause);});
};

Father.resolve = function (mix) {
    return mix instanceof Father
        ? new Father(function (resolve, reject) {
            mix.then(resolve).catch(reject);
        })
        : new Father(function (s, r) { s(mix); });
};

if (typeof module !== 'undefined'){
    module.exports = Father;
}