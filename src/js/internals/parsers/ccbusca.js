var _ = require("underscore"),
        natural = require("natural");



module.exports = function (controller) {


    var setAddress = function (result, jdocument) {
        var init = "BPQL > body > addresses > address";

        var addressElements = [];
        var cepElements = [];

        jdocument.find(init).each(function (i, node) {

            var nodes = {
                "Endereço": "address",
                "Número": "number",
                "Complemento": "address-complement",
                "CEP": "zipcode",
                "Bairro": "neighborhood",
                "Cidade": "city",
                "Estado": "state"
            }, jnode = $(node), address = [];

            for (var idx in nodes) {
                var data = jnode.find(nodes[idx]).text();
                nodes[idx] = (/^\**$/.test(data)) ? "" : data;
            }

            if (!nodes["Endereço"] || !nodes.CEP) {
                return;
            }

            if (_.contains(addressElements, nodes["Endereço"]) ||
                    _.contains(cepElements, nodes.CEP) ||
                    Math.max(..._.map(addressElements, function (value) {
                        return natural.JaroWinklerDistance(value, nodes["Endereço"]);
                    })) > 0.85) {
                return;
            }

            addressElements.push(nodes["Endereço"]);
            cepElements.push(nodes.CEP);

            result.addSeparator("Endereço", "Localização", "Endereçamento e mapa");

            for (idx in nodes) {
                if (/^\**$/.test(nodes[idx])) {
                    return;
                }
                result.addItem(idx, nodes[idx]);
            }

            jnode.find("*").each(function (idx, node) {
                var jnode = $(node);
                if (!/address-complement/i.test(jnode.prop("tagName"))) {
                    address.push(jnode.text());
                }
            });

            var mapUrl = "http://maps.googleapis.com/maps/api/staticmap?" + $.param({
                "scale": "1",
                "size": "600x150",
                "maptype": "roadmap",
                "format": "png",
                "visual_refresh": "true",
                "markers": "size:mid|color:red|label:1|" + address.join(", ")
            });

            result.addItem().addClass("map").append(
                    $("<a />").attr({
                "href": "https://www.google.com/maps?" + $.param({
                    q: address.join(", ")
                }),
                "target": "_blank"
            }).append($("<img />").attr("src", mapUrl)));
        });
    };

    var setContact = function (result, jdocument) {
        var phones = [];
        var emails = [];

        jdocument.find("BPQL > body > phones > phone:lt(3)").each(function (idx, node) {
            var jnode = $(node);
            phones.push("(" + jnode.find("area-code").text() + ") " + jnode.find("number").text());
        });

        jdocument.find("BPQL > body email:lt(3), BPQL > body > RFB > email").each(function (idx, node) {
            emails.push($(node).text());
        });

        if (!phones.length && !emails.length) {
            return;
        }

        phones = _.uniq(phones);
        emails = _.uniq(emails);

        result.addSeparator("Contato", "Meios de contato", "Telefone, e-mail e outros");
        for (var idxPhones in phones) {
            result.addItem("Telefone", phones[idxPhones]);
        }

        for (var idxEmails in emails) {
            result.addItem("Email", emails[idxEmails]);
        }

    };

    var parserConsultas = function (document) {
        var jdocument = $(document);

        var result = controller.call("result");

        var nodes = {
            "Nome": "name"
        };

        var init = "BPQL > body > ";
        for (var idx in nodes) {
            var data = jdocument.find(init + nodes[idx]).text();
            if (/^\**$/.test(data))
                continue;
            result.addItem(idx, data, nodes[idx]);
        }

        setAddress(result, jdocument);
        setContact(result, jdocument);

        return result.element();
    };

    controller.registerBootstrap("parserCCbusca", function (callback) {
        callback();
        controller.importXMLDocument.register("CCBUSCA", "CONSULTA", parserConsultas);
    });

};
