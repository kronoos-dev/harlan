/* global numeral */

var sprintf = require("sprintf"),
    escaper = require("true-html-escape");

module.exports = (controller) =>  {

    var companyCredits = 0;

    var defaultChargeCallback = (ret, callback) =>  {
        var modal = controller.call("modal");
        modal.title("Parabéns! Seus créditos foram carregados.");
        modal.subtitle("Um e-mail foi enviado para sua caixa de entrada com todos os detalhes.");
        var form = modal.createForm();
        form.element().submit((e) =>  {
            e.preventDefault();
            if (callback)
                callback();
            modal.close();
        });
        form.addSubmit("cancel", "Sair");
    };

    var changeCredits = (credits) =>  {
        companyCredits = credits;
        $(".credits span").text(numeral(credits / 100).format('0,0.00'));
    };

    controller.registerCall("credits::has", (needed, callback) => {
        controller.call("authentication::need", () => {
            var modal = controller.call("modal"),
                missing = companyCredits - needed,
                form, actions;

            if (missing < 0) {
                modal.title("Você precisa de créditos!");
                modal.subtitle("Para continuar essa operação você precisa adquirir créditos.");
                modal.addParagraph(sprintf("Estão faltando %s para você poder continuar, adquira créditos.", numeral(Math.abs(missing) / 100).format("$0,0.00")));
                form = modal.createForm();
                form.element().submit((e) =>  {
                    e.preventDefault();
                    modal.close();
                    controller.call("credits::buy", Math.abs(missing), (ret) =>  {
                        defaultChargeCallback(ret, callback);
                    });
                });
                form.addSubmit("submit", "Adquirir Créditos");
                actions = modal.createActions();
                actions.add("Cancelar").click(() => {
                    modal.close();
                });
            } else {
                var credits = numeral(needed / 100.0).format("$0,0.00");
                modal.title("Vamos debitar de seus créditos");
                modal.subtitle(sprintf("O valor para esta operação ficou em %s.", credits));
                modal.addParagraph(sprintf("Serão debitados %s de sua conta, para aceitar clique em prosseguir.", numeral(needed / 100.0).format("$0,0.00")));
                form = modal.createForm();
                form.element().submit((e) =>  {
                    e.preventDefault();
                    modal.close();
                    callback();
                });

                form.addSubmit("submit", "Prosseguir");
                actions = modal.createActions();

                actions.add("Cancelar").click(() => {
                    modal.close();
                });
            }
        });
    });

    if (controller.query.recharge === "true" && controller.query.apiKey) {
        controller.registerTrigger("call::authentication::loggedin", "recharge", (data, cb) => {
            cb();
            controller.call("credits::buy");
        });
    }

    controller.registerTrigger("authentication::authenticated", "credits::authentication::authenticated", (ret, callback) =>  {
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

    controller.registerTrigger("serverCommunication::websocket::authentication", "credits", (data, callback) =>  {
        changeCredits(data && data.credits ? data.credits : 0);
        callback();
    });

    controller.registerTrigger("serverCommunication::websocket::credits", "credits", (data, callback) =>  {
        changeCredits(data && data.credits ? data.credits : 0);
        callback();
    });

    controller.registerCall("credits::charge", (value, quantity, description, callback) =>  {
        var modal = controller.call("modal");
        modal.title("Método de Pagamento");
        modal.subtitle("Selecione o Método de Pagamento");
        var form = modal.createForm();

        form.element().submit((e) =>  {
            e.preventDefault();
            modal.close();
            controller.call("credits::charge::creditCard", value, quantity, description, callback);
        });

        form.addSubmit("creditcard", "Cartão de Crédito");
        form.addSubmit("bankslip", "Boleto Bancário").click((e) =>  {
            e.preventDefault();
            modal.close();
            controller.call("credits::charge::bankSlip", value, quantity, description);
        });

        modal.createActions().add(controller.i18n.system.cancel()).click((e) =>  {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("credits::charge::bankSlip", (value, quantity, description) =>  {
        var unregister = $.bipbopLoader.register();
        controller.serverCommunication.call("SELECT FROM 'HarlanCredits'.'PurchaseBankSlip'", controller.call("error::ajax", {
            data: {
                description: description || "Recarga de créditos",
                value: value,
                quantity: quantity || 1
            },
            success: (data) =>  {
                controller.call("alert", {
                    icon: "pass",
                    title: "Seu pagamento foi gerado com sucesso!",
                    subtitle: "O pagamento com boleto bancário leva um dia útil para ser compensado.",
                    paragraph: "O link com o boleto foi encaminhado para seu e-mail. Se preferir você pode acessá-lo <a href='" + escaper.escape($("BPQL > body secure_url", data).text()) + "' target='_blank'>clicando aqui</a> ou usar o código de barras abaixo para pagar através de seu smartphone. <img src='" + escaper.escape($("BPQL > body barcode", data).text()) + "' title='Código de Barras' style='display: block; margin: auto; margin: 20px auto;' />"
                });
            },
            complete: () => {
                unregister();
            }
        }));
    });

    controller.registerCall("credits::charge::creditCard", (value, quantity, description, callback) =>  {
        controller.call("authentication::need", () => {
            callback = callback || defaultChargeCallback;
            quantity = quantity || 1;

            controller.call("iugu::requestPaymentToken", (token) =>  {
                controller.serverCommunication.call("SELECT FROM 'HARLANCREDITS'.'PURCHASE'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            description: description || "Recarga de créditos",
                            value: value,
                            token: token.id,
                            quantity: quantity
                        },
                        success: (ret) =>  {
                            callback(ret);
                        }
                    })));
            });
        });
    });

    controller.registerCall("credits::buy", (minValue, callback) =>  {
        controller.call("authentication::need", () => {
            controller.call("billingInformation::need", () => {
                minValue = minValue || 0;
                var modal = controller.call("modal");

                modal.title("Carregar a Conta de Créditos");
                modal.subtitle("Selecione a opção de créditos desejada.");
                modal.addParagraph("Para continuar desfrutando de todos os recursos da plataforma recarregue sua conta, veja qual opção abaixo se encaixa melhor dentro da sua necessidade.");
                var form = modal.createForm(),
                    list = form.createList();

                var charge = (value) =>  {
                    return (e) =>  {
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
    });

    controller.registerBootstrap("credits", (callback) =>  {
        callback();
        $("#action-credits").click((e) =>  {
            controller.call("credits::buy");
        });
    });

};
