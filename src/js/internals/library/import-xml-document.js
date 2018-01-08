var _ = require('underscore');

module.exports = function (controller) {

    var registered = {};

    var generateKey = function (database, table) {
        return (database || '').toUpperCase()  + '::' + (database || '').toUpperCase();
    };

    this.register = function (database, table, callback) {
        registered[generateKey(database, table)] = callback;
        return this;
    };

    var parse = function (jdocument, document, database, table) {

        var key = generateKey(database, table);
        if (registered[key])
            return registered[key](document);

        var html = $('<div />').addClass('xml2html');
        html.data('document', jdocument);

        var irqlBody = jdocument.find('BPQL > body');

        var readNode = function (jnode, htmlNode) {

            htmlNode.data('xml', jnode);

            var childrens = jnode.children();

            var divElement = $('<div />').attr({
                'data-tagName': jnode.prop('tagName')
            }).addClass('field');

            if (jnode.attr('harlan-class')) {
                divElement.addClass(jnode.attr('harlan-class').join(' '));
            }

            var nodeName = $('<div />').addClass('name');
            nodeName.text(jnode.attr('harlan-name') || jnode.prop('tagName'));

            var nodeValue = $('<div />').addClass('value');

            /** @TODO REMOVER ESSE POG */
            var text = jnode.clone().children().remove().end().text();

            if (/^\s*$/.test(text)) {
                if (jnode.attr('harlan-show-empty')) {
                    nodeValue.addClass('empty');
                    htmlNode.append(divElement.append(nodeValue).append(nodeName));
                } else {
                    nodeValue = htmlNode;
                }
            } else {
                nodeValue.append(text);
                htmlNode.append(divElement.append(nodeValue).append(nodeName));
            }

            if (childrens.length) {
                divElement.addClass('arrayElement');
                childrens.each(function (idx, node) {
                    readNode($(node), nodeValue);
                });
            }

            return divElement;
        };

        readNode(irqlBody.length ? irqlBody : jdocument, html);

        var content = $('<div />').addClass('content').append(html);
        var container = $('<div />').addClass('container').append(content);

        return $('<section />').addClass('result').append(container);
    };

    this.import = function (document, database, table) {
        var jdocument = $(document);

        var query = jdocument.find('BPQL > header > query:last');
        database = database || query.attr('database');
        table = table || query.attr('table');
        var ret = parse(jdocument, document, database, table);

        controller.trigger('importXMLDocument::generated::' + database, {
            document: document,
            table: table,
            parsedResult: ret
        });

        return ret;
    };

};
