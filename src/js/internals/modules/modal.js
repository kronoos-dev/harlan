/**
 * Inicializa um modal
 */
module.exports = function (controller) {

    var modal = function () {

        var modal = $("<div />");
        var modalContainer = $("<div />").addClass("modal")
                .append($("<div />").append($("<div />").append(modal)));
        
        $("body").append(modalContainer);

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

        var createForm = function () {

            var form = $("<form />");
            modal.append(form);

            var createList = function () {
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

                this.element = function () {
                    return list;
                };

                return this;
            };

            this.createList = function () {
                return new createList();
            };

            this.addInput = function (name, type, placeholder) {
                var input = $("<input />").attr({
                    name: name,
                    type: type,
                    placeholder: placeholder
                });

                form.append(input);
                return input;
            };

            this.addCheckbox = function (name, label, checked, value) {
                var elementId = uniqid();

                var checkbox = $("<input />").attr({
                    type: "checkbox",
                    checked: checked,
                    value: (typeof value === "undefined" ? "1" : value),
                    id: elementId
                });

                var div = $("<div />")
                        .addClass("checkbox")
                        .append(checkbox)
                        .append($("<label/>").attr("for", elementId).text(label));

                form.append(div);
                return [div, checkbox];
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
            return new createForm();
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
        return new modal();
    });

};