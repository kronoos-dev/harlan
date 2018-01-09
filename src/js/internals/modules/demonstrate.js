module.exports = controller => {
    controller.registerBootstrap('demonstrate', callback => {
        callback();
        $('#demonstration').click(() => {
            controller.call('authentication::force', BIPBOP_FREE);
        });
    });
};