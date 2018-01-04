module.exports = function (controller) {

    var xmlDocument = function (document, database, table) {
        var htmlNode = controller.importXMLDocument.import(document, database, table);

        var fnc = function (e) {
            e.preventDefault();
            var result = $(this);
            result[(result.hasClass('selected') ? 'remove' : 'add') + 'Class']('selected');
        };
        htmlNode.on('doubletap', fnc);
        return htmlNode;

    };

    controller.registerCall('xmlDocument', function (document, database, table) {
        return xmlDocument(document, database, table);
    });
};
