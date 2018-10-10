function Balle(executor) {
    var self = this,
        done = false;
    this.status = Balle.STATUSES.PENDING;
    this.value = undefined;
    this.cause = undefined;
    this.resolvers = this.resolvers || [];
    this.rejectors = this.rejectors || [];
    this.finalizers = this.finalizers || [];
    executor = executor || function () {};
    try {
        executor(function ___SOLVER(value) {
            if (done || self.status !== Balle.STATUSES.PENDING) return;
            done = true;
            self.status = Balle.STATUSES.FULFILLED;
            self.value = value;
            self.resolvers.forEach(function (then) {
                then(self.value);
            }, self);
            self.finalizers.forEach(function (finalize) {
                finalize(self.value);
            }, self);
        }, function ___REJECTOR(cause) {
            if (done || self.status !== Balle.STATUSES.PENDING) return;
            done = true;
            self.status = Balle.STATUSES.REJECTED;
            self.cause = cause;
            self.rejectors.forEach(function (rejector) {
                rejector(self.cause);
            }, self);
            self.finalizers.forEach(function (finalize) {
                finalize(self.cause);
            }, self);
        });
    } catch(e) {
        return Balle.reject(e.message);
    }
    return this;
}

Balle.prototype.launch = function (executor) {
    return Balle.call(this, executor);
};

Balle.prototype.then = function (res, rej) {    
    switch (this.status) {
        case Balle.STATUSES.PENDING:
            this.resolvers.push(res);
            rej && this.rejectors.push(rej);
            break;
        case Balle.STATUSES.FULFILLED:
            return res(this.value);
    }
    return this;
};

Balle.prototype.catch = function (rej) {
    switch (this.status) {
        case Balle.STATUSES.PENDING:
            this.rejectors.push(rej);
            break;
        default:
            return rej(this.cause);
    }
    return this;
};

Balle.prototype.finally = function (cb) {
    this.finalizers.push(cb);
    return this;
};

/**
 * STATIC section
 */
Balle.STATUSES = {
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED'
};

Balle._isFunc = function (f) { return typeof f === 'function';};

Balle._isIterable = function (obj) {
    if (obj == null) { return false; }
    return Balle._isFunc(obj[Symbol.iterator]);
};

// factory
Balle.one = function (exec) { return new Balle(exec); };

Balle.all = function (pros) {
    if (!Balle._isIterable(pros)){
        return Balle.reject('Balle.all acceps an Iterable Promise only');
    }
    var results = [],
        l = pros.length,
        solN = 0;

    return new Balle(function (resolve, reject) {
        pros.forEach(function (pro, i) {
            pro.then(function (v) {
                solN++;
                results[i] = v;
                solN == l && resolve(results);
            }).catch(reject);
        });
    });
};

Balle.race = function (pros) {
    if (!Balle._isIterable(pros)) {
        return Balle.reject('Balle.race acceps an Iterable Promise only');
    }
    return new Balle(function (resolve, reject) {
        pros.forEach(function (pro){ pro.then(resolve).catch(reject)});
    });
};

Balle.chain = function (pros) {
    if (!Balle._isIterable(pros)) {
        return Balle.reject('Balle.chain acceps an Iterable Promise only');
    }
    const l  = pros.length;
    return new Balle(function (res, rej) {
        (function chain(index, r) {
            return index == l
            ? res(r)
            : pros[index](r)
                .then(function (r) {
                    chain(++index, r);
                }).catch(function (r) {
                    rej(r);
                });
        })(0);
    });
};

Balle.reject = function (cause) {
    return new Balle(function (s, r) { return r(cause); });
};

Balle.resolve = function (mix) {
    return new Balle(function (res, rej) {
        mix instanceof Balle
        ? mix.then(res).catch(rej)
        : res(mix);
    });
};

typeof module !== 'undefined' && (module.exports = Balle);
