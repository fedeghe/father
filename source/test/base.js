var assert = require('assert'),
    Balle = require('../dist/index.js');

var RESULTS = {
    STRING: 'promise resolved',
    CAUSE: 'this is the cause',
    ALL_NOT_ITERABLE: 'Balle.all acceps an Iterable Promise only',
    RACE_NOT_ITERABLE: 'Balle.race acceps an Iterable Promise only',
    CHAIN_NOT_ITERABLE: 'Balle.chain acceps an Iterable Promise only'
};

describe('Solving', () => {
    describe('basic solve', () => {  
        it('resolve straigth', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                resolve(RESULTS.STRING);
                done();
            });

            assert.equal(resolvingPromise.status, Balle.STATUSES.FULFILLED);
            assert.equal(resolvingPromise.value, RESULTS.STRING);
        });

        it('resolve straigth and then', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                resolve(RESULTS.STRING);
                done();
            });
            resolvingPromise.then(result => assert.equal(result, RESULTS.STRING));
            assert.equal(resolvingPromise.status, Balle.STATUSES.FULFILLED);
            assert.equal(resolvingPromise.value, RESULTS.STRING);
        });

        it('resolve asynch ', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                setTimeout(() => resolve(RESULTS.STRING), 100);
            });
            resolvingPromise.then(result => {
                assert.equal(result, RESULTS.STRING);
                done();
            });
        });

        it('resolve asynch and check the finally', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                setTimeout(() => resolve(RESULTS.STRING), 100);
            });
            resolvingPromise.then(result => {
                // whatever
            }).finally(result => {
                assert.equal(result, RESULTS.STRING);
                done();
            });
        });

        it('consume it then', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                setTimeout(() => {
                    resolve(RESULTS.STRING);
                }, 100);
            });
            /**
             * as u can see then has nothing to do with https://promisesaplus.com/
             */
            resolvingPromise.then(result => {
                assert.equal(result, RESULTS.STRING);
            }).finally(result => {
                assert.equal(result, RESULTS.STRING);
                done();
            });
        });

        it('catch from then ', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                setTimeout(() => reject(RESULTS.CAUSE), 100);
            });
            /**
             * as u can see then has nothing to do with https://promisesaplus.com/
             */
            resolvingPromise.then(() => {
                throw 'Never executed';
            }, (cause) => {
                assert.equal(cause, RESULTS.CAUSE);
                done();
            })
        });

        it('go forward with catch & finally', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                setTimeout(() => reject(RESULTS.CAUSE), 100);
            });
            let check = 0;
            resolvingPromise.then(() => {
                throw 'Never executed';
            }).catch((cause) => {
                assert.equal(check++, 0);
                assert.equal(cause, RESULTS.CAUSE);
            }).finally(cause => {
                assert.equal(check, 1);
                done();
            });
        });
    
        it('create empty one and then launch', done => {
            const resolvingPromise = Balle.one();
            var executor = (resolve, reject) => {
                    setTimeout(() => reject(RESULTS.CAUSE), 100);
                };
            resolvingPromise.launch(executor).then(() => {
                throw 'Never executed';
            }).catch((cause) => {
                assert.equal(cause, RESULTS.CAUSE);
            }).finally(cause => {
                done();
            });
        });

        it('solves straigth the instance', done => {
            const resolvingPromise = Balle.one();
            resolvingPromise.resolve('this is the value');
            resolvingPromise.then(r => {
                assert.equal(r, 'this is the value');
                done();
            });
        });

        it('rejects straigth the instance', (done) => {
            const rejectingPromise = Balle.one();
            rejectingPromise.reject('this is the value');
            rejectingPromise.catch(r => {
                assert.equal(r, 'this is the value');
                done();
            });
        });
    });
});

describe('Rejection', () => {
    describe('basic reject', () => {
        it('reject straigth', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                reject(RESULTS.STRING);
                done();
            });
            assert.equal(resolvingPromise.status, Balle.STATUSES.REJECTED);
            assert.equal(resolvingPromise.value, undefined);
        });

        it('reject asynch ', done => {
            const resolvingPromise = new Balle((resolve, reject) => {
                setTimeout(() => {
                    reject(RESULTS.CAUSE);
                }, 100);
            });
            resolvingPromise.then(result => {
                console.log('NEVER EXEC SINCE REJECTED!!!!!')
                assert.equal(result, 'irrelevant');
                done();
            }).catch((cause) => {
                assert.equal(resolvingPromise.status, Balle.STATUSES.REJECTED);
                assert.equal(resolvingPromise.result, undefined);
                assert.equal(cause, RESULTS.CAUSE);
                done();
            });
        });
    });
});

