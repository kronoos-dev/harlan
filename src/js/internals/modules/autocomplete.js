module.exports = function (controller) {

    var timeout = null;

    /**
     * Autocomplete
     * @param mixed jinput
     * @returns {module.exports.autocomplete}
     */
    var Autocomplete = function (input) {
        var inputContainer = $('<div />').addClass('autocomplete');
        /* Input Element First */

        input.replaceWith(inputContainer);
        inputContainer.append(input);

        input.attr('autocomplete', 'off');
        var options = $('<ul />');
        inputContainer.append(options);
        var position = null;

        input.keydown(function (e) {
            var code = e.keyCode || e.which;
            if (code === 27) {
                this.empty();
                return;
            }

            var items = options.find('li');

            if (!(code === 13 || code === 38 || code === 40))
                return;

            if (!items.length) {
                return;
            }

            if (e.which === 13) {
                if (position) {
                    /* Simulate a click (shame ;(* )*/
                    items.eq(position % items.length).removeClass('selected').click();
                }
                return;
            }

            if (position === null) {
                position = 0;
            } else {
                items.eq(position % items.length).removeClass('selected');
                position += (e.which === 38 ? -1 : +1);
            }

            items.eq(position % items.length).addClass('selected');

        });

        input.blur(function () {
            timeout = setTimeout(function () {
                options.removeClass('active');
            }, controller.confs.hideAutocomplete);
        }).focus(function () {
            if (timeout)
                clearTimeout(timeout);
            options.addClass('active');
        });

        this.setIcon = function (i) {
            input.after($('<i />').addClass('fa input-icon').addClass(i));
            return this;
        };

        this.input = function () {
            return input;
        };

        var addOption = function (prepend) {
            var item = $('<li />'),
                fnc  = prepend ? 'prepend' : 'append';
            options[fnc](item);
            return item;
        };

        this.empty = function () {
            position = null;
            options.empty();
        };

        this.item = function (title, subtitle, description, html, prepend) {
            var item = addOption(prepend);

            if (title)
                item.append($('<div />').text(title).addClass('item-title'));

            if (subtitle)
                item.append($('<div />').text(subtitle).addClass('item-subtitle'));

            if (description)
                item.append($('<div />').text(description).addClass('item-description'));

            if (html)
                item.append(html);

            return item;
        };

        return this;
    };

    /**
     * Autocomplete de um formulário
     */
    controller.registerCall('autocomplete', function (input) {
        return new Autocomplete(input);
    });

};
