module.exports = function (controller) {

    var parserPlacas = function (document) {
        var jdocument = $(document);

        var result = controller.call("result");

        var init = "BPQL > body > ";
        var nodes = {
            "Modelo": "modelo",
            "Marca": "marca",
            "Cor": "cor",
            "Ano": "ano",
            "Ano Modelo": "anoModelo",
            "Placa": "placa",
            "Data": "data",
            "Estado": "uf",
            "Cidade": "municipio",
            "Situação": "situacao"
        };

        for (var idx in nodes) {
            result.addItem(idx, jdocument.find(init + nodes[idx]).text(), nodes[idx]);
        }

        return result.element();
    };

    controller.registerBootstrap("parserPlacas", function (callback) {
        callback();
        controller.importXMLDocument.register("PLACA", "CONSULTA", parserPlacas);
    });
};