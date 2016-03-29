/* global module */

module.exports = function (controller) {

    controller.registerCall("authentication::logout", function () {
        delete localStorage.sessionId;
        window.location = "https://www.icheques.com.br/";
    });
    
};