module.exports = function (controller) {

    var xhr;

    var onDocumentSuccess = function (sectionDocumentGroup, current_id, element) {
        return function (ret) {
            var append = controller.call("xmlDocument")(ret);
            append.data("on-remove", element);
            append.data("save-id", current_id);
            sectionDocumentGroup[1].append(append);
        };
    };

    controller.registerTrigger("findDocument::show", function (args) {
        var name = args[0],
                description = args[1],
                ids = args[2],
                element = $(args[3]);

        controller.call("loader::register");

        var running = ids.length;
        var sectionDocumentGroup = controller.call("section")(name, description,
                (ids.length === 1 ?
                        "Um registro armazenado" :
                        ids.length.toString() + " registros armazenados"));
        var doneCallback = function () {
            if (!--running) {
                controller.call("loader::unregister");
                $(".app-content").prepend(sectionDocumentGroup[0].addClass("saved"));
            }
        };

        for (var i in ids) {
            var current_id = ids[i];

            controller.serverCommunication.call("SELECT FROM 'HARLAN'.'DOCUMENT'", {
                data: {
                    id: current_id
                },
                success: onDocumentSuccess(sectionDocumentGroup, current_id, element),
                complete: doneCallback
            });
        }
    });

    var items = [];
    controller.registerTrigger("findDatabase::instantSearch", function (args, callback) {
        if (xhr && xhr.readyState != 4) {
            xhr.abort();
        }

        for (var i in items) {
            items[i].remove();
        }

        if (!/^[a-z]{2,}[a-z\s*]/i.test(args[0])) {
            callback();
            return;
        }

        xhr = controller.serverCommunication.call("SELECT FROM 'HARLAN'.'SEARCH'", {
            data: {
                data: args[0]
            },
            success: function (ret) {
                $(ret).find("result > node").each(function (idx, node) {
                    var jnode = $(node);

                    var codes = jnode.find("code node");
                    var length = codes.length;
                    var description = (length === 1 ? "Armazenado um (1) resultado" : "Armazenados " + length.toString() + " resultado") + " para este nome e descrição.";

                    var title = jnode.find("_id name").text();
                    var subtitle = jnode.find("_id description").text();
                    items.push(args[1].item(title,
                            subtitle,
                            description, null, null, true).addClass("saved").click(function () {
                        controller.trigger("findDocument::show", [title, subtitle, $.map(codes, function (code) {
                                return $(code).text();
                            }), this]);
                    }));
                });
            },
            complete: function () {
                callback();
            }
        });
    });

    controller.registerCall("findDocument::autocomplete", function (args) {
        var fieldName = args[0],
                fieldDescription = args[1],
                searchId,
                searchLength,
                xhr;

        var autocomplete = controller.call("autocomplete", fieldName);

        fieldName.keyup(function () {
            var search = fieldName.val();
            var newLength = search.length;
            if (newLength === searchLength)
                return;

            autocomplete.empty();
            searchLength = newLength;

            if (searchId)
                clearTimeout(searchId);

            searchId = setTimeout(function () {
                if (xhr) {
                    xhr.abort();
                }
                xhr = controller.serverCommunication.call("SELECT FROM 'HARLAN'.'SEARCH'", {
                    data: {
                        data: search
                    },
                    success: function (ret) {
                        $(ret).find("result > node").each(function (idx, node) {
                            var jnode = $(node);

                            var codes = jnode.find("code node");
                            var length = codes.length;
                            var description = (length === 1 ? "Armazenado um (1) resultado" : "Armazenados " + length.toString() + " resultado") + " para este nome e descrição.";

                            var title = jnode.find("_id name").text();
                            var subtitle = jnode.find("_id description").text();

                            items.push(autocomplete.item(title,
                                    subtitle,
                                    description, null, null, true).addClass("saved").click(function () {
                                fieldName.val(title);
                                fieldDescription.val(subtitle);
                            }));
                        });
                    }
                });

            }, controller.confs.instantSearchDelay);
        });
        
        return autocomplete;
    });


};