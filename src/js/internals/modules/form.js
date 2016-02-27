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
            console.log(this);
            display.call(this);
            return this;
        };

        var back = function () {
            assert(configuration !== null, "configuration required");
            assert(currentScreen > 0, "no turning back tarãrãrã");
            --currentScreen;
            console.log(this);
            display.call(this);
            return this;
        };

        this.configure = function (c) {
            assert(typeof c === "object");
            assert(Array.isArray(c.screens));
            assert(c.screens.length > 0);
            configuration = c;
            currentScreen = 0;
            display.call(this);
            return this;
        };

        this.setValue = function (name, value) {
            name = camelCase(name);
            if (!configuration) {
                return;
            }

            _.each(configuration.screens, function (v) {
                _.each(_.flatten(v.fields), function (field) {
                    if (camelCase(field.name) === name) {
                        field.value = value;
                    }
                });
            });

        };

        var createField = function (item, form, screen) {
            if (item.type === "checkbox") {
                var checkbox = form.addCheckbox(item.name, item.labelText, item.checked, item.value, item);
                item.element = checkbox[1];
                item.container = checkbox[0];
                item.elementLabel = checkbox[2].addClass("checkbox");
            } else if (item.type === "select") {
                item.element = form.addSelect(item.name, item.name, item.list, item, item.labelText, item.value);
            } else if (item.type === "textarea") {
                item.element = form.addTextarea(item.name, item.placeholder, item, item.labelText);

                if (screen.magicLabel || item.magicLabel) {
                    item.element.magicLabel(item.label);
                }
            } else {
                item.element = form.addInput(item.name, item.type, item.placeholder, item, item.labelText, item.value);

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

                if (item.validate && !item.validate(item, screen, configuration)) {
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

            if (!input.element) {
                return null; /* not defined */
            }

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
                    var moment = moment(input.element.val(), controller.i18n.pikaday.format);
                    if (!moment.isValid) {
                        return null;
                    }
                    return moment.format("YYYY-MM-DD");
                }
            }

            return input.element.val();
        };

        this.readValues = function () {
            return _.object(_.map(_.flatten(_.pluck(configuration.screens, 'fields')), function (input) {
                return [
                    camelCase(input.name),
                    getValue(input, configuration)
                ];
            }));
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
                (screen.validate || this.defaultScreenValidation)(function (validInput) {
                    if (!validInput) {
                        return;
                    }

                    modal.close();
                    if (currentScreen + 1 < configuration.screens.length) {
                        next.call(this);
                    } else {
                        callback(this.readValues());
                    }
                }.bind(this), configuration, configuration.screens[currentScreen], this);
            }.bind(this));

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
                    back.call(this);
                    modal.close();
                }.bind(this));
            }

            /* Cancelar */
            actions.add(controller.i18n.system.cancel()).click(function (e) {
                e.preventDefault();
                modal.close();
            });

            return this;
        };

        this.defaultScreenValidation = function (callback, configuration, screen) {
            var ret = true,
                    validateItem = function (item) {
                        if (Array.isArray(item)) {
                            _.each(item, validateItem);
                            return;
                        }

                        if (item.validate && !item.validate(item, screen, configuration)) {
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

            callback(ret);
        };

        return this;
    };


    controller.registerCall("form", function (parameters) {
        return new GenerateForm(parameters);
    });

};