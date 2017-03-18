import * as _ from 'underscore';

module.exports = function (controller) {

    var parserConsultasWS = function (document) {

        var result = controller.call("result"),
            jdocument = $(document);

		_.each(jdocument.find("BPQL > body > consulta > conteudo > cartorio"), (element) => {
            result.addSeparator("Protestos em Cartório",
                $("nome", element).text(),
                $("endereco", element).text());

            result.addItem("Protestos", $("protestos", element).text()).addClass("center");
            result.addItem("Telefone", $("telefone", element).text());
            result.addItem("Cidade", $("cidade", element).text());
            result.addItem("Data da Atualização", moment($("dt_atualizacao", element).text(), "YYYY-MM-DD")
                .format("DD/MM/YYYY")).addClass("center");
		});

        return result.element();

    };

    controller.registerBootstrap("parserIEPTB", function (callback) {
        callback();
        controller.importXMLDocument.register("IEPTB", "WS", parserConsultasWS);
    });

};
