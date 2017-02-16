import * as _ from 'underscore';

module.exports = function (controller) {

    var parserConsultas = function (document) {

        var result = controller.call("result"),
            jdocument = $(document);

        result.addSeparator("Protestos em Cartório",
            "Detalhes acerca de protestos nos cartórios",
            "Foram localizados protestos em cartórios em unidade federativas.");

		_.each(jdocument.find("BPQL > body > protestos > void"), (element) => {
			result.addItem($(element).attr("element"), $(element).text()).addClass("center");
		});

        return result.element();

    };

    controller.registerBootstrap("parserIEPTB", function (callback) {
        callback();
        controller.importXMLDocument.register("IEPTB", "CONSULTA", parserConsultas);
    });

};
