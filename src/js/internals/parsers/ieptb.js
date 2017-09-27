import * as _ from 'underscore';

module.exports = function(controller) {

    var parserConsultasWS = function(document) {

        var result = controller.call("result"),
            jdocument = $(document);
        _.each(jdocument.find("BPQL > body > consulta > conteudo > cartorio"), (element) => {
            result.addSeparator("Protestos em Cartório",
                $("nome", element).text(),
                $("endereco", element).text());

            result.addItem("Protestos", $("protestos", element).text()).addClass("center");
            result.addItem("Telefone", $("telefone", element).text());
            result.addItem("Cidade", $("cidade", element).text());

            $("protesto", element).each((i, v) => {
                let data = $("data", v).text();
                let valor = $("valor", v).text();

                result.addSeparator("Protesto em Cartório",
                    $("nome", element).text(),
                    $("endereco", element).text());

                if (data && !/^\s*$/.test(data)) result.addItem("Data do protesto", moment(data, ["YYYY-MM-DD", "DD-MM-YYYY"]).format("DD/MM/YYYY"));
                if (valor && !/^\s*$/.test(valor)) result.addItem("Valor do protesto", numeral(valor.replace(".", ",")).format("$0,0.00"), "valor");
            });
        });
        return result.element();
    };

    controller.registerBootstrap("parserIEPTB", function(callback) {
        callback();
        controller.importXMLDocument.register("IEPTB", "WS", parserConsultasWS);
    });

};
