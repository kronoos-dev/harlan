/* global module, navigator, console */

module.exports = function (controller) {

    controller.registerBootstrap("manifest", function (callback) {
        callback();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js', {scope: './'}).then(function () {
                console.log('ServiceWorker Running');
            }).catch(function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        }
    });

};
