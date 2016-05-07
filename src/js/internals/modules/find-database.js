/**
 * Módulo responsável por listar as consultas do INFO.INFO na UX
 */
module.exports = function (controller) {

    var xhr;

    var parseWrapper = function (field) {
        var jField = $(field);
        var options = jField.find("option");
        var attributes = {
            name: jField.attr("name"),
            required: jField.attr("required") === "true" ? true : false,
            placeholder: !options.length ? jField.attr("description") : null,
        };

        if (!options.length) {
            attributes['data-mask'] = jField.attr("mask");
        }

        var label = $("<label />").text(jField.attr("caption"));
        var input = $(!options.length ? "<input />" : "<select />").attr(attributes);

        options.each(function (idx, optNode) {
            var jOptNode = $(optNode);
            input.append($("<option />").text(jOptNode.text()).attr("value", jOptNode.attr("value")));
        });

        return $("<div />")
                .addClass("input-wrapper")
                .append(label)
                .append(input);
    };

    var factoryShowForm = function (section, button) {
        return function (e) {
            e.preventDefault();
            var iButton = button.find("i");
            var flipElements = section.find("form, section, footer");
            if (iButton.hasClass("fa-minus-square-o")) {
                flipElements.hide();
                iButton.removeClass().addClass("fa fa-plus-square-o");
            } else {
                iButton.removeClass().addClass("fa fa-minus-square-o");
                flipElements.show();
            }
        };
    };

    var parseFormContent = function (tableJNode, databaseJNode, header, wrappers) {
        var nFields = wrappers.length;
        if (nFields % 2)
            nFields += 1;

        var inputLines = [];

        for (var line = 0, idxField = 0; line < nFields / 2; line++, idxField += 2) {
            var inputLine = $("<div />").addClass("input-line").append(wrappers[idxField]);
            if (typeof wrappers[idxField + 1] !== "undefined") {
                inputLine.append(wrappers[idxField + 1]);
            }
            inputLines.push(inputLine);
        }

        var contentFilters = $("<div />").addClass("content-filters");
        for (var idxLine in inputLines) {
            contentFilters.append(inputLines[idxLine]);
        }

        return $("<div />")
                .addClass("container filters")
                .append($("<div />").addClass("content").append(contentFilters));
    };

    var parseForm = function (tableJNode, databaseJNode, header, section) {
        var wrappers = [];

        var form = $("<form />").addClass("block-filters").attr({
            method: "post",
            action: "#"
        });

        tableJNode.find("field").each(function (idx, field) {
            wrappers.push(parseWrapper(field));
        });

        form.append(parseFormContent(tableJNode, databaseJNode, header, wrappers));

        var inputLine = $("<div />").addClass("input-line");
        if (tableJNode.attr("harlanSearch") === "enabled")
            inputLine.append($("<div />").addClass("input-wrapper").append($("<input />").attr({
                value: "Pesquisar",
                type: "submit"
            }).addClass("submit")));

        form.find(".content-filters").append(inputLine);

        form.submit(controller.call("databaseSearch::submit", [form, tableJNode, databaseJNode, section]));

        return form;
    };

    var factoryCloseSection = function (section) {
        return function (e) {
            e.preventDefault();
            section.remove();
        };
    };

    var parseHeader = function (tableJNode, databaseJNode, section) {
        var header = $("<header />");
        var container = $("<div />").addClass("container");
        var content = $("<div />").addClass("content");
        var form = parseForm(tableJNode, databaseJNode, header, section);

        content.append($("<h2 />").text(databaseJNode.attr("label") || databaseJNode.attr("name")));
        content.append($("<h3 />").text(tableJNode.attr("label") || tableJNode.attr("name")));
        content.append($("<div />").addClass("results-display").text(tableJNode.attr("description")));

        var actions = $("<ul />").addClass("actions");
        actions.append($("<li />").addClass("display-loader").append($("<i />").addClass("fa fa-spinner fa-spin")));

        var maximizeButton = $("<li />").addClass("action-resize").append($("<i />").addClass("fa fa-minus-square-o"));
        var closeButton = $("<li />").addClass("action-close").append($("<i />").addClass("fa fa-times-circle"));
        maximizeButton.click(factoryShowForm(section, maximizeButton));
        closeButton.click(factoryCloseSection(section));
        actions.append(maximizeButton);
        actions.append(closeButton);
        content.append(actions);

        header.append(container.append(content)).append(form);
        section.append(header);
    };

    var parseSection = function (tableJNode, databaseJNode, section) {
        section.append($("<section />").addClass("results"));
    };

    var parseFooter = function (tableJNode, databaseJNode, section) {
        var footer = $("<footer />").addClass("load-more hide");
        var container = $("<div />").addClass("container");
        var content = $("<div />").addClass("content").text("Mais Resultados");
        section.append(footer.append(container.append(content)));
    };

    var parseTable = function (tableJNode, databaseJNode) {
        var section = $("<section />").addClass("group-type database");
        parseHeader(tableJNode, databaseJNode, section);
        parseSection(tableJNode, databaseJNode, section);
        parseFooter(tableJNode, databaseJNode, section);
        return section;
    };

    var loadExternalJavascript = function (domTable, jElement) {
        var jsonps = jElement.find("harlanJSONP");
        if (!jsonps.length)
            return false;

        var requestsMissing = jsonps.length;

        jsonps.each(function (i, element) {
            var completedRequest = function (idx) {
                return function () {
                    controller.store.unset(idx);
                    if (!--requestsMissing) {
                        $(".app-content").append(domTable);
                    }
                };
            };

            var jElement = $(element);

            controller.store.set(jElement.attr("callback"), [domTable, jElement]);
            $.ajax({
                dataType: "jsonp",
                url: jElement.text(),
                cache: true,
                jsonpCallback: jElement.attr("callback"),
                success: completedRequest(jElement.attr("callback")),
                error: function () {
                    console.log("Ocorreu um erro no callback " + jElement.text());
                    controller.store.unset(jElement.attr("callback"));
                },
                timeout: 10 * 1000
            });
        });

        return true;
    };

    var items = [];

    var parseDocument = function (jDocument, text, modal) {

        text = text.toLowerCase();

        for (var idx in items) {
            items[idx].remove();
        }

        jDocument.find("database table[harlan=\"enabled\"]").each(function (idx, element) {
            var tableJNode = $(element);
            var databaseJNode = tableJNode.closest("database");

            var matchText = function (node) {
                var validAttrs = ["label", "name", "description"];
                for (var idx in validAttrs) {
                    if (node.attr(validAttrs[idx]).toLowerCase().indexOf(text) >= 0)
                        return true;
                }
                return false;
            };

            if (!(matchText(databaseJNode) || matchText(tableJNode))) {
                return;
            }

            items.push(modal.item(databaseJNode.attr("label") || databaseJNode.attr("name"),
                    tableJNode.attr("label") || tableJNode.attr("name"),
                    tableJNode.attr("description"))
                    .addClass("database")
                    .click(function () {
                        var domTable = parseTable(tableJNode, databaseJNode);
                        controller.trigger("findDatabase::table::" +
                                databaseJNode.attr("name").toUpperCase() + "::" +
                                tableJNode.attr("name").toUpperCase(), {
                            dom: domTable,
                            about: tableJNode
                        });
                        if (!loadExternalJavascript(domTable, tableJNode))
                            $(".app-content").append(domTable);
                    }));
        });
    };

    controller.registerTrigger("findDatabase::instantSearch", "findDatabase::instantSearch", function (args, callback) {
        if (xhr && xhr.readyState != 4) {
            xhr.abort();
        }

        var text = args[0],
                modal = args[1];

        if (!/^[a-z]{3,}[a-z\s*]/i.test(text)) {
            callback();
            return;
        }

        xhr = controller.serverCommunication.call("SELECT FROM 'INFO'.'INFO'", {
            complete: function () {
                callback();
            },
            success: function (domDocument) {
                parseDocument($(domDocument), text, modal);
            },
            cache: true
        });
    });

    controller.registerBootstrap("databaseSearch", function (callback) {
        callback();

        var inputDatabaseSearch = $("#input-q");
        var autocomplete = controller.call("autocomplete", inputDatabaseSearch);

        var searchLength;
        var searchId;

        inputDatabaseSearch.keyup(function () {
            var search = inputDatabaseSearch.val();
            var newLength = search.length;

            if (newLength === searchLength)
                return;

            autocomplete.empty();
            searchLength = newLength;

            if (searchId)
                clearTimeout(searchId);

            searchId = setTimeout(function () {
                $(".q").addClass("loading");
                controller.trigger("findDatabase::instantSearch", [search, autocomplete], function (args, callback) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                    $(".q").removeClass("loading");
                });
            }, controller.confs.instantSearchDelay);

        });

    });
};
