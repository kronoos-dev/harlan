var loaded = false;
const MAX_RESULTS = 10;
var _ = require("underscore");
module.exports = function(controller) {

    controller.endpoint.adminReport = "SELECT FROM 'BIPBOPCOMPANYSREPORT'.'REPORT'";

    controller.registerTrigger("serverCommunication::websocket::authentication", "admin::reference::websocket::authentication", function(data, callback) {
        callback();

        if (loaded || !data.adminOf || !data.adminOf.length) {
            /* apenas para admins */
            return;
        }

        loaded = true;

        require("./autocomplete")(controller);
        require("./instant-search")(controller);
        require("./create-company")(controller);
        require("./view-company")(controller);
        require("./change-password")(controller);
        require("./change-address")(controller);
        require("./change-contract")(controller);
        require("./change-company")(controller);
        require("./email")(controller);
        require("./phone")(controller);
        require("./report")(controller);

        controller.registerCall("admin::index", () => {
            var report = controller.call("report", "Administrador da Conta", "Administre os usuários cadastrados no sistema.",
                "Altere dados cadastrais como CPF, CNPJ, telefones, emails e endereço, bloqueie, desbloqueie, crie " +
                " novos usuários, verifique o consumo de seus clientes e quantos créditos eles possuem em suas contas.");

            report.button("Criar Conta", () => {
                controller.call("admin::createCompany");
            });

            report.button("Abrir Contas", () => {
                var skip = 0;
                var results = controller.call("moreResults", MAX_RESULTS).callback((callback) => {
                    controller.serverCommunication.call("SELECT FROM 'BIPBOPCOMPANYS'.'LIST'",
                        controller.call("loader::ajax", controller.call("error::ajax", {
                            data: {
                                limit: MAX_RESULTS,
                                skip: skip
                            },
                            success: (response) => {
                                callback(_.map($("BPQL > body > company", response), (company) => {
                                    return controller.call("admin::viewCompany", company, false, null, true);
                                }));
                            }
                        })));
                    skip += MAX_RESULTS;
                }).appendTo(report.element()).show((i, items) => {
                    if (!i)
                        controller.call("alert", {
                            title: "Infelizmente não há nenhuma empresa para exibir. ;(",
                            subtitle: "Experimente adicionar alguma empresa pois não há nenhuma cadastrada para exibição.",
                            paragraph: "Você precisa cadastrar uma empresa para utilizar este recurso, verifique na sua página de usuário," +
                                " pelo botão de <a href=\"javascript:harlan.call('admin::createCompany');'>Criar Conta</strong>"
                        });
                });
            });

            report.gamification("accuracy");
            $(".app-content").append(report.element());
            controller.call("admin::report", (graph) => {
                graph.gamification("levelUp");
            }, report.element());
        });


        controller.call("admin::index");

        controller.trigger("admin");
    });
};
