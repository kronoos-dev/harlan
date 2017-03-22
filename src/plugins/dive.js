/* global harlan */

var uniqid = require("uniqid");
(function(controller) {
    bipbop.webserviceAddress = "http://localhost:9000/";
    require("./lib/dive/loader")(controller);
    require("./lib/dive/design")(controller);
    require("./lib/dive/smart-report")(controller);
    require("./lib/dive/welcome")(controller);
    require("./lib/dive/history")(controller);
    require("./lib/dive/delete")(controller);
    require("./lib/dive/plugin/init")(controller);
    require("./lib/dive/plugin/icheques")(controller);
})(harlan);
