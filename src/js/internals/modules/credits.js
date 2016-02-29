/* global numeral */

var sprintf = require("sprintf"),
        escaper = require("true-html-escape");

module.exports = function (controller) {

    var companyCredits = 0;

    var defaultChargeCallback = function (ret, callback) {
        var modal = controller.call("modal");
        modal.title("Parabéns! Seus créditos foram carregados.");
        modal.subtitle("Um e-mail foi enviado para sua caixa de entrada com todos os detalhes.");
        var form = modal.createForm();
        form.element().submit(function (e) {
            e.preventDefault();
            if (callback)
                callback();
            modal.close();
        });
        form.addSubmit("cancel", "Sair");
    };

    var changeCredits = function (credits) {
        companyCredits = credits;
        $(".credits span").text(numeral(credits / 100).format('0,0.00'));
    };

    controller.registerCall("credits::has", function (needed, callback) {
        controller.call("authentication::need", function () {
            var modal = controller.call("modal"),
                    missing = companyCredits - needed,
                    form, actions;

            if (missing < 0) {
                modal.title("Você precisa de créditos!");
                modal.subtitle("Para continuar essa operação você precisa adquirir créditos.");
                modal.addParagraph(sprintf("Estão faltando %s para você poder continuar, adquira créditos.", numeral(Math.abs(missing) / 100).format("$0,0.00")));
                form = modal.createForm();
                form.element().submit(function (e) {
                    e.preventDefault();
                    modal.close();
                    controller.call("credits::buy", Math.abs(missing), function (ret) {
                        defaultChargeCallback(ret, callback);
                    });
                });
                form.addSubmit("submit", "Adquirir Créditos");
                actions = modal.createActions();
                actions.add("Cancelar").click(function () {
                    modal.close();
                });
            } else {
                var credits = numeral(needed / 100.0).format("$0,0.00");
                modal.title("Vamos debitar de seus créditos");
                modal.subtitle(sprintf("O valor para esta operação ficou em %s.", credits));
                modal.addParagraph(sprintf("Serão debitados %s de sua conta, para aceitar clique em prosseguir.", numeral(needed / 100.0).format("$0,0.00")));
                form = modal.createForm();
                form.element().submit(function (e) {
                    e.preventDefault();
                    modal.close();
                    callback();
                });

                form.addSubmit("submit", "Prosseguir");
                actions = modal.createActions();

                actions.add("Cancelar").click(function () {
                    modal.close();
                });
            }
        });
    });

    controller.registerTrigger("authentication::authenticated", "credits::authentication::authenticated", function (ret, callback) {
        var credits = 0;

        if (ret) {
            var node = $("BPQL > body credits", ret);
            if (node.length) {
                credits = parseInt(node.text());
            }
        }

        changeCredits(credits);
        callback();
    });

    controller.registerTrigger("serverCommunication::websocket::authentication", "credits::update::serverCommunication::websocket::authentication", function (data, callback) {
        changeCredits(data && data.credits ? data.credits : 0);
        callback();
    });

    controller.registerTrigger("serverCommunication::websocket::credits", "credits::update::serverCommunication::websocket::credits", function (data, callback) {
        changeCredits(data && data.credits ? data.credits : 0);
        callback();
    });

    controller.registerCall("credits::charge", function (value, quantity, description, callback) {
        var modal = controller.call("modal");
        modal.title("Método de Pagamento");
        modal.subtitle("Selecione o Método de Pagamento");
        var form = modal.createForm();

        form.element().submit(function (e) {
            e.preventDefault();
            modal.close();
            controller.call("credits::charge::creditCard", value, quantity, description, callback);
        });

        form.addSubmit("creditcard", "Cartão de Crédito");
        form.addSubmit("bankslip", "Boleto Bancário").click(function (e) {
            e.preventDefault();
            modal.close();
            controller.call("credits::charge::bankSlip", value, quantity, description);
        });

        modal.createActions().add(controller.i18n.system.cancel()).click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("credits::charge::bankSlip", function (value, quantity, description) {
        var unregister = $.bipbopLoader.register();
        controller.serverCommunication.call("SELECT FROM 'HarlanCredits'.'PurchaseBankSlip'", controller.call("error::ajax", {
            data: {
                description: description || "Recarga de créditos",
                value: value,
                quantity: quantity || 1
            },
            success: function (data) {
                controller.call("alert", {
                    icon: "pass",
                    title: "Seu pagamento foi gerado com sucesso!",
                    subtitle: "O pagamento com boleto bancário leva 1 dia para ser compensado.",
                    paragraph: "O link com o boleto foi encaminhado para seu e-mail, se preferir você pode acessá-lo <a href='" + escaper.escape($("BPQL > body pdf", data).text()) + "' target='_blank'>clicando aqui</a>."
                });
            },
            complete: function () {
                unregister();
            }
        }));
    });

    controller.registerCall("credits::charge::creditCard", function (value, quantity, description, callback) {
        controller.call("authentication::need", function () {
            callback = callback || defaultChargeCallback;
            quantity = quantity || 1;

            controller.call("iugu::requestPaymentToken", function (token) {
                controller.serverCommunication.call("SELECT FROM 'HARLANCREDITS'.'PURCHASE'",
                        controller.call("error::ajax", controller.call("loader::ajax", {
                            data: {
                                description: description || "Recarga de créditos",
                                value: value,
                                token: token.id,
                                quantity: quantity
                            },
                            success: function (ret) {
                                callback(ret);
                            }
                        })));
            });
        });
    });

    controller.registerCall("credits::buy", function (minValue, callback) {
        controller.call("authentication::need", function () {
            minValue = minValue || 0;
            var modal = controller.call("modal");

            modal.title("Carregar a Conta de Créditos");
            modal.subtitle("Selecione a opção de créditos desejada.");
            modal.addParagraph("Algumas consultas na BIPBOP exigem créditos para serem realizadas, recarregue sua conta já.");
            var form = modal.createForm(),
                    list = form.createList();

            var charge = function (value) {
                return function (e) {
                    e.preventDefault();
                    modal.close();
                    controller.call("credits::charge", value, null, null, callback);
                };
            };

            if (minValue < 2500) {
                list.add("fa-dollar", "Recarregar R$ 25,00.").click(charge(2500));
            }

            if (minValue < 5000) {
                list.add("fa-dollar", "Recarregar R$ 50,00.").click(charge(5000));
            }

            if (minValue < 1000) {
                list.add("fa-dollar", "Recarregar R$ 100,00.").click(charge(10000));
            }

            if (minValue < 50000) {
                list.add("fa-dollar", "Recarregar R$ 500,00.").click(charge(50000));
            }

            if (minValue < 100000) {
                list.add("fa-dollar", "Recarregar R$ 1.000,00.").click(charge(100000));
            }

            form.cancelButton();
        });
    });

    controller.registerBootstrap("credits", function (callback) {
        callback();
        $("#action-credits").click(function (e) {
            controller.call("credits::buy");
        });
    });

};
