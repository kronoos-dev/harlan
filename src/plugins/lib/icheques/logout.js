/* global module */

module.exports = function (controller) {

    controller.registerCall('authentication::logout', function () {
        delete sessionStorage.apiKey;

        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(null);
        }
        if (controller.confs.isCordova) {
            controller.call('authentication::unsetSessionId', () => {
                controller.trigger('authentication::logout::end');
                if (navigator.serviceWorker && navigator.serviceWorker.controller)
                    navigator.serviceWorker.controller.postMessage(null);
                location.reload(true); /* prevent information leak */
            });
        } else {
            window.location = 'https://www.icheques.com.br/';
        }
    });

};
