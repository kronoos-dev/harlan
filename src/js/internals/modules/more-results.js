/* global module */

var MoreResults = function (maxItems) {
    var footer = $("<footer />").addClass("load-more"),
            container = $("<div />").addClass("container"),
            content = $("<div />").addClass("content").text("Mais Resultados"),
            items = [];

    footer.append(container.append(content));

    var close = function () {
        footer.remove();
    };

    var show = function () {
        var item;
        for (var i = 0; i < maxItems; i++) {
            item = items.shift();
            if (typeof item === "undefined") {
                close();
                return;
            }
            item.insertBefore(footer);
        }
    };
    

    footer.click(show);

    this.show = show;
    
    this.append = function (element) {
        items.push(element);
        return this;
    };


    this.element = function () {
        return footer;
    };

    return this;
};

module.exports = function (controller) {
    controller.registerCall("moreResults", function (maxItems) {
        return new MoreResults(maxItems);
    });
};