describe('Static section', () => {
    describe('Balle.all', () => {
        it('solves all the promises', done => {
            Balle.all([
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(100);
                    },100);
                }),
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(101);
                    }, 200);
                }),
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(102);
                    }, 300);
                })
            ]).then(res => {
                assert.equal(res[0], 100);
                assert.equal(res[1], 101);
                assert.equal(res[2], 102);
            }).finally(res => {
                done();
            });
        });

        it('solves all the promises but one', (done) => {
            Balle.all([
                new Balle((resolve, reject) => reject(RESULTS.CAUSE)),
                new Balle((resolve, reject) => setTimeout(() => resolve(101), 200)),
                new Balle((resolve, reject) => setTimeout(() => resolve(300), 300))
            ]).catch(cause => {
                assert.equal(cause, RESULTS.CAUSE);
                done();
            }).then(res => {
                throw 'This will not run';
            }).finally(res => {
                // FINALLY could break
                assert.equal(res, RESULTS.CAUSE);
            });
        });

        it('does not solves all cause not iterable', done => {
            Balle.all({}).catch(cause => {
                assert.equal(cause, RESULTS.ALL_NOT_ITERABLE);
                done();
            }).then(res => {
                throw 'This will not run';
            }).finally(res => // done();
                // FINALLY could break
                assert.equal(res, RESULTS.ALL_NOT_ITERABLE)
            );
        });
    });

    describe('Balle.chain', () => {
        it('solve the chain as expected', done => {
            Balle.chain([
                () => Balle.one((res, rej) => {
                    setTimeout(() => {
                        res(100)
                    }, 100);
                }),
                r => Balle.one((res, rej) => {
                    setTimeout(() => {
                        res(101 + r)
                    }, 200);
                }),
                r => Balle.one((res, rej) => {
                    setTimeout(() => {
                        res(102 + r)
                    }, 300);
                })
            ]).then((res) => {
                assert.equal(res, 303);
                done();
            });
        });

        it('reject the chain as expected', done => {
            Balle.chain([
                () => Balle.one((res, rej) => {
                    setTimeout(() => {
                        res(100)
                    }, 100);
                }),
                r => Balle.one((res, rej) => {
                    setTimeout(() => {
                        res(101 + r)
                    }, 200);
                }),
                r => Balle.one((res, rej) => {
                    setTimeout(() => {
                        rej('an error occurred handling the given value: ' + r);
                    }, 300);
                })
            ]).then(res => {
                throw 'This will not run';
            }).catch((cause) => {
                assert.equal(cause, 'an error occurred handling the given value: 201');
                done();
            });
        });

        it('does not solves all cause not iterable', done => {
            Balle.chain({}).catch(cause => {
                assert.equal(cause, RESULTS.CHAIN_NOT_ITERABLE);
                done();
            }).then(res => {
                throw 'This will not run';
            }).finally(res => {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.CHAIN_NOT_ITERABLE);
            });
        });
    })

    describe('Balle.race', () => {
        it('the right winner', done => {
            Balle.race([
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(1000);
                    }, 100);
                }),
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(Math.PI);
                    }, 200);
                }),
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(9876543210);
                    }, 300);
                })
            ]).then(res => {
                assert.equal(res, 1000);
            }).finally(res => {
                assert.equal(res, 1000);
                done();
            });
        });
        it('the right winner, one rejects, catched', done => {
            Balle.race([
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        reject(1000);
                    }, 100);
                }),
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(Math.PI);
                    }, 200);
                }),
                new Balle((resolve, reject) => {
                    setTimeout(() => {
                        resolve(9876543210);
                    }, 300);
                })
            ]).then(() => {
                throw new Error('Never thrown');
            }).catch(res => {
                assert.equal(res, 1000);
                done();
            }).finally(res => {
                assert.equal(res, 1000);
            });
        });
        it('does not solves all cause not iterable', (done) => {
            Balle.race({}).catch(cause => {
                assert.equal(cause, RESULTS.RACE_NOT_ITERABLE);
                done();
            }).then(res => {
                throw 'This will not run';
            }).finally(res => {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.RACE_NOT_ITERABLE);
            });
        });
    });

    describe('Balle.reject', () => {
        it('rejects as expected', (done) => {
            Balle.reject(RESULTS.CAUSE).catch(cause => {
                assert.equal(cause, RESULTS.CAUSE);
                done();
            }).then(res => {
                throw 'This will not run';
            }).finally(res => {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.CAUSE);
            });
        });
    });

    describe('Balle.resolve', () => {
        it('resolve as expected passing a promise', (done) => {
            var p = new Balle(resolve => {
                setTimeout(() => {
                    resolve(RESULTS.STRING);
                }, 200);
            });
            Balle.resolve(p).then(result => {
                assert.equal(result, RESULTS.STRING);
                done();
            }).finally(res =>  {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.STRING);
            });
        });
        it('resolve as expected passing a value', (done) => {
            var p = new Balle();
            Balle.resolve(RESULTS.STRING)
            .then(result => {
                assert.equal(result, RESULTS.STRING);
                done();
            }).finally(res =>  {// done();
                // FINALLY could break
                assert.equal(res, RESULTS.STRING);
            });
        });
    });

    describe('Some edge cases', () => {
        it('try to reject a solved one', (done) => {
            var p = new Balle((resolve, reject) => {
                resolve(RESULTS.STRING);
                reject(200);
                
            }).then(res => {
                assert.equal(res, RESULTS.STRING);
                done();
            });
        });
        it('not a function passed to constructor', (done) => {
            Balle.one('not null but not a function')
            .then(res => {
                throw 'This will not run';
            }).catch(message => {
                assert.equal(!!message.match(/is\snot\sa\sfunction$/), true);
                done();
            });
        });
    });

    describe('utilities', () => {
        it('isFunc', () => {
            assert.equal(Balle._isFunc(() => {}), true);
            assert.equal(Balle._isFunc({}), false);
            assert.equal(Balle._isFunc(1), false);
            assert.equal(Balle._isFunc('function'), false);
            assert.equal(Balle._isFunc([1,2,3,4,5]), false);  
        });
        it('isIterable', () => {
            assert.equal(Balle._isIterable(() => {}), false);
            assert.equal(Balle._isIterable({}), false);
            assert.equal(Balle._isIterable(1), false);
            assert.equal(Balle._isIterable('function'), true);
            assert.equal(Balle._isIterable(null), false);
            assert.equal(Balle._isIterable([1, 2, 3, 4, 5]), true);
        });
    });

});
