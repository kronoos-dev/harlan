/* The tests are decoupled to minimize file
 *  size delivered to the customer. */

mocha.setup('bdd');
window.harlan = require("../internals/controller")();

require('domready')(function () {
    require("./controller")();
    require("./config")();

    if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
    } else {
        mocha.run();
    }
});
