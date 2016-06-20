import 'babel-polyfill';
import 'es6-shim';
import 'dom4';

(function(d) {
    var Harlan = require("./internals/controller");
    d.harlan = new Harlan();
    d.harlan.run();
})(window);
