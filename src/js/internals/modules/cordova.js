module.exports = function (controller) {

    controller.registerBootstrap("cordova", function (callback) {
        if (!controller.confs.isCordova && !window.cordova) {
             callback();
        } else {
            document.addEventListener("deviceready", () => {
                callback();
            }, false);
        }
    });

    controller.registerTrigger("bootstrap::end", "splashscreen", function (arg, callback) {
        if (controller.confs.isCordova && navigator.splashscreen)
            navigator.splashscreen.hide();
        callback();
    });


};
