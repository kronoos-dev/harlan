import CreateList from './create-list';

module.exports = function(instance, {confs, i18n}) {

    const form = $('<form />');
    instance.element().append(form);

    const createLabel = (input, obj = {}, labelText, placeholder) => {
        input.addClass('has-label').attr('id', (obj.id = require('node-uuid').v4()));

        if (obj.hoverHelp) {
            labelText += ' <a href="#" class=\'help\'>(Ajuda)</a>';
        }

        obj.label = $('<label />')
            .addClass('input-label')
            .attr({
                for: obj.id,
                title: obj.hoverHelp
            })
            .html(labelText || placeholder);

        if (obj.class) {
            obj.label.addClass(obj.class);
            input.addClass(obj.class);
        }

        if (confs.isPhone) {
            /* no multi field */
            obj.labelPosition = confs.phoneLabelPosition || 'after';
        }

        input[obj.labelPosition || 'after'](obj.label);
        input.parent().trigger('new-label');
    };

    this.multiField = () => {
        if (confs.isPhone) {
            return form;
        }

        let div = $('<div />').addClass('multi-field');
        div.on('new-label', () => {
            let items = $('.input-label', div);
            for (let i = 0; i < items.length; i++) {
                let item = items.eq(i);
                item.css('left', `${i * (100 / items.length)}%`);
            }
        });
        form.append(div);
        return div;
    };

    this.addSelect = (id, name, list, obj = {}, labelText, value) => {
        const select = $('<select />').attr({
            id,
            name,
            title: obj.hoverHelp
        });

        obj.options = {};
        for (const i in list) {
            obj.options[i] = select.append($('<option />').attr({
                value: i
            }).text(list[i]));
        }

        if (value) {
            select.val(value);
        }

        (obj.append || form).append(select);
        createLabel(select, obj, labelText);

        return select;
    };

    this.createList = () => new CreateList(form);

    this.addTextarea = (name, placeholder, obj = {}, labelText, value) => {
        const input = $('<textarea />').attr({
            name,
            placeholder,
            autocomplete: false,
            autocapitalize: false,
            title: obj.hoverHelp
        }).text(value);

        (obj.append || form).append(input);
        createLabel(input, obj, labelText, placeholder);

        return input;
    };

    this.addInput = (name, type, placeholder, obj = {}, labelText, value) => {
        const input = $('<input />').attr({
            name,
            type,
            placeholder,
            autocomplete: false,
            autocapitalize: false,
            value,
            title: obj.hoverHelp
        });

        (obj.append || form).append(input);
        if (labelText !== false) {
            createLabel(input, obj, labelText, placeholder);
        }

        return input;
    };

    this.cancelButton = function(text, onCancel) {
        return this.addSubmit('cancel', text || i18n.system.cancel()).click(e => {
            e.preventDefault();
            if (onCancel) {
                onCancel();
            } else {
                instance.close();
            }
        });
    };

    this.addCheckbox = (name, label, checked, value, item) => {
        const elementId = require('node-uuid').v4();
        item = item || {};

        const checkbox = $('<input />').attr({
            type: 'checkbox',
            checked,
            value: (typeof value === 'undefined' ? '1' : value),
            id: elementId,
            title: item.hoverHelp
        });

        let lblItem;
        const div = $('<div />')
            .addClass('checkbox')
            .append(checkbox)
            .append(lblItem = $('<label/>').attr('for', elementId).html(label));

        (item.append || form).append(div);
        return [div, checkbox, lblItem];
    };

    this.addSubmit = (name, value) => {
        const submit = $('<input />').attr({
            type: 'submit',
            value,
            name
        }).addClass('button');

        form.append(submit);
        return submit;
    };

    this.element = () => form;

    return this;
};
