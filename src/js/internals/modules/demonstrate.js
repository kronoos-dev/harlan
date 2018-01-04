module.exports = function (controller) {
    controller.registerBootstrap('demonstrate', function (callback) {
        callback();
        $('#demonstration').click(function () {
            controller.call('authentication::force', BIPBOP_FREE);
        });
    });
};