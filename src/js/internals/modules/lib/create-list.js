/* global module */
import _ from 'underscore';

export default function(element) {

    const list = $('<ul />').addClass('list');
    const container = $('<div />').addClass('list-container').append(list);
    element.append(container);

    const elementCellCounter = element => {
        return $(element).children().length;
    };

    const cellCounter = () => {
        return _.max(_.map(list.children('li'), elementCellCounter));
    };

    const tableAjustment = () => {
        const numChilds = cellCounter();
        list.children('li').each((i, element) => {
            element = $(element);
            for (let it = 0; it < numChilds - elementCellCounter(element); it++) {
                element.append('<div />');
            }
        });
    };

    this.empty = () => {
        list.empty();
        return this;
    };

    this.item = (icon, text) => {
        const item = $('<li />');
        list.append(item);
        if (icon instanceof Array) {
            for (let idx in icon) {
                item.append($('<i />').addClass(`fa ${icon[idx]}`));
            }
        } else {
            item.append($('<i />').addClass(`fa ${icon}`));
        }
        if (text instanceof Array) {
            for (let idx in text) {
                item.append($('<div />').text(text[idx]));
            }
        } else {
            item.append($('<div />').text(text));
        }

        tableAjustment();
        return item;
    };

    this.add = this.item;

    this.element = () => list;

    return this;
};
