if (typeof require !== 'undefined') {
    var Father = require('./index.js');
}

function get(url) {
    return new Father(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function() {
            if (req.status == 200) {
                resolve(req.response);
            } else {
                reject(new Error(req.statusText));
            }
        };
        req.onerror = function () {
            reject(new Error('Networking error'))
        };
        req.send();
    });
}


// var t = get('http://www.jmvc.org').then(function (res) {
//     console.log('then 1');
//     console.log(res)
// }).catch(function (err) {
//     console.log('err');
//     console.log(err)
// }).then(function (res) {
//     console.log('then2');
//     console.log(res)
// }).finally(function (res) {
//     console.log('finally');
//     console.log(res)
// });


/*
Pro.all([
    get('http://www.jmvc.org'),
    get('https://promisesaplus.com/#point-44')
]).then(function (res) {
    // console.log(res);
}).finally(function (res) {
    console.log(res[0]);
    console.log(res[1]);
});
*/

/*
Father.race([
    new Father(function (resolve, reject) {
        setTimeout(function () {
            resolve('`first`');
        }, 1000);
    }),
    new Father(function (resolve, reject) {
        setTimeout(function () {
            resolve('`second`');
        }, 3000);
    })
]).then(function (v) {
    console.log(v + ' wins')
}).catch(function(cause) {
    console.log('rejected ' + cause)
}).finally(function () {
    console.log('end')
});
*/

// Promise.race([
//     new Promise(function (resolve, reject) {
//         setTimeout(function () {
//             resolve('`first`');
//         }, 3000);
//     }),
//     new Promise(function (resolve, reject) {
//         setTimeout(function () {
//             resolve('`second`');
//         }, 50000);
//     })
// ]).then(function (v) {
//     console.log(v + ' wins')
// }).finally(function() {
//     console.log('end')
// });

/*
var p1 = Pro.reject('failing'),
    p2 = Pro.resolve('winner');

console.log(p1);
console.log(p2);
*/


const resolvingPromise = new Father((resolve, reject) => {
    resolve('promise resolved');
});
resolvingPromise.then((result) => {
    console.log(result)
});