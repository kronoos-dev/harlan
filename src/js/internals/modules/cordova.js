module.exports = function (controller) {

    controller.registerBootstrap("cordova", function (callback) {
        if (!controller.confs.isCordova) {
             callback();
        } else {
            document.addEventListener("deviceready", () => {
                callback();
            }, false);
        }
    });

    controller.registerTrigger("bootstrap::end", "splashscreen", function (arg, callback) {
        if (controller.confs.isCordova)
            navigator.splashscreen.hide();
        callback();
    });


};
