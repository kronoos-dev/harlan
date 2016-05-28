var cpf_cnpj = require("cpf_cnpj"),
    async = require("async"),
    _ = require("underscore");

var isRunning = false,
    runnerGenerator = (callback) => {
        return () => {
            callback();
            isRunning = false;
        };
    };

module.exports = function(controller) {

    controller.unregisterTriggers("findDatabase::instantSearch", [
        "admin::createCompany",
        "admin::index",
        "admin::listCompany"
    ]);


    controller.unregisterTriggers("mainSearch::submit", [
        "juntaEmpresa::submit"
    ]);

    controller.registerTrigger("mainSearch::submit", "kronoos", (value, callback) => {
        if (isRunning) {
            callback();
        }
        isRunning = true;
        controller.call("kronoos::search", value, runnerGenerator(callback));
    });

    controller.registerTrigger("findDatabase::instantSearch", "kronoos::findDatabase::instantSearch", (args, callback) => {
        if (isRunning) {
            callback();
        }
        var [value, autocomplete] = args;
        isRunning = true;
        controller.call("kronoos::search", value, runnerGenerator(callback));
    });

    controller.registerCall("kronoos::search", (value, callback) => {
        var formatted = value.replace(/[^\d]/g, "").replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"),
            tipoDocumento = "CPF";
        if (cpf_cnpj.CPF.isValid(value)) {

        } else if (cpf_cnpj.CNPJ.isValid(value)) {
            formatted = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
            tipoDocumento = "CNPJ";
        } else {
            callback();
            return;
        }

        var [section, results, actions] = controller.call("section",
            `Relatório Kronoos`,
            `Pesquisa para o ${tipoDocumento} ${formatted}`,
            `Visualizar apontamentos cadastrais Kronoos`);

        section.addClass("kronoos-group");


        controller.serverCommunication.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'",
            controller.call("error::ajax", {
                data: {
                    documento: value,
                },
                error: () => {
                    callback();
                },
                success: (xml) => {

                    let resultDate = controller.call("result");
                    var name;
                    resultDate.addItem("Nome", name = $("BPQL > body nome", xml).text());
                    resultDate.addItem("Data da Consulta", moment().format("DD/MM/YYYY"));
                    resultDate.addItem("Hora da Consulta", moment().format("h:mm:ss a"));
                    results.append(resultDate.element());

                    async.parallel([(callback) => {
                        controller.serverCommunication.call("SELECT FROM 'KRONOOSUSER'.'API'", {
                            cache: true,
                            data: {
                                documento: value,
                                name: `"${$("BPQL > body nome", xml).text()}"`
                            },
                            success: (xml) => {
                                results.append(controller.call("xmlDocument", xml, 'KRONOOSUSER', 'API'));
                            },
                            complete: () => {
                                callback();
                            }
                        });
                    }], () => {
                        callback();
                        $(".app-content").prepend(section);
                        if (cpf_cnpj.CNPJ.isValid(value)) {
                            controller.call("juntaEmpresa", value, (element) => {
                                element.insertAfter(section);
                            });
                        }
                        if (name) {
                            controller.call("kronoos::juristek::name", name, (procs) => {
                                _.each(procs, (proc) => {
                                    controller.call("kronoos::juristek", proc, section, (err, element) => {
                                        if (!err && element)
                                            element.insertAfter(section);
                                    });
                                });
                            });
                        }
                    });
                }
            }));
    });
};
