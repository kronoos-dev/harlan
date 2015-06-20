module.exports = function (controller) {
    controller.registerBootstrap("demonstrate", function () {
        $("#demonstration").click(function () {
            controller.call("authentication::force", BIPBOP_FREE);
        });
    });
};