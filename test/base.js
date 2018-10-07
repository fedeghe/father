var assert = require('assert'),
    Father = require('../index.js');

var RESULTS = {
    STRING: 'promise resolved',
    CAUSE: 'this is the cause',
    ALL_NOT_ITERABLE: 'Father.all acceps an Iterable Promise only',
    RACE_NOT_ITERABLE: 'Father.race acceps an Iterable Promise only'
};


describe('Solving', function () {
    describe('basic solve', function () {
        
        it('resolve straigth', (done) => {
            const resolvingPromise = new Father((resolve, reject) => {
                resolve(RESULTS.STRING);
                done();
            });

            assert.equal(resolvingPromise.status, Father.STATUSES.FULFILLED);
            assert.equal(resolvingPromise.value, RESULTS.STRING);
        });
        it('resolve straigth and then', (done) => {
            const resolvingPromise = new Father((resolve, reject) => {
                resolve(RESULTS.STRING);
                done();
            });
            resolvingPromise.then(function (result) {
                assert.equal(result, RESULTS.STRING);    
            });
            assert.equal(resolvingPromise.status, Father.STATUSES.FULFILLED);
            assert.equal(resolvingPromise.value, RESULTS.STRING);
        });

        it('resolve asynch ', (done) => {
            const resolvingPromise = new Father((resolve, reject) => {
                setTimeout(function () {
                    resolve(RESULTS.STRING);
                }, 100);
            });
            resolvingPromise.then((result) => {
                assert.equal(result, RESULTS.STRING);
                done();
            });
        });

        it('resolve asynch and exec finally', (done) => {
            const resolvingPromise = new Father((resolve, reject) => {
                setTimeout(function () {
                    resolve(RESULTS.STRING);
                }, 100);
            });
            resolvingPromise.then((result) => {
                // whatever
            }).finally(function (result) {
                assert.equal(result, RESULTS.STRING);
                done();
            });
        });

    });
});

describe('Rejection', function () {
    describe('basic reject', function () {

        it('reject straigth', (done) => {
            const resolvingPromise = new Father((resolve, reject) => {
                reject(RESULTS.STRING);
                done();
            });
            assert.equal(resolvingPromise.status, Father.STATUSES.REJECTED);
            assert.equal(resolvingPromise.value, undefined);
        });
        it('reject asynch ', (done) => {
            const resolvingPromise = new Father((resolve, reject) => {
                setTimeout(function () {
                    reject(RESULTS.CAUSE);
                }, 100);
            });
            resolvingPromise.then((result) => {
                console.log('NEVER EXEC SINCE REJECTED!!!!!')
                assert.equal(result, 'irrelevant');
                done();
            }).catch((cause) => {
                assert.equal(resolvingPromise.status, Father.STATUSES.REJECTED);
                assert.equal(resolvingPromise.result, undefined);
                assert.equal(cause, RESULTS.CAUSE);
                done();
            });
        });

    });
});


describe('Static section', function () {
    describe('Father.all', function () {
        it('solves all the promises', (done) => {
            Father.all([
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(100);
                    },100);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(101);
                    }, 200);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(102);
                    }, 300);
                })
            ]).then(function (res) {
                assert.equal(res[0], 100);
                assert.equal(res[1], 101);
                assert.equal(res[2], 102);
            }).finally(function (res) {
                done();
            });
        });
        it('solves all the promises but one', (done) => {
            Father.all([
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(100);
                    }, 100);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(101);
                    }, 200);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        reject(RESULTS.CAUSE);
                    }, 300);
                })
            ]).catch(function (cause) {
                assert.equal(cause, RESULTS.CAUSE);
                done();
            }).then(function (res) {
                throw 'This will not run';
            }).finally(function (res) {
                // FINALLY could break
                assert.equal(res, RESULTS.CAUSE);
            });
        });
        it('does not solves all cause not iterable', (done) => {
            Father.all({}).catch(function (cause) {
                assert.equal(cause, RESULTS.ALL_NOT_ITERABLE);
                done();
            }).then(function (res) {
                throw 'This will not run';
            }).finally(function (res) {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.ALL_NOT_ITERABLE);
            });
        });
    });

    describe('Father.race', function () {
        it('the right winner', (done) => {
            Father.race([
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(1000);
                    }, 100);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(Math.PI);
                    }, 200);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(9876543210);
                    }, 300);
                })
            ]).then(function (res) {
                assert.equal(res, 1000);
            }).finally(function (res) {
                assert.equal(res, 1000);
                done();
            });
        });
        it('the right winner, one rejects, catched', (done) => {
            Father.race([
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        reject(1000);
                    }, 100);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(Math.PI);
                    }, 200);
                }),
                new Father(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(9876543210);
                    }, 300);
                })
            ]).then(function () {
                throw new Error('Never thrown');
            }).catch(function (res) {
                assert.equal(res, 1000);
                done();
            }).finally(function (res) {
                assert.equal(res, 1000);
            });
        });
        it('does not solves all cause not iterable', (done) => {
            Father.race({}).catch(function (cause) {
                assert.equal(cause, RESULTS.RACE_NOT_ITERABLE);
                done();
            }).then(function (res) {
                throw 'This will not run';
            }).finally(function (res) {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.RACE_NOT_ITERABLE);
            });
        });
    });

    describe('Father.reject', function () {
        it('rejects as expected', (done) => {
            Father.reject(RESULTS.CAUSE).catch(function (cause) {
                assert.equal(cause, RESULTS.CAUSE);
                done();
            }).then(function (res) {
                throw 'This will not run';
            }).finally(function (res) {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.CAUSE);
            });
        });
    });

    describe('Father.resolve', function () {
        it('resolve as expected passing a promise', (done) => {
            var p = new Father(function (resolve) {
                setTimeout(function () {
                    resolve(RESULTS.STRING);
                }, 200);
            });
            Father.resolve(p).then(function (result) {
                assert.equal(result, RESULTS.STRING);
                done();
            }).finally(function (res) {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.STRING);
            });
        });
        it('resolve as expected passing a value', (done) => {
            var p = new Father();
            Father.resolve(RESULTS.STRING)
            .then(function (result) {
                assert.equal(result, RESULTS.STRING);
                done();
            }).finally(function (res) {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.STRING);
            });
        });
    });
    describe('Some edge cases', function () {
        it('try to reject a solved one', (done) => {
            var p = new Father(function (resolve, reject) {
                resolve(RESULTS.STRING);
                reject(200);
                
            }).then(function (res) {
                assert.equal(res, RESULTS.STRING);
                done();
            });
        });
        it('not a function passed to constructor', (done) => {
            new Father('not null but not a function')
            .then(function (res) {
                throw 'This will not run';
            }).catch(function (message) {
                assert.equal(message, 'executor is not a function');
                done();
            });
        });
    });



    describe('utilities', function () {
        it('isFunc', () => {
            assert.equal(Father._isFunc(function () {}), true);
            assert.equal(Father._isFunc({}), false);
            assert.equal(Father._isFunc(1), false);
            assert.equal(Father._isFunc('function'), false);
            assert.equal(Father._isFunc([1,2,3,4,5]), false);  
        });
        it('isIterable', () => {
            assert.equal(Father._isIterable(function () { }), false);
            assert.equal(Father._isIterable({}), false);
            assert.equal(Father._isIterable(1), false);
            assert.equal(Father._isIterable('function'), true);
            assert.equal(Father._isIterable(null), false);
            assert.equal(Father._isIterable([1, 2, 3, 4, 5]), true);
        });
    });
    


});
