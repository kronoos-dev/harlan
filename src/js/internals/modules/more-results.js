/*jshint -W083 */
/* global module */

var MoreResults = function (maxItems) {

    var footer = $('<footer />').addClass('load-more'),
        container = $('<div />').addClass('container'),
        content = $('<div />').addClass('content').text('Mais Resultados'),
        items = [],
        callit = null;

    footer.append(container.append(content)).hide();

    this.close = () =>  {
        footer.remove();
    };

    footer.click(e => {
        e.preventDefault();
        this.show();
    });

    this.show = (complete, i = 0) => {
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
                        this.close();
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
                    this.close();
                } else {
                    items = newItems;
                    onComplete(i, items);
                }
            });
        } else {
            if (!items.length) this.close();
            onComplete(i, items);
        }

        return this;
    };

    this.callback = callback =>  {
        callit = callback;
        return this;
    };

    this.append = element =>  {
        items.push(element);
        return this;
    };

    this.appendTo = element =>  {
        footer.appendTo(element);
        return this;
    };

    this.element = () =>  {
        return footer;
    };

    return this;
};

module.exports = controller => {
    controller.registerCall('moreResults', (maxItems) =>  {
        return new MoreResults(maxItems);
    });
};
