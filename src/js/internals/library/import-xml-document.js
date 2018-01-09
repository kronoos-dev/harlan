import _ from 'underscore';

export default function (controller) {

    const registered = {};

    const generateKey = (database, table) => `${(database || '').toUpperCase()}::${(database || '').toUpperCase()}`;

    this.register = function (database, table, callback) {
        registered[generateKey(database, table)] = callback;
        return this;
    };

    const parse = (jdocument, document, database, table) => {

        const key = generateKey(database, table);
        if (registered[key])
            return registered[key](document);

        const html = $('<div />').addClass('xml2html');
        html.data('document', jdocument);

        const irqlBody = jdocument.find('BPQL > body');

        const readNode = (jnode, htmlNode) => {

            htmlNode.data('xml', jnode);

            const childrens = jnode.children();

            const divElement = $('<div />').attr({
                'data-tagName': jnode.prop('tagName')
            }).addClass('field');

            if (jnode.attr('harlan-class')) {
                divElement.addClass(jnode.attr('harlan-class').join(' '));
            }

            const nodeName = $('<div />').addClass('name');
            nodeName.text(jnode.attr('harlan-name') || jnode.prop('tagName'));

            let nodeValue = $('<div />').addClass('value');

            /** @TODO REMOVER ESSE POG */
            const text = jnode.clone().children().remove().end().text();

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
                childrens.each((idx, node) => {
                    readNode($(node), nodeValue);
                });
            }

            return divElement;
        };

        readNode(irqlBody.length ? irqlBody : jdocument, html);

        const content = $('<div />').addClass('content').append(html);
        const container = $('<div />').addClass('container').append(content);

        return $('<section />').addClass('result').append(container);
    };

    this.import = (document, database, table) => {
        const jdocument = $(document);

        const query = jdocument.find('BPQL > header > query:last');
        database = database || query.attr('database');
        table = table || query.attr('table');
        const ret = parse(jdocument, document, database, table);

        controller.trigger(`importXMLDocument::generated::${database}`, {
            document,
            table,
            parsedResult: ret
        });

        return ret;
    };

};
