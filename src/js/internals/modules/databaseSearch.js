module.exports = function (controller) {

    controller.registerCall("databaseSearch::submit", function (args) {

        var form = args[0],
                tableJNode = args[1],
                databaseJNode = args[2],
                section = args[3];

        var database = databaseJNode.attr("name");
        var table = tableJNode.attr("name");

        return function (e) {
            var loader = section.find(".display-loader");
            e.preventDefault();
            var formdata = form.serialize();
            controller.serverCommunication.call("SELECT FROM '" + database + "'.'" + table + "'", {
                data: formdata,
                success: function (doc) {
                    var args = [].concat(doc, database, table, databaseJNode, tableJNode, section, form);
                    controller.trigger("database::success", args);
                    controller.trigger("database::success::" + database, args);
                    controller.trigger("database::success::" + database + "::" + table, args);
                },
                error: function (x, h, r) {
                    var args = [].concat(x, h, r, database, table, databaseJNode, tableJNode, section, form);
                    controller.trigger("database::error", args);
                    controller.trigger("database::error::" + database, args);
                    controller.trigger("database::error::" + database + "::" + table, args);
                },
                beforeSend: function () {
                    loader.css("display", "inline-block");
                },
                complete: function () {
                    loader.css("display", "none");
                }
            });
        };
    });

    controller.registerTrigger("database::success", function (args, callback) {
        callback();

        var doc = args[0],
                database = args[1],
                table = args[2],
                databaseJNode = args[3],
                tableJNode = args[4],
                section = args[5],
                form = args[6];

        var results = section.find(".results");
        var htmlNode = new controller.call("xmlDocument")(doc);
        htmlNode.find(".xml2html").data("form", form.serializeArray());

        results.empty().append(htmlNode);
        $("html, body").scrollTop(results.offset().top);
    });

};