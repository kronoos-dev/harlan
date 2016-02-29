/* global module */

module.exports = function (controller) {

    controller.registerTrigger("authentication::logout::end", "icheques::authentication::logout::end", function (param, cb) {
        window.location = "https://www.icheques.com.br/";
    });
    
};