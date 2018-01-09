export default controller => {

    if (controller.confs.jane.hosts.includes(document.location.hostname)) {
        controller.registerBootstrap('icheques::init::plataform', callback => {
            $.getScript('js/jane.js', () => {
                callback();
            });
        });
    }

};
