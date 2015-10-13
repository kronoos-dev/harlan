var Harlan = require("./internals/controller");
window.harlan = new Harlan();
require('domready')(function() {
    window.harlan.run();
});