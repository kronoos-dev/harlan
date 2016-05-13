var CPF = require("cpf_cnpj").CPF;
var CNPJ = require("cpf_cnpj").CNPJ;

module.exports = (controller) => {

    controller.registerCall("ccbusca::enable", () => {
        console.log("ccbusca enabled");
        controller.registerTrigger("mainSearch::submit", "ccbusca", (val, cb) => {
            cb();
            if (!CNPJ.isValid(val) && !CPF.isValid(val)) {
                return;
            }
            controller.call("credits::has", 150, () => {
                controller.call("ccbusca", val);
            });
        });
    });

    controller.registerCall("ccbusca", function(val, callback) {
        controller.serverCommunication.call("SELECT FROM 'CCBUSCA'.'BILLING'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                data: {
                    documento: val
                },
                success: function(ret) {
                    controller.call("ccbusca::parse", ret, val, callback);
                }
            })));
    });

    controller.registerCall("ccbusca::parse", function(ret, val, callback) {
        var sectionDocumentGroup = controller.call("section", "Busca Consolidada",
            "Informações agregadas do CPF ou CNPJ",
            "Registro encontrado");

        if (!callback) {
            $(".app-content").prepend(sectionDocumentGroup[0]);
        } else {
            callback(sectionDocumentGroup[0]);
        }

        var juntaEmpresaHTML = controller.call("xmlDocument", ret, "CCBUSCA", "CONSULTA");
        juntaEmpresaHTML.find(".container").first().addClass("xml2html")
            .data("document", $(ret))
            .data("form", [{
                name: "documento",
                value: val
            }]);
        sectionDocumentGroup[1].append(juntaEmpresaHTML);
    });
};
