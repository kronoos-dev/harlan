/* global module */

var MoreResults = function(maxItems) {
    var footer = $("<footer />").addClass("load-more"),
        container = $("<div />").addClass("container"),
        content = $("<div />").addClass("content").text("Mais Resultados"),
        items = [],
        callit = null;

    footer.append(container.append(content)).hide();

    var close = function() {
        footer.remove();
    };

    var show = function(complete, i = 0) {
        var onComplete = (...p) => {
            if (complete) complete(...p);
            footer.show();
        };

        footer.hide();

        var item;
        for (; i < maxItems; i++) {

            item = items.shift();

            if (!item && callit) {
                callit((newItems) => {
                    if (!newItems || !newItems.length) {
                        close();
                        onComplete(i, items);
                        return;
                    }
                    items = newItems;
                    this.show(onComplete, i);
                });
                return this;
            }

            if (!item) {
                break;
            }

            item.insertBefore(footer);
        }

        if (!items.length && callit) {
            callit((newItems) => {
                if (!newItems || !newItems.length) {
                    close();
                } else {
                    items = newItems;
                    onComplete(i, items);
                }
            });
        } else {
            if (!items.length) close();
            onComplete(i, items);
        }

        return this;
    };


    footer.click((e) => {
        e.preventDefault();
        show();
    });

    this.show = show;

    this.callback = function(callback) {
        callit = callback;
        return this;
    };

    this.append = function(element) {
        items.push(element);
        return this;
    };

    this.appendTo = function(element) {
        footer.appendTo(element);
        return this;
    }

    this.element = function() {
        footer.show();
        return footer;
    };

    return this;
};

module.exports = function(controller) {
    controller.registerCall("moreResults", function(maxItems) {
        return new MoreResults(maxItems);
    });
};
