module.exports = controller => {

    controller.registerBootstrap('cordova', callback => {
        if (!controller.confs.isCordova) {
            callback();
        } else {
            document.addEventListener('deviceready', () => {
                callback();
            }, false);
        }
    });

    controller.registerTrigger('bootstrap::end', 'splashscreen', (arg, callback) => {
        if (controller.confs.isCordova && navigator.splashscreen)
            navigator.splashscreen.hide();
        callback();
    });

};
