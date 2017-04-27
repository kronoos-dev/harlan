var _ = require("underscore");

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
                "Tipo" : "tipo",
                "Endereço": "logradouro",
                "Número": "numero",
                "Complemento": "complemento",
                "CEP": "cep",
                "Bairro": "bairro",
                "Cidade": ["cidade", "municipio"],
                "Estado": ["estado", "uf"]
            }, jnode = $(node), address = [];

            for (var idx in nodes) {
                var data = "";
                if (Array.isArray(nodes[idx])) {
                    for (let item in nodes[idx]) {
                        let itemNode = jnode.find(nodes[idx][item]);
                        if (itemNode.length) {
                            data = itemNode.text();
                            break;
                        }
                    }
                } else {
                    data = jnode.find(nodes[idx]).text();
                }
                nodes[idx] = (/^\**$/.test(data)) ? "" : data;
            }

            if (!nodes["Endereço"] || !nodes.CEP) {
                return;
            }

            if (_.contains(addressElements, nodes["Endereço"]) ||
                    _.contains(cepElements, nodes.CEP) ||
                    Math.max(..._.map(addressElements, function (value) {
                        return require('jaro-winkler')(value, nodes["Endereço"]);
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

            // Adiciona o item caso o endereço esteja completo
            // for (idx in nodes) {
            //     if (/^\**$/.test(nodes[idx])) {
            //         return;
            //     }
            //     result.addItem(idx, nodes[idx]);
            // }
        });
    };

    var setContact = function (result, jdocument) {
        var phones = [];
        var emails = [];

        jdocument.find("BPQL > body telefone").each(function (idx, node) {
            var jnode = $(node);
            phones.push("(" + jnode.find("ddd").text() + ") " + jnode.find("numero").text());
        });

        jdocument.find("BPQL > body email").each(function (idx, node) {
            let email = $(node).text().trim();
            if (!email) return;
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

    var setSocio = (result, jdocument) => {
        let $empresas = jdocument.find("BPQL > body socios > socio");

        if ($empresas.length === 0) return;

        for (let node of $empresas) {
            let $node = $(node);
            let nodes = {};
            nodes[$node.attr("qualificacao")] = $node.text();

            result.addSeparator("Quadro Societário", "Empresa", "Empresa a qual faz parte.");
            for (var idx in nodes) {
                result.addItem(idx, nodes[idx]);
            }

        }
    };


    var setSociety = (result, jdocument) => {
        let $empresas = jdocument.find("BPQL > body parsocietaria > empresa");

        if ($empresas.length === 0) return;

        for (let node of $empresas) {
            let $node = $(node),
                nodes = {
                    "Empresa": "nome",
                    "CNPJ": "cnpj",
                    // "Participação": "quali"
                };

            let dict = {
                documento: $(node).find("cnpj").text(),
                ihash: $(node).find("cnpj").attr("ihash")
            };

            let items = {};
            let separator = result.addSeparator("Quadro Societário", "Empresa", "", items);

            controller.server.call("SELECT FROM 'SEEKLOC'.'CCF'",
                controller.call("error::ajax", controller.call("loader::ajax", {data:dict, success: ret => {
                    let totalRegistro =  parseInt($(ret).find("BPQL > body > data > resposta > totalRegistro").text());
                    let message = 'Não há cheques sem fundo.';
                    if (totalRegistro) {
                        let qteOcorrencias = $(ret).find("BPQL > body > data > sumQteOcorrencias").text(),
                            v1 = moment($("dataUltOcorrencia", ret).text(), "DD/MM/YYYY"),
                            v2 = moment($("ultimo", ret).text(), "DD/MM/YYYY");
                        message = ` Total de registros CCF: ${qteOcorrencias} com data da última ocorrência: ${(v1.isAfter(v2) ? v1 : v2).format("DD/MM/YYYY")}.`;
                    }
                    items.resultsDisplay.text(`${items.resultsDisplay.text()} ${message}`);
                }})));

            controller.server.call("SELECT FROM 'IEPTB'.'WS'",
                controller.call("error::ajax", controller.call("loader::ajax", {data:dict, success: ret => {
                    if ($(ret).find("BPQL > body > consulta > situacao").text() != "CONSTA") {
                        items.resultsDisplay.text(`${items.resultsDisplay.text()} Não há protestos.`);
                        return;
                    }
                    let totalProtestos = $("protestos", ret)
                                            .get()
                                            .map((p) => parseInt($(p).text()))
                                            .reduce((a, b) => a + b, 0);
                    items.resultsDisplay.text(`${items.resultsDisplay.text()} Total de Protestos: ${totalProtestos}.`);
                }})));


            for (var idx in nodes) {
                var data = $node.find(nodes[idx]).text();
                nodes[idx] = (/^\**$/.test(data)) ? "" : data;
                result.addItem(idx, nodes[idx]);
            }

        }
    };

    var parserConsultas = function (document) {
        var jdocument = $(document);

        var result = controller.call("result");

        var nodes = {
            "Nome": "nome",
            "Nome da Mãe" : "nomemae",
            "Atividade Econômica" : "atividade-economica",
            "Natureza Jurídica" : "natureza-juridica",
            "Situação" : "situacao",
            "Data de Abertura" : "data-abertura",
        };

        var init = "BPQL > body ";
        for (var idx in nodes) {
            var data = jdocument.find(init + nodes[idx]).first().text();
            if (/^\**$/.test(data))
                continue;
            result.addItem(idx, data, nodes[idx]);
        }

        var capitalSocial = jdocument.find("capitalSocial");
        if (capitalSocial.length) {
            result.addItem("Capital Social", numeral(capitalSocial.text().replace(".", ",")).format("$0,0.00"), "capitalSocial");
        }

        setAddress(result, jdocument);
        setContact(result, jdocument);
        setSociety(result, jdocument);
        setSocio(result, jdocument);

        return result.element();
    };

    controller.registerBootstrap("parserCCbusca", function (callback) {
        callback();
        controller.importXMLDocument.register("CCBUSCA", "CONSULTA", parserConsultas);
        controller.importXMLDocument.register("CCBUSCA", "BILLING", parserConsultas);
    });

};
