module.exports = controller => {

    if (controller.confs.dive.hosts.includes(document.location.hostname)) {
        controller.confs.dive.isDive = true;
        controller.registerBootstrap('dive::init::plataform', callback => {
            $.getScript('/js/dive.js', () => {
                callback();
            });
        });
    }

};
