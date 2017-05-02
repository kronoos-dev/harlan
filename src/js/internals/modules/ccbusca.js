var CPF = require("cpf_cnpj").CPF;
var CNPJ = require("cpf_cnpj").CNPJ;

module.exports = (controller) => {

    controller.registerCall("ccbusca::enable", () => {
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
        let ccbuscaQuery = {
            documento: val
        };

        if (CNPJ.isValid(val)) {
            ccbuscaQuery['q[0]'] = "SELECT FROM 'CCBUSCA'.'BILLING'";
            ccbuscaQuery['q[1]'] = "SELECT FROM 'RFB'.'CERTIDAO'";
        }

        controller.serverCommunication.call("SELECT FROM 'CCBUSCA'.'BILLING'",
        controller.call("error::ajax", controller.call("loader::ajax", {
            data: ccbuscaQuery,
            success: function(ret) {
                controller.call("ccbusca::parse", ret, val, callback);
            }
        })));
    });

    controller.registerCall("ccbusca::parse", function(ret, val, callback) {

        var sectionDocumentGroup = controller.call("section", "Busca Consolidada",
        "Informações agregadas do CPF ou CNPJ",
        "Registro encontrado");

        let subtitle = $(".results-display", sectionDocumentGroup[0]);
        let messages = [subtitle.text()];
        let appendMessage = (message) => {
            messages.push(message);
            subtitle.text(messages.join(", "));
        };

        if (!callback) {
            $(".app-content").prepend(sectionDocumentGroup[0]);
        } else {
            callback(sectionDocumentGroup[0]);
        }

        controller.call("tooltip", sectionDocumentGroup[2], "Imprimir").append($("<i />").addClass("fa fa-print")).click((e) => {
            e.preventDefault();
            var html = sectionDocumentGroup[0].html(),
                printWindow = window.open("about:blank", "", "_blank");
            if (!printWindow) return;
            printWindow.document.write($("<html />")
                .append($("<head />"))
                .append($("<body />").html(html)).html());
            printWindow.focus();
            printWindow.print();
        });

        var juntaEmpresaHTML = controller.call("xmlDocument", ret);
        juntaEmpresaHTML.find(".container").first().addClass("xml2html")
            .data("document", $(ret))
            .data("form", [{
                name: "documento",
                value: val
            }]);
        sectionDocumentGroup[1].append(juntaEmpresaHTML);

        (function () {
            let totalRegistro = parseInt($(ret).find("BPQL > body > data > resposta > totalRegistro").text());
            if (!totalRegistro) {
                appendMessage("sem cheques devolvidos");
                return;
            }
            let qteOcorrencias = $(ret).find("BPQL > body > data > sumQteOcorrencias").text();
            let v1 = moment($("dataUltOcorrencia", ret).text(), "DD/MM/YYYY"),
                v2 = moment($("ultimo", ret).text(), "DD/MM/YYYY");
            appendMessage(`total de registros CCF: ${qteOcorrencias} com data da última ocorrência: ${(v1.isAfter(v2) ? v1 : v2).format("DD/MM/YYYY")}`);
            sectionDocumentGroup[1].append(controller.call("xmlDocument", ret, "SEEKLOC", "CCF"));
        })();

        (function () {
            if ($(ret).find("BPQL > body > consulta > situacao").text() != "CONSTA") {
                appendMessage("sem protestos");
                return;
            }
            let totalProtestos = $("protestos", ret)
                .get()
                .map((p) => parseInt($(p).text()))
                .reduce((a, b) => a + b, 0);
            appendMessage(`total de protestos: ${totalProtestos}`);
            sectionDocumentGroup[1].append(controller.call("xmlDocument", ret, "IEPTB", "WS"));
        })();
    });
};
