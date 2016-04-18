import { BANFactory } from "./ban-factory.js";

module.exports = function() {

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::contract::websocket::authentication",
        function(company, callback) {
            callback();
            controller.registerCall("icheques::ban::generate", function(results) {
                var file = new BANFactory(results, company).generate();
                controller.call("download", file);
            });
        });

};
