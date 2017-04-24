/* global module */

module.exports = function (controller) {

    controller.registerCall("authentication::logout", function () {
        delete localStorage.sessionId;
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(null);
        }
        window.location = "https://www.icheques.com.br/";
    });

};
