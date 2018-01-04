module.exports = function (controller) {

    if (controller.confs.jane.hosts.indexOf(document.location.hostname) >= 0) {
        controller.registerBootstrap('icheques::init::plataform', function (callback) {
            $.getScript('js/jane.js', function () {
                callback();
            });
        });
    }

};
