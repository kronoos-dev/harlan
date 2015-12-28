module.exports = function (controller) {

    var xmlDocument = function (document, database, table) {
        var htmlNode = controller.importXMLDocument.import(document, database, table);

        var fnc = function (e) {
            e.preventDefault();
            var result = $(this);
            result[(result.hasClass("selected") ? "remove" : "add") + "Class"]("selected");
        };
        htmlNode.on("doubletap", fnc);


        htmlNode.find(".field").each(function (idx, element) {
            var jElement = $(element);
            var value = jElement.find(".value");
            var name = jElement.find(".name");

            if (!name.length || !value.length) {
                return;
            }

            name.attr("data-clipboard-text", value.text());

            var client = new ZeroClipboard(name);
            client.on("ready", function () {
                console.log("Elemento " + name.text() + " pronto para ser copiado com [" + value.text() + "]");
                client.on("aftercopy", function (event) {
                    toastr.success("Você já pode colar na sua aplicação o valor do campo.", "O campo foi copiado com sucesso.");
                });
            });

            client.on('error', function (event) {
                console.log('ZeroClipboard error of type "' + event.name + '": ' + event.message);
            });

            name.on("remove", function () {
                client.destroy();
            });
        });
        
        return htmlNode;

    };

    controller.registerCall("xmlDocument", function (document, database, table) {
        return xmlDocument(document, database, table);
    });
};