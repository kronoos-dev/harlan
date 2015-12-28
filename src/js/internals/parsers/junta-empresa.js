var _ = require("underscore");

module.exports = function (controller) {

    var setPartners = function (result, jdocument) {
        result.addSeparator("Quadro Societário", "Informações do Quadro Societário", "Nomes dos sócios e cargos");
        jdocument.find("BPQL > body > RFB socio").each(function (idx, node) {
            var jnode = $(node);
            result.addItem(jnode.attr("qualificacao"), jnode.text());
        });
    };

    var setAddress = function (result, jdocument) {

        result.addSeparator("Endereço", "Localização da Empresa", "Endereçamento e mapa");
        var nodes = {
            "Endereço": "logradouro",
            "Número": "numero",
            "Complemento": "complemento",
            "CEP": "cep",
            "Bairro": "bairro",
            "Cidade": "municipio",
            "Estado": "uf",
        };

        var init = "BPQL > body > RFB > enderecos > endereco:first ";
        for (var idx in nodes) {
            var data = jdocument.find(init + nodes[idx]).text();
            if (/^\**$/.test(data))
                continue;
            result.addItem(idx, data, nodes[idx]);
        }


        var address = [];
        jdocument.find("BPQL > body > RFB endereco:first").find("*").each(function (idx, node) {
            var jnode = $(node);
            if (!/complemento/i.test(jnode.prop("tagName")))
                address.push(jnode.text());
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
    };

    var setCompanyActivitys = function (result, jdocument) {
        var secondary = jdocument.find("BPQL > body > RFB atividade-secundaria");
        if (!secondary.length) {
            return;
        }
        
        result.addSeparator("Atividades Secundárias", "Demais atividades exercidas", "Atividades além da atividade principal");
        secondary.each(function (idx, node) {
            var jnode = $(node);
            result.addItem("Atividade Secundária " + jnode.attr("codigo"), jnode.text());
        });
    };
    
    var setCompanyContact = function (result, jdocument) {
        var phones = [];
        var emails = [];

        var phonesRFB = jdocument.find("BPQL > body > RFB > telefones");
        if (phonesRFB.length) {
            phones.push(phonesRFB.text());
        }

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

    var setCompanyActivity = function (result, jdocument) {
        var nodeActivity = jdocument.find("BPQL > body > RFB > atividade-economica");
        var code = nodeActivity.attr('codigo');
        result.addItem("Atividade Econômica " + code, nodeActivity.text());
    };

    var setCompanyName = function (result, jdocument) {

        var nodeNome = jdocument.find("RFB > nome");
        if (!nodeNome) {
            return;
        }

        result.addItem("Nome", nodeNome.text());

        var nomeFantasia = nodeNome.attr('fantasia');
        if (nomeFantasia) {
            result.addItem("Nome Fantasia", nomeFantasia);
        }
    };

    var parserConsultas = function (document) {
        var jdocument = $(document);

        var result = controller.call("generateResult");

        setCompanyName(result, jdocument);
        setCompanyActivity(result, jdocument);

        var nodes = {
            "CNPJ": "RFB > CNPJ",
            "Tipo CNPJ": "RFB > tipo-cnpj",
            "Data da Abertura": "RFB > data-abertura",
            "Capital Social": "RFB > capitalSocial",
            "Situação": "RFB > situacao",
            "Data da Situação": "RFB > data-situacao",
            "Data da Consulta": "RFB > data-consulta",
            "EFR": "RFB > efr",
            "Situação Especial": "RFB > situacao-especial",
            "Data da Situação Especial": "RFB > data-situacao-especial"
        };

        var init = "BPQL > body > ";
        for (var idx in nodes) {
            var data = jdocument.find(init + nodes[idx]).text();
            if (/^\**$/.test(data))
                continue;
            result.addItem(idx, data, nodes[idx]);
        }

        setAddress(result, jdocument);
        setPartners(result, jdocument);
        setCompanyActivitys(result, jdocument);
        setCompanyContact(result, jdocument);

        return result.generate();

    };

    controller.registerBootstrap("parserPlacas", function () {
        controller.importXMLDocument.register("JUNTAEMPRESA", "CONSULTA", parserConsultas);
    });

};
