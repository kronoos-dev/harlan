module.exports = function (controller) {

    if (controller.confs.kronoos.hosts.indexOf(document.location.hostname) >= 0) {
        controller.registerBootstrap("kronoos::init::plataform", function (callback) {
            $.getScript(controller.confs.kronoos.endpoint, function () {
                callback();
            });
        });
    }

};
