var squel = require("squel");

const checkQuery = squel
    .select()
    .from('ICHEQUES_CHECKS')
    .field('SUM(AMMOUNT), COUNT(1)')
    .where("(QUERY_STATUS = 1) AND (EXPIRE > ?) AND (OPERATION = 0)", moment().format("YYYYMMDD"))
    .toString();

const obtainChecks = squel
    .select()
    .from('ICHEQUES_CHECKS')
    .where("(EXPIRE > ?) AND (OPERATION = 0)", moment().format("YYYYMMDD"))
    .toString();

module.exports = controller => {

    var update = null;

    controller.registerTrigger("call::authentication::loggedin", "canAntecipate", function(args, callback) {
        callback();
        controller.call("icheques::canAntecipate");
    });

    var element = null;

    controller.registerCall("icheques::cantAntecipate", () => {
        var report = controller.call("report",
            "Você procura antecipar cheques?",
            "Receba o dinheiro antes, não espere até o vencimento.",
            "Com o iCheques você pode solicitar a antecipação dos seus cheques através de um dos nossos parceiros financeiros. Clique no botão abaixo para iniciar o processo de cadastro.");

        report.button("Quero Antecipar Cheques!", () => {
            controller.call("icheques::register::all");
        }).addClass("green-button");

        report.gamification("checkPoint");

        if (element) {
            element.replaceWith(report.element());
        }
        element = report.element();
        $(".app-content").prepend(element);
    });

    controller.registerCall("icheques::canAntecipate", () => {
        var [ammount, count] = controller.database.exec(checkQuery)[0].values[0];
        if (!count) {
            controller.call("icheques::cantAntecipate");
            return;
        }

        var report = controller.call("report",
            "Parabéns! Você possui cheques bons para antecipação.",
            "Receba o dinheiro antes, descontamos depois para sua comodidade.", !ammount ?
            `Com o iCheques você pode solicitar a antecipação dos seus <strong>${count}</strong> ${count == 1 ? "cheque" : "cheques"} através de uma das nossas antecipadoras. Clique no botão abaixo para iniciar o processo.` :
            `Com o iCheques você pode solicitar a antecipação dos seus <strong>${count}</strong> ${count == 1 ? "cheque de valor" : "cheques que somam"} <strong>${numeral(ammount/100).format('$0,0.00')}<\/strong> através de uma das nossas antecipadoras. Clique no botão abaixo para iniciar o processo.`);

        report.button("Solicitar Antecipação", () => {
            var checks = controller.call("icheques::resultDatabase", controller.database.exec(obtainChecks)[0]).values;
            controller.call("icheques::antecipate", checks);
        }).addClass("green-button");

        report.gamification("checkPoint");

        if (element) {
            element.replaceWith(report.element());
        }
        element = report.element();
        $(".app-content").prepend(element);
    });

    controller.registerTrigger("icheques::deleted",
        "canAntecipate", (obj, cb) => {
            cb();
            controller.call("icheques::canAntecipate");
        });


    controller.registerTrigger("serverCommunication::websocket::ichequeUpdate",
        "canAntecipate", (obj, cb) => {
            cb();
            controller.call("icheques::canAntecipate");
        });

};
