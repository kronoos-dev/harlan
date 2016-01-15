module.exports = function (controller) {

    controller.registerBootstrap("serviceWorker", function (callback) {
        callback();

        if (!'serviceWorker' in navigator) {
            return;
        }

        navigator.serviceWorker.register('/js/sw.js').then(function (registration) {
            controller.trigger("serviceWorker::registration", registration);
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });

    });

};