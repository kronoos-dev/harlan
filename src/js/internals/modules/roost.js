/* global module */

var sprintf = require("sprintf");

module.exports = function (controller) {

    window._roostjs = [
        ['onload', function (data) {
                controller.trigger("push::ability", data.promptable);
            }],
        ['onresult', function (data) {
                controller.trigger("push::result", data);
            }]];

    controller.registerBootstrap("push", function (callback) {
        callback();
        $.getScript(sprintf("https://cdn.goroost.com/roostjs/%s", controller.confs.roost.apiKey));
    });


};