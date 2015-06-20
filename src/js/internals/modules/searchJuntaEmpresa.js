var cpfMask = /^(\d{3}\.\d{3}\.\d{3}\-\d{2}|\d{11})$/;
var cnpjMask = /^(\d{2,3}\.\d{3}\.\d{3}\/\d{4}\-\d{2}|\d{14,15})$/;

module.exports = function (controller) {

    controller.registerTrigger("mainSearch::submit", function (val, callback) {
        if (cnpjMask.test(val)) {
            controller.call("juntaEmpresa::ajax", val);
        }
    });

    controller.registerCall("juntaEmpresa::ajax", function (val) {
        controller.serverCommunication.call("SELECT FROM 'JUNTAEMPRESA'.'CONSULTA'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    data: {
                        documento: val
                    },
                    success: function (ret) {
                        controller.call("juntaEmpresa::parse", ret);
                    }
                })));
    });

    controller.registerCall("juntaEmpresa::parse", function (ret) {
        var section = controller.call("section");
        var sectionDocumentGroup = section("Junta Empresa",
                "Informações agregadas do CNPJ",
                "1 registro encontrado");
        $(".app-content").prepend(sectionDocumentGroup[0]);
        sectionDocumentGroup[1].append(controller.call("xmlDocument")(ret,
                "JUNTAEMPRESA", "CONSULTA"));
    });

};