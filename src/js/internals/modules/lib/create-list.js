/* global module */
var _ = require("underscore");

module.exports = function(element) {

    var list = $("<ul />").addClass("list");
    var container = $("<div />").addClass("list-container").append(list);
    element.append(container);

    var elementCellCounter = (element) => {
        return $(element).children().length;
    };

    var cellCounter = () => {
        return _.max(_.map(list.children("li"), elementCellCounter));
    };

    var tableAjustment = () => {
        var numChilds = cellCounter();
        list.children("li").each((i, element) => {
            element = $(element);
            for (var i = 0; i < numChilds - elementCellCounter(element); i++) {
                element.append("<div />");
            }
        });
    };

    this.empty = () => {
        list.empty();
        return this;
    };

    this.item = (icon, text) => {
        var item = $("<li />");
        list.append(item);
        if (icon instanceof Array) {
            for (let idx in icon) {
                item.append($("<i />").addClass("fa " + icon[idx]));
            }
        } else {
            item.append($("<i />").addClass("fa " + icon));
        }
        if (text instanceof Array) {
            for (let idx in text) {
                item.append($("<div />").text(text[idx]));
            }
        } else {
            item.append($("<div />").text(text));
        }

        tableAjustment();
        return item;
    };

    this.add = this.item;

    this.element = function() {
        return list;
    };

    return this;
};
