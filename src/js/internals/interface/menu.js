var Menu = function () {

    this.add = function (title, icon) {
        var elementId = "action-" + title;
        var elementIcon = $("<i />").addClass("fa fa-" + icon);
        var elementLink = $("<a />").attr({
            href: "#",
            id: elementId
        });

        var elementItem = $("<li />");
        var elementTooltip = $("<div />").attr({
            class: "mdl-tooltip",
            "for": elementId
        }).text(title);

        elementItem
                .append(elementLink.append(elementIcon))
                .append(elementTooltip);

        $(".module-menu").append(elementItem);

        componentHandler.upgradeElement(elementTooltip.get(0), "MaterialTooltip");
        
        return {
            nodeLink: elementLink,
            nodeItem: elementItem,
            nodeTooltip: elementTooltip
        };
    };

    return this;
};

module.exports = new Menu();
