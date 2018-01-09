/* global module, navigator, console */

module.exports = controller => {

    controller.registerBootstrap('manifest', callback => {
        callback();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js', {scope: './'}).then(() => {
                console.log('ServiceWorker Running');
            }).catch(err => {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        }
    });

};
