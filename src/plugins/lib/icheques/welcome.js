/* global module */

module.exports = function (controller) {

    controller.registerCall("icheques::welcome", function () {
        
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

        report.button("Dados Bancários", function () {
            controller.call("icheques::form::bank");
        });

        report.gamification("shield");
        
        $(".app-content").prepend(report.element());
        
    });

    controller.registerTrigger("call::authentication::loggedin", "icheques::welcome", function (args, callback) {
        callback();
        controller.call("icheques::welcome");
    });

};