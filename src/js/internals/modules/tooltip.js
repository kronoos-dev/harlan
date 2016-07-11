module.exports = (controller) => {

    controller.registerCall("tooltip", (actions, content) => {
        var element = $("<li />"),
            id = (new Date().getTime()).toString(16);

        element.attr("id", id);
        actions.prepend(element);

        var materialTip = $('<div />')
            .addClass('mdl-tooltip')
            .attr("for", id)
            .text(content);

        materialTip.insertAfter(element);
        componentHandler.upgradeElement(materialTip.get(0), "MaterialTooltip");

        return element;
    });

};
