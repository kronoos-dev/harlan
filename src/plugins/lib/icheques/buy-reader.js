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
            var win = window.open("http://www.automatizando.com.br/listaprodutos.asp?idloja=4351&idproduto=1149841&q=leitor-de-cheque-nonus-hand-bank-eco-20&gclid=Cj0KEQiAxMG1BRDFmu3P3qjwmeMBEiQAEzSDLveR71nqCG1EPimTyf-3Nq0N65qdEcJ7AKtEsj8QodIaAvn38P8HAQ", '_blank');
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