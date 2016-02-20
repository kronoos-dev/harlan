module.exports = function (controller) {

    if (controller.confs.dive.hosts.indexOf(document.location.hostname) >= 0) {
        controller.registerBootstrap("dive::init::plataform", function (callback) {
            $.getScript("http://dive:3000/index.js", function () {
                callback();
            });
        });
    }

};