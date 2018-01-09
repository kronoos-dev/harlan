module.exports = controller => {

    if (controller.confs.icheques.hosts.includes(document.location.hostname)) {
        controller.registerBootstrap('icheques::init::plataform', callback => {
            controller.confs.disableDive = true;
            $.getScript('/js/icheques.js', () => {

                if (navigator.userAgent.match(/iPad/i) !== null) {
                    callback();
                    return;
                }

                controller.registerTrigger('serverCommunication::websocket::authentication::end', 'canUseKronoos', (args, callback) => {
                    callback();
                    if (!/federal\s*invest/i.test(controller.confs.user.commercialReference)) {
                        $.getScript('/js/kronoos.js', () => setTimeout(() => controller.trigger('kronoos::init', args), 1000));
                    }
                });

                callback();
            });
        });
    }

};
