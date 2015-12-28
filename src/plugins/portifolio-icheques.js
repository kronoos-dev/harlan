var sql = require('sql.js');

(function (controller) {

    controller.registerCall("icheques::init", function () {
        controller.interface.addCSSDocument("css/icheques.min.css");
    });

    controller.registerTrigger("authentication::authenticated", "icheques::portofolio", function (val, callback) {
        callback();
        controller.call("portofolioManager::init");
    });

    controller.call("icheques::init");

})(harlan);