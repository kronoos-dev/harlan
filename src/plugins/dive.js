/* global harlan */

var uniqid = require("uniqid");

(function(controller) {

    require("./lib/dive/loader")(controller);
    require("./lib/dive/design")(controller);
    require("./lib/dive/smart-report")(controller);
    require("./lib/dive/welcome")(controller);

})(harlan);
