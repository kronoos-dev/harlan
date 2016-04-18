/* global module, numeral */

var assert = require("assert"),
    _ = require("underscore"),
    camelCase = require('change-case').camelCase,
    async = require("async");

module.exports = (controller) => {

    var GenerateForm = function(callback) {

        var currentScreen = 0;
        var configuration = null;

        var next = () => {
            assert(configuration !== null, "configuration required");
            ++currentScreen;
            display();
            return this;
        };

        var back = () => {
            assert(configuration !== null, "configuration required");
            assert(currentScreen > 0, "no turning back tarãrãrã");
            --currentScreen;
            display();
            return this;
        };

        this.configure = (c) => {
            assert(typeof c === "object");
            assert(Array.isArray(c.screens));
            assert(c.screens.length > 0);
            configuration = c;
            currentScreen = 0;
            display();
            return this;
        };

        this.setValue = (name, value) => {
            name = camelCase(name);
            if (!configuration) {
                return;
            }

            _.each(configuration.screens, (v) => {
                _.each(_.flatten(v.fields), (field) => {
                    if (camelCase(field.name) === name) {
                        field.value = value;
                        if (field.element) {
                            field.element.val(v);
                        }
                    }
                });
            });

        };

        var createField = (item, form, screen) => {
            if (item.type === "checkbox") {
                var checkbox = form.addCheckbox(item.name, item.labelText, item.checked, item.value, item);
                item.element = checkbox[1];
                item.container = checkbox[0];
                item.elementLabel = checkbox[2].addClass("checkbox");
            } else if (item.type === "select") {
                item.element = form.addSelect(item.name, item.name, item.list, item, item.labelText, item.value);
            } else if (item.type === "textarea") {
                item.element = form.addTextarea(item.name, item.placeholder, item, item.labelText);
                if (configuration.magicLabel || screen.magicLabel || item.magicLabel) {
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

            item.element.change(() => {
                if (item.validateAsync)
                    item.validateAsync((isValid) => {
                        if (!isValid) {
                            item.element.addClass("error");
                        }
                    }, item, screen, configuration, this);

                if (item.validate && !item.validate(item, screen, configuration)) {
                    item.element.addClass("error");
                }

                if (!item.optional && /^\s*$/.test(item.element.val())) {
                    item.element.val("");
                    item.element.addClass("error");
                }

            });

            if (item.disabled) {
                item.element.attr("disabled", "disabled").addClass("uinput-disabled");
            }

            return this;
        };

        var getValue = (input, c) => {

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

        this.readValues = () => {
            return _.object(_.map(_.flatten(_.pluck(configuration.screens, 'fields')), (input) => {
                return [
                    camelCase(input.name),
                    getValue(input, configuration)
                ];
            }));
        };

        this.getField = (name) => {
            var items = _.flatten(_.pluck(configuration.screens, 'fields'));
            for (var i in items) {
                if (items[i].name == name) {
                    return items[i];
                }
            }
            return null;
        };

        this.display = (setScreen) => {
            if (typeof setScreen !== "undefined") {
                currentScreen = setScreen;
            }
            var modal = controller.call("modal");
            var screen = configuration.screens[currentScreen];

            var gamification = screen.gamification || configuration.gamification;
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

            form.element().submit((e) => {
                e.preventDefault();

                (screen.validate || this.defaultScreenValidation)((validInput) => {
                    if (!validInput) {
                        return;
                    }

                    modal.close();
                    if (currentScreen + 1 < configuration.screens.length) {
                        next();
                    } else {
                        callback(this.readValues());
                    }
                }, configuration, screen, this);

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

            form.addSubmit("next", screen.nextButton || (currentScreen + 1 < configuration.screens.length ?
                controller.i18n.system.next() : controller.i18n.system.finish()));

            var actions = modal.createActions();

            if (currentScreen - 1 >= 0) {
                actions.add(controller.i18n.system.back()).click((e) => {
                    e.preventDefault();
                    back();
                    modal.close();
                });
            }

            /* Cancelar */
            actions.add(controller.i18n.system.cancel()).click((e) => {
                e.preventDefault();
                modal.close();
            });

            return this;
        };

        var display = this.display;


        this.defaultScreenValidation = (callback, configuration, screen) => {
            var ret = true;
            async.each(_.flatten(screen.fields), (item, callback) => {

                if (item.validateAsync) {
                    var callbackEnveloped = callback;
                    callback = () => {
                        item.validateAsync((valid) => {
                            if (!valid) ret = false;
                            callbackEnveloped();
                        }, item, screen, configuration);
                    };
                }

                if (item.validate && !item.validate(item, screen, configuration)) {
                    item.element.addClass("error");
                    ret = false;
                    callback();
                    return;
                }

                if (!item.optional) {
                    if (item.element.attr("type") === "checkbox") {
                        if (!item.element.is(":checked")) {
                            $("label[for='" + item.element.attr("id") + "']").addClass("error");
                            ret = false;
                            callback();
                            return;
                        }
                    } else if (/^\s*$/.test(item.element.val())) {
                        item.element.addClass("error");
                        ret = false;
                        callback();
                        return;
                    }
                }

                callback();
            }, () => {
                callback(ret);
            });
        };

        return this;
    };


    controller.registerCall("form", (parameters) => {
        return new GenerateForm(parameters);
    });

};
