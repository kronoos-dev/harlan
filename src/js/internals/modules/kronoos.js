module.exports = controller => {

    if (controller.confs.kronoos.hosts.includes(document.location.hostname)) {
        controller.confs.kronoos.isKronoos = true;
        controller.registerBootstrap('kronoos::init::plataform', callback => {
            $.getScript('/js/kronoos.js', () => {
                callback();
            });
        });
    }

};
