/* global module, numeral */

var assert = require("assert"),
        _ = require("underscore"),
        camelCase = require('change-case').camelCase;

module.exports = function (controller) {

    var GenerateForm = function (callback) {

        var currentScreen = 0;
        var configuration = null;

        var next = function () {
            assert(configuration !== null, "configuration required");
            ++currentScreen;
            display();
            return this;
        };

        var back = function () {
            assert(configuration !== null, "configuration required");
            assert(currentScreen > 0, "no turning back tarãrãrã");
            --currentScreen;
            display();
            return this;
        };

        this.configure = function (c) {
            assert(typeof c === "object");
            assert(Array.isArray(c.screens));
            assert(c.screens.length > 0);
            configuration = c;
            currentScreen = 0;
            display();
            return this;
        };

        var defaultScreenValidation = function () {
            var ret = true, screen = configuration.screens[currentScreen];

            var validateItem = function (item) {
                if (Array.isArray(item)) {
                    _.each(item, validateItem);
                    return;
                }

                if (item.validate && !item.validate(item, screen, configure)) {
                    item.element.addClass("error");
                    ret = false;
                    return;
                }
                if (!item.optional && /^\s*$/.test(item.element.val())) {
                    item.element.addClass("error");
                    ret = false;
                    return;
                }
            };

            _.each(screen.fields, validateItem);

            return ret;
        };

        var createField = function (item, form, screen) {
            if (item.type === "checkbox") {
                var checkbox = form.addCheckbox(item.name, item.labelText, item.checked, item.value, item);
                item.element = checkbox[1];
                item.container = checkbox[0];
                item.elementLabel = checkbox[2].addClass("checkbox");
            } else if (item.type === "select") {
                item.element = form.addSelect(item.name, item.name, item.list, item, item.labelText);
            } else {
                item.element = form.addInput(item.name, item.type, item.placeholder, item, item.labelText);

                if (screen.magicLabel || item.magicLabel) {
                    item.element.magicLabel(item.label);
                }

                if (item.mask) {
                    item.element.mask(item.mask, item.maskOptions);
                }

                if (item.pikaday) {
                    item.element.pikaday();
                }

            }

            item.element.change(function () {

                if (item.validate && !item.validate(item, screen, configure)) {
                    item.element.addClass("error");
                }

                if (!item.optional && /^\s*$/.test(item.element.val())) {
                    item.element.val("");
                    item.element.addClass("error");
                }

            });

            return this;
        };

        var getValue = function (input, c) {

            if (input.getValue) {
                return input.getValue(input, c);
            }

            if (input.element.attr("type") === "checkbox") {
                return input.element.get(0).checked;
            }

            if (input.element.attr("type") === "text") {
                if (input.numeral) {
                    return numeral().unformat(input.element.val());
                }
                if (input.pikaday) {
                    var moment = input.element.get(0).getMoment();
                    if (!moment.isValid) {
                        return null;
                    }
                    return moment.format("YYYY-MM-DD");
                }
            }

            return input.element.val();
        };

        var display = function () {
            var modal = controller.call("modal");
            var screen = configuration.screens[currentScreen];

            var gamification = modal.gamification || configuration.gamification;
            if (gamification) {
                modal.gamification(gamification);
            }

            modal.title(screen.title || configuration.title);
            modal.subtitle(screen.subtitle || configuration.subtitle);

            var paragraph = screen.paragraph || configuration.paragraph;
            if (paragraph) {
                modal.addParagraph(paragraph);
            }

            var form = modal.createForm();

            form.element().submit(function (e) {
                e.preventDefault();

                if (screen.validate && !screen.validate()) {
                    return;
                }

                modal.close();
                if (currentScreen + 1 < configuration.screens.length) {
                    next();
                } else {
                    callback(_.object(_.map(_.flatten(_.pluck(configuration.screens, 'fields')), function (input) {
                        return [
                            camelCase(input.name),
                            getValue(input, configuration)
                        ];
                    })));
                }
            });

            for (var i in screen.fields) {
                var field = screen.fields[i];
                if (Array.isArray(field)) {
                    var multifield = form.multiField();
                    for (var n in field) {
                        field[n].append = multifield;
                        field[n].labelPosition = "before";
                        createField(field[n], form, screen);
                    }
                } else {
                    createField(field, form, screen);
                }
            }

            form.addSubmit("next", currentScreen + 1 < configuration.screens.length ?
                    controller.i18n.system.next() : controller.i18n.system.finish());

            var actions = modal.createActions();

            if (currentScreen - 1 >= 0) {
                actions.add(controller.i18n.system.back()).click(function (e) {
                    e.preventDefault();
                    back();
                    modal.close();
                });
            }

            /* Cancelar */
            actions.add(controller.i18n.system.cancel()).click(function (e) {
                e.preventDefault();
                modal.close();
            });

            return this;
        };

        this.defaultScreenValidation = defaultScreenValidation;

        return this;
    };


    controller.registerCall("form", function (parameters) {
        return new GenerateForm(parameters);
    });

};