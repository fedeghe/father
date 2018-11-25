(function (root, factory) {
    /* istanbul ignore next */
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        
        root.Balle = factory();
    }
}(this, function () {
    
    $$balle.js$$

    return Balle
}));
