/* global module */

module.exports = function (element) {
    
    var list = $("<ul />").addClass("list");
    element.append(list);
    
    this.item = function (icon, text) {
        var item = $("<li />");
        list.append(item);
        item.append($("<i />").addClass("fa " + icon));
        if (text instanceof Array) {
            for (var idx in text) {
                item.append($("<div />").text(text[idx]));
            }
        } else {
            item.append($("<div />").text(text));
        }
        return item;
    };

    this.add = this.item;

    this.element = function () {
        return list;
    };

    return this;
};
