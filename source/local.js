var Balle = require('./index.js');
/*
setTimeout(()=> {
    console.log('--- START #1 ---');
    const p = new Balle((res, rej) => {
        var before = +new Date;
        setTimeout(() => {
            // let's say it solve
            res([before, +new Date]);
        }, 2000);
    });

    p.then((res) => {
        console.log(res);
    })
    .finally((res) => {
        // get the result in case on resolution or the cause in case of rejection|error
        console.log('executed regardless the resolution or rejection');
        console.log(res);
        console.log('--- END #1 ---');
    });
}, 0);

setTimeout(() => {
    console.log('--- START #2 ---');
    const p = new Balle((res, rej) => {
        setTimeout(() => {
            rej('Ups... something went wrong, as expected!')
        }, 1000);
    });
    p.then(() => {
        throw 'never thrown';
    }).catch((cause) => {
        // this will in any case here
        console.log(cause);
    }).finally(() => {
        console.log('--- END #2 ---');
    });
}, 2000 * 1.1);

setTimeout(() => {
    console.log('--- START #3 ---');
    const init = +new Date,
        r1 = Math.random() * 1E3,
        r2 = Math.random() * 1E3,
        r3 = Math.random() * 1E3;

    const p = Balle.all([
        Balle.one((res, rej) => {
            setTimeout(() => {
                Math.random() > .9
                    ? rej('a problem occurred at #1')
                    : res(1);
            }, r1);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => {
                Math.random() > .9
                    ? rej('a problem occurred at #3')
                    : res(2);
            }, r2);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => {
                Math.random() > .9
                    ? rej('a problem occurred at #3')
                    : res(3);
            }, r3);
        }),
    ])
    .then((result) => {
        console.log('time: ' + (+new Date - init) + 'ms');
        console.log('result: ' + result);
    })
    .catch((cause) => {
        console.log('Something went wrong cause ' + cause);
    })
    .finally(() => {
        console.log('--- END #3 ---');
    });

}, 3000 * 1.1);


setTimeout(() => {
    console.log('--- START #4 ---');
    const init = +new Date,
        r1 = Math.random() * 1E3,
        r2 = Math.random() * 1E3,
        r3 = Math.random() * 1E3;
    const p = Balle.race([
        Balle.one((res, rej) => {
            setTimeout(() => {
                Math.random() > .5
                    ? rej('a problem occurred at #1')
                    : res(100);
            }, r1);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => {
                Math.random() > .5
                    ? rej('a problem occurred at #2')
                    : res(200);
            }, r2);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => {
                Math.random() > .5
                    ? rej('a problem occurred at #3')
                    : res(300);
            }, r3);
        }),
    ])
    .then((result) => {
        console.log('time: ' + (+new Date - init) + 'ms');
        console.log('result: ' + result);
    })
    .catch((cause) => {
        console.log('Something went wrong cause ' + cause)
    })
    .finally(() => {
        console.log('--- END #4 ---');
    });
}, 4000 * 1.1);


setTimeout(() => {
    console.log('--- START #5 ---');
    Balle.chain([
        () => {
            return Balle.one((resolve, reject) => {
                setTimeout(() => {
                    Math.random() > .8
                        ? reject('a problem occurred at #1')
                        : resolve(100)
                }, 100);
            })
        },
        (r) => {
            return Balle.one((resolve, reject) => {
                setTimeout(() => {
                    Math.random() > .8
                        ? reject('a problem occurred at #2')
                        : resolve(101 + r)
                }, 200);
            })
        },
        (r) => {
            return Balle.one((resolve, reject) => {
                setTimeout(() => {
                    Math.random() > .8
                        ? reject('a problem occurred at #3')
                        : resolve(102 + r)
                }, 300);
            })
        }
    ])
    .then((r) => {
        console.log('All good for the chain : ' + r)
    })
    .catch((cause) => {
        console.log('Something went wrong cause ' + cause)
    })
    .finally(() => {
        console.log('--- END #5 ---');
    });
}, 5000 * 1.1);
*/

setTimeout(() => {
    console.log('--- START #6 ---');
    
    const resolvingPromise = Balle.one();

    resolvingPromise
    .then(() => {
        throw 'Never executed';
    })
    .catch((cause) => {
        console.log('catched');
        console.log(cause);
    }).finally(function (cause) {
        console.log('finally');
        console.log(cause);
    });

    resolvingPromise
    .launch((resolve, reject) => {
        setTimeout(function () {
            reject('xxx');
        }, 100);
    });
}, 6000 * 1.1);