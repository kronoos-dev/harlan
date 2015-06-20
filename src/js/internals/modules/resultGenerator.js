var assert = require("assert");

module.exports = function (controller) {

    var resultGenerator = function (inputContainer, inputContent, inputResult) {
        var container = inputContainer || $("<div />").addClass("container");
        var content = inputContent || $("<div />").addClass("content");
        var result = inputResult || $("<div />").addClass("result");

        if (!inputResult)
            result.append(container.append(content));

        this.addSeparator = function (title, subtitle, description, inputContainer, inputContent) {
            container = inputContainer || $("<div />").addClass("container");
            content = inputContent || $("<div />").addClass("content");

            var headerContainer = $("<div />").addClass("container");
            var headerContent = $("<div />").addClass("content");
            var headerTitle = $("<h4 />").text(title);
            var headerSubtitle = $("<h5 />").text(subtitle);
            var resultsDisplay = $("<div />").addClass("results-display").text(description);
            
            headerContainer.append(headerContent);
            headerContent.append(headerTitle);
            headerContent.append(headerSubtitle);
            headerContent.append(resultsDisplay);

            var header = $("<header />")
                    .addClass("separator")
                    .append(headerContainer);

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

        this.generate = function () {
            return result;
        };

        return this;
    };

    controller.registerCall("resultGenerator", function () {
        return new resultGenerator();
    });

    controller.registerCall("resultGenerator::import", function (result) {
        assert.ok(result.hasClass("result"));

        var container = result.find(".container").first();
        assert.ok(container.length > 0);

        var content = container.find(".content");
        assert.ok(content.length > 0);

        return new resultGenerator(container, content, result);
    });

};