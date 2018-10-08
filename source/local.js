var Balle = require('./index.js');

{
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
        console.log('----------');
    });
}

{
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
        console.log('----------');
    });
}

{
    const init = +new Date;
    const p = Balle.all([
        Balle.one((res, rej) => {
            setTimeout(() => { res(500) }, 1000);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => { res(200) }, 2000);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => { res(300) }, 1500);
        }),
    ]);
    p.then((result) => {
        console.log((+new Date - init) + ' ≈ 2000');
        console.log(result); //[500, 200, 300]
    }).catch((cause) => {
        throw 'never thrown';
    }).finally(() => {
        console.log('----------');
    });

}

{
    const init = +new Date;
    const p = Balle.race([
        Balle.one((res, rej) => {
            setTimeout(() => { res(500) }, 1000);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => { res(200) }, 1500);
        }),
        Balle.one((res, rej) => {
            setTimeout(() => { res(300) }, 2000);
        }),
    ]);
    p.then((result) => {
        console.log((+new Date - init) + ' ≈ 1000');
        console.log(result + ' == 500'); //[]
    }).catch((cause) => {
        throw 'never thrown';
    }).finally(() => {
        console.log('----------');
    });
}


{
    Balle.chain([
        () => {
            return Balle.one((res, rej) => {
                setTimeout(() => {
                    res(100)
                }, 100);
            })
        },
        (r) => {
            return Balle.one((res, rej) => {
                setTimeout(() => {
                    res(101 + r)
                }, 200);
            })
        },
        (r) => {
            return Balle.one((res, rej) => {
                setTimeout(() => {
                    res(102 + r)
                }, 300);
            })
        }
    ]).then((r) =>{
        console.log('result : '+ r)
    }).finally(() => {
        console.log('----------');
    });
}