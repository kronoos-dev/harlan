var _ = require("underscore"),
        natural = require("natural");

module.exports = function (controller) {

    function addressIsEmpty(nodes) {
        for (let idx in nodes) {
            if (! /^\**$/.test(nodes[idx])) {
                return false;
            }
        }
        return true;
    }

    function addressIsComplete(nodes) {
        for (let idx in nodes) {
            if (/^\**$/.test(nodes[idx])) {
                return false;
            }
        }
        return true;
    }

    var setAddress = function (result, jdocument) {
        var init = "BPQL > body enderecos > endereco";

        var addressElements = [];
        var cepElements = [];

        jdocument.find(init).each(function (i, node) {

            var nodes = {
                "Endereço": "logradouro",
                "Número": "numero",
                "Complemento": "complemento",
                "CEP": "cep",
                "Bairro": "bairro",
                "Cidade": "municipio",
                "Estado": "uf"
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

            if (!addressIsEmpty(nodes)) {
                result.addSeparator("Endereço", "Localização", "Endereçamento e mapa");
                for (idx in nodes) {
                    if (! /^\**$/.test(nodes[idx])) {
                        result.addItem(idx, nodes[idx]);
                    }
                }

                jnode.find("*").each(function (idx, node) {
                    var jnode = $(node);
                    if (!/complemento/i.test(jnode.prop("tagName"))) {
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
            }

        });
    };

    var setContact = function (result, jdocument) {
        var phones = [];
        var emails = [];

        jdocument.find("BPQL > body telefones").each(function (idx, node) {
            var phone = $(node).text();
            phones.push("(" + phone.substring(0,2) + ") " + phone.substring(3, 12));
        });

        jdocument.find("BPQL > body email").each(function (idx, node) {
            let email = $(node).text().trim();
            if (_.contains(emails, email)) return;
            emails.push(email);
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
        console.debug(document);

        var jdocument = $(document);

        var result = controller.call("result");

        var nodes = {
            "Nome": "nome",
            "Atividade Econômica" : "atividade-economica",
            "Natureza Jurídica" : "natureza-juridica",
            "Situação" : "situacao",
        };

        var init = "BPQL > body ";
        for (var idx in nodes) {
            var data = jdocument.find(init + nodes[idx]).text();
            if (/^\**$/.test(data))
                continue;
            result.addItem(idx, data, nodes[idx]);
        }

        var capitalSocial = jdocument.find("capitalSocial");
        if (capitalSocial.length) {
            result.addItem("Capital Social", numeral(capitalSocial.text()).format("'$0,0.00'"), "capitalSocial");
        }

        setContact(result, jdocument);
        setAddress(result, jdocument);

        return result.element();
    };

    controller.registerBootstrap("parserRFBCNPJ", function (callback) {
        callback();
        controller.importXMLDocument.register("RFBCNPJ", "CERTIDAO", parserConsultas);
        controller.importXMLDocument.register("RFBCNPJANDROID", "CERTIDAO", parserConsultas);
    });

};
