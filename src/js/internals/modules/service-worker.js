module.exports = controller => {

    controller.registerBootstrap('manifest', callback => {
        callback();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js', {scope: './'}).then(() => {
            }).catch(err => {
                // registration failed :(
            });
        }
    });

};
