/* global module */

module.exports = function (controller) {

    controller.registerCall("icheques::welcome", function (ret) {

        var report = controller.call("report",
                "Seja bem vindo ao iCheques",
                "Se proteja contra fraudes em sua carteira de cheques.",
                "O iCheques é uma ferramenta desenvolvida para você evitar golpes em sua carteira de cheques, saiba da situação de um cheque sempre antes de aceitar e enquanto ele estiver com você.",
                false);

        report.button("Adicionar Cheque", function () {
            controller.call("icheques::newcheck");
        });

        report.button("Dados Cadastrais", function () {
            controller.call("icheques::form::company");
        });

//        switch ($("BPQL > body > type", ret).text()) {
//            case "credit-anticipator":
//                report.button("Adicionar Fundo", function () {
//                    /* cria subchave */
//                });
//                break;
//
//            case "retail":
//                report.button("Adicionar Empresa", function () {
//                    /* cria subchave */
//                });
//                break;
//        }
//        report.button("Dados Bancários", function () {
//            controller.call("icheques::form::bank");
//        });

        report.gamification("shield");

        $(".app-content").prepend(report.element());

        controller.call("icheques::reference", ret);
    });

    controller.registerTrigger("call::authentication::loggedin", "icheques::welcome", function (args, callback) {
        callback();
        controller.serverCommunication.call("SELECT FROM 'ICHEQUESAUTHENTICATION'.'ANNOTATIONS'", {
            success: function (ret) {
                controller.call("icheques::welcome", ret);
            }
        });
    });

};
