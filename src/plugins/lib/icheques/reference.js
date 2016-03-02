/* global module */

module.exports = function (controller) {

    controller.registerCall("icheques::reference", function (ret) {

        var report = controller.call("report",
                "Seja bem vindo ao iCheques",
                "Se proteja contra fraudes em sua carteira de cheques.",
                "O iCheques é uma ferramenta desenvolvida para você evitar golpes em sua carteira de cheques, saiba da situação de um cheque sempre antes de aceitar e enquanto ele estiver com você.",
                true);
        

    });

};