module.exports = function (controller) {
    controller.registerBootstrap("proshield::init", function (callback) {
        $.getScript("js/proshield.js", function () {
            callback();
        });
    });
}; 