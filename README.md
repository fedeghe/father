[![Coverage Status](https://coveralls.io/repos/github/fedeghe/balle/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/balle?branch=master)
[![Build Status](https://travis-ci.org/fedeghe/balle.svg?branch=master)](https://travis-ci.org/fedeghe/balle)


# Balle ... I promise  

I tried to investigate a bit in the Promise implemetation, and this is the result. 

### test

Install, build and test

```
> npm i

> npm run build

> npm test

```


### usage

Make a promise :

``` js
const p = new Balle((res, rej) => {
    var before = +new Date;
    setTimeout(() => {
        // let's say it solve
        res([before, +new Date]);
    }, 2000);
});

p.then((result) => {
    console.log(result);
}).finally((result) => {
    // get the result in case on resolution or the cause
    // in case of rejection|error
    console.log('Executed regardless the resolution or rejection')
});
```

fail a promise: 

``` js
const p = new Balle((res, rej) => {
    var err = 'Ups... something went wrong';
    setTimeout(() => {
        if (Math.random() > .5) {
            rej(err)
        } else {
            throw err;
        }
    }, 1000);
});
p.then(() => {
    throw 'never thrown';
}).catch((cause) => {
    // this will in any case here
    console.log(cause);
});
```

Balle.one
``` js
// wraps the constructor call
const p1 = new Balle(/* executor func */);
// can be written
const p1 = Balle.one(/* executor func */);
```

Balle.all: 
``` js
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
    console.log((+new Date - init)+ ' ≈ 2000');
    console.log(result); //[500, 200, 300]
}).catch((cause) => {
    throw 'never thrown';
});
```

Balle.race: 
``` js
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
});
```


