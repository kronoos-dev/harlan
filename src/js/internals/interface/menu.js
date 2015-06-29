/* global module */


var menu = function () {

    this.add = function (title, icon) {
        var elementIcon = $("<i />").addClass("fa fa-" + icon);
        var elementLink = $("<a />").attr({
            title: title,
            href: "#"
        });
        var elementItem = $("<li />");

        elementItem.append(elementLink.append(elementIcon));

        $(".module-menu").append(elementItem);

        return {
            nodeLink: elementLink,
            nodeItem: elementItem
        };
    };

    return this;
};

module.exports = new menu();