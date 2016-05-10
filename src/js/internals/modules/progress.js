/* global module */

var sprintf = require("sprintf");

module.exports = function (controller) {

    /**
     * Atualiza a barra de progresso
     */
    controller.registerCall("progress::update", function (inst, progress) {
        progress = Math.abs(progress) * 100;
        var percProgress = sprintf("%d%%", progress > 100 ? 100 : (Number.isNaN(progress) ? 0 : progress));
        inst.progressText.text(percProgress);
        inst.progressBar.css("width", percProgress);
        return inst;
    });

    /**
     * Desenvolve uma barra de progresso
     */
    controller.registerCall("progress::init", function (initProgress) {
        var content = {
            element: $("<div />").addClass("app-progress"),
            progressBar: $("<div />").addClass("perc"),
            progressText: $("<span />").addClass("progress")
        };

        content.element
                .append(content.progressBar)
                .append(content.progressText);

        controller.call("progress::update", content, initProgress || 0);

        return content;
    });

};
