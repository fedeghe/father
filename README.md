[![Coverage Status](https://coveralls.io/repos/github/fedeghe/balle/badge.svg?branch=master)](https://coveralls.io/github/fedeghe/balle?branch=master)
[![Build Status](https://travis-ci.org/fedeghe/balle.svg?branch=master)](https://travis-ci.org/fedeghe/balle)

<pre>
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
...  I promise
</pre>


# WTF ?
No... the world does not need that shit but I need to try to understand

**Just to be clear, this implemetation has <u>nothing</u> to do with [A+ promise specs](https://promisesaplus.com/)**

---

### install, build and test

```
> npm i

> npm run build

> npm test 
// OR
> npm run cover

```
---

### usage

Make a promise :

``` js
const p = new Balle((resolve, reject) => {
    var before = +new Date;
    setTimeout(() => {
        Math.random() > .5
        ? resolve([before, +new Date])
        : reject('that`s the cause');
    }, 2000);
})

// deal with success using then
.then((result) => {
    console.log(result);
})

// deal with rejection | thrown error using catch
.catch((whatever) => {
    console.log('Failure:');
    console.log(whatever);
})

// do something anyway
.finally((result_cause_error) => {
    // get the result in case on resolution or the cause
    // in case of rejection|error
    console.log('Executed regardless the resolution or rejection')
});
```

reject a promise: 

``` js
const p = new Balle((resolve, reject) => {
    var err = 'Ups... something went wrong';
    setTimeout(() => {
        reject(err);
    }, 1000);
})
.then(() => {
    throw 'never thrown';
})
.catch((cause) => {
    // this will in any case here
    console.log(cause);
});
```

**Balle.one**
``` js
// wraps the constructor call
const p1 = new Balle(/* executor func */);
// can be written
const p1 = Balle.one(/* executor func */);
```

**Balle.all**  
``` js
const init = +new Date;
const p = Balle.all([
    Balle.one((resolve, reject) => {
        setTimeout(() => { resolve(500) }, 1000);
    }),
    Balle.one((resolve, reject) => {
        setTimeout(() => { resolve(200) }, 2000); // +++
    }),
    Balle.one((resolve, reject) => {
        setTimeout(() => { resolve(300) }, 1500);
    }),
])
.then((result) => {
    console.log((+new Date - init)+ ' ≈ 2000');
    console.log(result); // ---> [500, 200, 300]
})
.catch((cause) => {
    throw 'never thrown';
});
```

**Balle.race** 
``` js
const init = +new Date;
const p = Balle.race([
    Balle.one((resolve, reject) => {
        setTimeout(() => { resolve(500) }, 1000); // +++ 
    }),
    Balle.one((resolve, reject) => {
        setTimeout(() => { resolve(200) }, 1500);
    }),
    Balle.one((resolve, reject) => {
        setTimeout(() => { resolve(300) }, 2000);
    }),
])
.then((result) => {
    console.log((+new Date - init) + ' ≈ 1000');
    console.log(result + ' == 500'); 
})
.catch((cause) => {
    throw 'never thrown';
});
```

**Balle.chain** 
``` js
Balle.chain([
    () => {
        return Balle.one((resolve, reject) => {
            setTimeout(() => {
                Math.random() > .5
                ? reject('a problem occurred at #1')
                : resolve(100)
            }, 100);
        })
    },
    (r) => {
        return Balle.one((resolve, reject) => {
            setTimeout(() => {
                Math.random() > .5
                ? reject('a problem occurred at #2')
                : resolve(101 + r)
            }, 200);
        })
    },
    (r) => {
        return Balle.one((resolve, reject) => {
            setTimeout(() => {
                Math.random() > .5
                ? reject('a problem occurred at #3')
                : resolve(102 + r)
            }, 300);
        })
    }
])
.then((r) =>{
    console.log('result : '+ r)
})
.catch((cause)=>{
    console.log('cause : '+ cause)
})
.finally(() => {
    console.log('----------');
});
```
---
federico.ghedina@gmail.com  
last build : 9/10/2018