import 'babel-polyfill';
import 'es6-shim';

(function(d) {
    var Harlan = require("./internals/controller");
    d.harlan = new Harlan();
    d.harlan.run();
})(window);
