/* global module */

var uniqid = require('uniqid');

var GAMIFICATION_IMAGE = "images/gamification.png";
new Image().src = GAMIFICATION_IMAGE; /* Preload Image */

var gamificationIcons = require("./data/gamification-icons");

/**
 * Inicializa um modal
 */
module.exports = function (controller) {

    var Modal = function () {
        var modal = $("<div />");
        var modalContainer = $("<div />").addClass("modal")
                .append($("<div />").append($("<div />").append(modal)));

        $("body").append(modalContainer);

        this.gamification = function (type) {
            var image = $("<div />")
                    .addClass("gamification").addClass(gamificationIcons[type]);
            modal.append(image);
            return image;
        };

        this.title = function (content) {
            var h2 = $("<h2 />").text(content);
            modal.append(h2);
            return h2;
        };

        this.subtitle = function (content) {
            var h3 = $("<h3 />").text(content);
            modal.append(h3);
            return h3;
        };

        this.addParagraph = function (content) {
            var p = $("<p />").text(content);
            modal.append(p);
            return p;
        };


        this.imageParagraph = function (image, content, imageTitle, imageAlternative) {
            var wizard = $("<div />").addClass("wizard")
                    .append($("<div />").addClass("item")
                            .append($("<div />").addClass("icon").append($("<img />").attr({
                                title: imageTitle,
                                alt: imageAlternative,
                                src: image
                            }))).append($("<p />").text(content)));

            modal.append(wizard);
            return wizard;
        };

        var createActions = function (instance) {
            var actions = $("<ul />").addClass("actions");
            modal.append(actions);
            this.add = function (name) {
                var link = $("<a />").attr("href", "#").text(name),
                        item = $("<li> /").append(link);
                actions.append(item);
                return item;
            };

            return this;
        };

        this.createActions = function () {
            return new createActions(this);
        };

        var createForm = function (instance) {

            var form = $("<form />");
            modal.append(form);

            var createLabel = function (input, obj, labelText, placeholder) {
                if (!obj) {
                    obj = {};
                }

                if (obj) {
                    input.addClass("has-label").attr('id', (obj.id = uniqid()));
                    obj.label = $("<label />")
                            .addClass("input-label")
                            .attr({'for': obj.id})
                            .html(labelText || placeholder);

                    if (obj.class) {
                        obj.label.addClass(obj.class);
                        input.addClass(obj.class);
                    }

                    var label = obj.append || form;
                    input[obj.labelPosition || "after"](obj.label);
                }
            };

            var createList = function (formInstance, modalInstance) {
                var list = $("<ul />").addClass("list");
                form.append(list);
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

            this.multiField = function () {
                var div = $("<div />").addClass("multi-field");
                form.append(div);
                return div;
            };

            this.addSelect = function (id, name, list, obj, labelText) {
                var select = $("<select />").attr({
                    id: id,
                    name: name
                });

                for (var i in list) {
                    list[i] = select.append($("<option />").attr({
                        value: i
                    }).text(list[i]));
                }

                form.append(select);
                createLabel(select, obj, labelText);

                return select;
            };

            this.createList = function () {
                return new createList(this, instance);
            };

            this.addTextarea = function (name, placeholder, obj, labelText, value) {
                var id;

                obj = obj || {};

                var input = $("<textarea />").attr({
                    name: name,
                    placeholder: placeholder,
                    autocomplete: false,
                    autocapitalize: false
                }).text(value);

                var a = obj.append || form;
                a.append(input);
                createLabel(input, obj, labelText, placeholder);

                return input;
            };

            this.addInput = function (name, type, placeholder, obj, labelText, value) {
                var id;

                obj = obj || {};

                var input = $("<input />").attr({
                    name: name,
                    type: type,
                    placeholder: placeholder,
                    autocomplete: false,
                    autocapitalize: false,
                    value: value
                });

                var a = obj.append || form;
                a.append(input);
                createLabel(input, obj, labelText, placeholder);

                return input;
            };

            this.cancelButton = function (text, onCancel) {
                return this.addSubmit("cancel", text || controller.i18n.system.cancel()).click(function (e) {
                    if (onCancel) {
                        onCancel();
                    } else {
                        instance.close();
                    }
                    e.preventDefault();
                });
            };

            this.addCheckbox = function (name, label, checked, value, item) {
                var elementId = uniqid();
                item = item || {};

                var checkbox = $("<input />").attr({
                    type: "checkbox",
                    checked: checked,
                    value: (typeof value === "undefined" ? "1" : value),
                    id: elementId
                });

                var lblItem;
                var div = $("<div />")
                        .addClass("checkbox")
                        .append(checkbox)
                        .append(lblItem = $("<label/>").attr("for", elementId).html(label));

                (item.append || form).append(div);
                return [div, checkbox, lblItem];
            };

            this.addSubmit = function (name, value) {
                var submit = $("<input />").attr({
                    type: "submit",
                    value: value,
                    name: name
                }).addClass("button");

                form.append(submit);
                return submit;
            };

            this.element = function () {
                return form;
            };

            return this;
        };
        this.createForm = function () {
            return new createForm(this);
        };

        this.element = function () {
            return modal;
        };

        this.modal = function () {
            return modalContainer;
        };

        this.close = function () {
            modalContainer.remove();
        };

        return this;
    };

    controller.registerCall("modal", function () {
        return new Modal();
    });

};