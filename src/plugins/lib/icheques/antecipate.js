import _ from 'underscore';
import {
    queue
} from 'async';

/* global module, numeral */

module.exports = function(controller) {

    /* List Banks */
    controller.registerCall("icheques::antecipate", function(checks) {

        var noAmmountChecks = _.filter(checks, (obj) => {
            return !obj.ammount;
        });



        if (noAmmountChecks.length) {
            controller.call("confirm", {
                icon: "fail",
                title: "Você não preencheu o valor de alguns cheques.",
                subtitle: `Você precisa configurar o valor de ${noAmmountChecks.length}
                    ${noAmmountChecks.length == 1 ? "cheque" : "cheques"} para poder continuar.`,
                paragraph: "Tudo que precisar ser editado com o valor será aberto para que você possa repetir esta operação, edite e tente novamente.",
            }, () => {
                var q = queue(controller.reference("icheques::item::setAmmount"), 1);

                q.push(noAmmountChecks, (err) => {

                    if (err) {
                        q.kill();
                    }
                });

                q.drain = () => {
                    controller.call("icheques::antecipate", checks);
                };

                controller.call("icheques::show", noAmmountChecks);

            });
            return;
        }

        controller.serverCommunication.call("SELECT FROM 'ICHEQUESBANK'.'BANKS'",
            controller.call("loader::ajax", controller.call("error::ajax", {
                data: {
                    filter: "icheques"
                },
                success: function(ret) {
                    controller.call("icheques::antecipate::show", ret, checks);
                }
            })));
    });


    controller.registerCall("icheques::antecipate::show", function(data, checks) {
        var banks = $("BPQL > body > banks > node", data);

        if (!banks.length) {
            controller.call("alert", {
                title: "Você não tem o perfil aprovado por nenhum fundo.",
                subtitle: "Atualize seus dados bancários, cadastrais e procure uma factoring iCheques para habilitar essa função."
            });
            return;
        }

        var modal = controller.call("modal");
        modal.gamification("moneyBag");
        modal.title("Factorings iCheques");
        modal.subtitle("Relação de Factorings iCheques Habilitadas");
        modal.addParagraph("Selecione a Factoring iCheque que deseja enviar sua carteira de cheques.");

        var form = modal.createForm(),
            list = form.createList();

        banks.each(function(i, element) {
            list.add("fa-share", [
                $("name", element).text(),
                $("actualRisk", element).text(),
                numeral($("tax", element).text()).format("0%"),
                numeral($("accountLimit", element).text()).format("$0,0.00")
            ]).click(function(e) {
                controller.call("confirm", {
                    title: "Você deseja realmente antecipar estes títulos?",
                    subtitle: "Será enviado um e-mail para factoring solicitando aprovação.",
                    paragraph: "Os cheques não poderão serem processados novamente, você deverá aguardar a aprovação ou rejeição. A factoring reserva o direito de aceitar apenas alguns títulos de sua carteira."
                }, function() {
                    e.preventDefault();
                    controller.serverCommunication.call("INSERT INTO 'ICHEQUES'.'ANTECIPATE'",
                        controller.call("error::ajax", controller.call("loader::ajax", {
                            method: "post",
                            contentType: "application/json",
                            data: JSON.stringify({
                                factoring: $("id", element),
                                checks: checks
                            }),
                            success: function() {
                                controller.call("alert", {
                                    icon: "pass",
                                    title: "Seus cheques foram enviados",
                                    subtitle: "Aguarde a resposta do fundo em sua caixa eletrônica"
                                });
                            }
                        })));
                });
            });
        });

        modal.createActions().add("Sair").click(function(e) {
            e.preventDefault();
            modal.close();
        });

    });

};
