import { CNPJ } from "cpf_cnpj";

module.exports = function(controller) {

    controller.registerTrigger("mainSearch::submit", "juntaEmpresa::submit", function(val, callback) {
        callback();
        if (CNPJ.isValid(val)) {
            controller.call("juntaEmpresa", val);
        }
    });

    controller.registerCall("juntaEmpresa", function(val, callback) {
        if (!CNPJ.isValid(val)) {
            toastr.warning("Preencha um CNPJ válido para poder continuar.",
                "O CNPJ preenchido não é válido.");
        }
        controller.serverCommunication.call("SELECT FROM 'JUNTAEMPRESA'.'CONSULTA'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                data: {
                    documento: val
                },
                success: function(ret) {
                    controller.call("juntaEmpresa::parse", ret, val, callback);
                }
            })));
    });

    controller.registerCall("juntaEmpresa::parse", function(ret, val, callback) {
        var sectionDocumentGroup = controller.call("section", "Junta Empresa",
            "Informações agregadas do CNPJ",
            "1 registro encontrado");

        if (!callback) {
            $(".app-content").prepend(sectionDocumentGroup[0]);
        } else {
            callback(sectionDocumentGroup[0]);
        }

        var juntaEmpresaHTML = controller.call("xmlDocument", ret, "JUNTAEMPRESA", "CONSULTA");
        juntaEmpresaHTML.find(".container").first().addClass("xml2html")
            .data("document", $(ret))
            .data("form", [{
                name: "documento",
                value: val
            }]);
        sectionDocumentGroup[1].append(juntaEmpresaHTML);
    });

};
