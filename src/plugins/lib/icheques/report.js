/*jshint -W083 */
/* global module */

module.exports = function (controller) {

    var dictReports = {
        "icheques::report::overview": {
            findRegex: /cheque/i,
            method: require("./reports/account-overview")(controller)
        }
    };

    for (var i in dictReports) {
        controller.registerCall(i, (showAlert, closeable) => {
            var report = new dictReports[i].method(closeable);
            if (report.showable(showAlert)) {
                $(".app-content").prepend(report.element());
                report.draw();
            }
        });
    }

    controller.registerTrigger("findDatabase::instantSearch", "icheques::report", function (args, callback) {
        callback();
        for (var i in dictReports) {
            if (!dictReports[i].findRegex.test(args[0]))
                continue;
            args[1].item("iCheques", "Relatório Geral de Cheques", "Acesso ao relatório geral de cheques").addClass("icheque").click((e)  => {
                e.preventDefault();
                controller.call(i, true, true);
            });
        }
    });

    controller.registerTrigger("call::authentication::loggedin", "icheques::report::overview", function (args, callback) {
        callback();
        controller.call("icheques::report::overview", false, false);
    });

};
