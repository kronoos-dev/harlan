import * as _ from 'underscore';

module.exports = function (controller) {

    var parserConsultasWS = function (document) {

        var result = controller.call("result"),
            jdocument = $(document);
		_.each(jdocument.find("BPQL > body > consulta > conteudo > cartorio"), (element) => {
            result.addSeparator("Protestos em Cartório",
                $("nome", element).text(),
                $("endereco", element).text(),
                $("valor", element).text(),
                $("data", element).text());

            result.addItem("Protestos", $("protestos", element).text()).addClass("center");
            result.addItem("Telefone", $("telefone", element).text());
            result.addItem("Cidade", $("cidade", element).text());

            if (typeof $("data", element).text() == 'string' && $("data", element).text() !== '')
            {
                result.addItem("Data do protesto", moment($("data", element).text(), ["YYYY-MM-DD", "DD-MM-YYYY"]).format("DD/MM/YYYY"));
            }
            if (typeof $("valor", element).text() == 'string' && $("valor", element).text() !== ''){
                result.addItem("Valor do protesto", numeral($("valor", element).text().replace(".", ",")).format("$0,0.00"), "valor");
            }
		});
        return result.element();
    };

    controller.registerBootstrap("parserIEPTB", function (callback) {
        callback();
        controller.importXMLDocument.register("IEPTB", "WS", parserConsultasWS);
    });

};
