var assert = require("assert");

module.exports = function (controller) {

    var generateResult = function (inputContainer, inputContent, inputResult) {
        var container = inputContainer || $("<div />").addClass("container");
        var content = inputContent || $("<div />").addClass("content");
        var result = inputResult || $("<div />").addClass("result");

        if (!inputResult)
            result.append(container.append(content));

        this.addSeparator = function (title, subtitle, description, items) {
            items = items || {};
            items.container = $("<div />").addClass("container");
            items.content = $("<div />").addClass("content");
            items.headerContainer = $("<div />").addClass("container");
            items.headerContent = $("<div />").addClass("content");
            items.headerTitle = $("<h4 />").text(title);
            items.headerSubtitle = $("<h5 />").text(subtitle);
            items.menu = $("<ul >").addClass("actions");
            items.resultsDisplay = $("<div />").addClass("results-display").text(description);

            items.headerContainer.append(items.headerContent);
            items.headerContent.append(items.headerTitle);
            items.headerContent.append(items.headerSubtitle);
            items.headerContent.append(items.resultsDisplay);
            items.headerContent.append(items.menu);

            items.addItem = function (icon) {
                return items.menu.append($('<li />').addClass("action-resize").extend($("<i />").addClass("fa fa-" + icon)));
            };


            var header = $("<header />")
                    .addClass("separator")
                    .append(items.headerContainer);

            result.append(header);
            result.append(container.append(content));

            return header;
        };

        this.block = function () {
            var ret = $("<div />");
            content.append(ret);
            return ret;
        };

        this.addItem = function (name, value, tagname) {
            var node = $("<div />").addClass("field");

            if (typeof tagname !== typeof undefined) {
                node.attr("data-tagname", tagname);
            }

            if (typeof value !== typeof undefined) {
                node.append($("<div />").addClass("value").text(value));
            }

            if (typeof name !== typeof undefined) {
                node.append($("<div />").addClass("name").text(name));
            }

            content.append(node);

            return node;
        };

        this.content = function () {
            return content;
        };

        this.generate = function () {
            return result;
        };

        return this;
    };

    controller.registerCall("generateResult", function () {
        return new generateResult();
    });

    controller.registerCall("generateResult::import", function (result) {
        assert.ok(result.hasClass("result"));

        var container = result.find(".container").first();
        assert.ok(container.length > 0);

        var content = container.find(".content");
        assert.ok(content.length > 0);

        return new generateResult(container, content, result);
    });

};