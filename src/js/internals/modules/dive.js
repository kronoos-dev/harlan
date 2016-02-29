module.exports = function (controller) {

    if (controller.confs.dive.hosts.indexOf(document.location.hostname) >= 0) {
        controller.registerBootstrap("dive::init::plataform", function (callback) {
            $.getScript("https://dive.harlan.com.br/index.js", function () {
                callback();
            });
        });
    }

};
