/* global module */

module.exports = function (controller) {

    controller.registerTrigger("call::authentication::loggedin", "icheques::buy-reader", function (args, callback) {
        callback();

        if (localStorage.cmc7Reader) {
            return;
        }

        var report = controller.call("report",
                "Compre uma máquina de ler cheques!",
                "Se você trabalha com muitos cheques, chega de perder tempo.",
                "O iCheques é compatível com leitoras de cheques, não perca mais seu tempo digitando o CMC7 dos cheques, use uma leitora.",
                false);

        report.button("Comprar Leitora", function () {
            var win = window.open("http://nonus.lojavirtualfc.com.br/prod,idloja,1617,idproduto,3674706,HandbanK-Eco-20#.VsEOwXUrKWQ", '_blank');
            win.focus();
        });

        report.button("Já Tenho", function () {
            localStorage.cmc7Reader = true;
            report.close();
        });

        report.gamification("star");

        $(".app-content").prepend(report.element());

    });


};