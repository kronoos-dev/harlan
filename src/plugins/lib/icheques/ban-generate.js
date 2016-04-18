import { BANFactory } from "./ban-factory.js";

module.exports = function(controller) {

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::ban::register",
        function(company, callback) {
            callback();
            controller.registerCall("icheques::ban::generate", function(results) {
                var file = new BANFactory(results, company).generate();
                controller.call("download", file);
            });
        });

};
