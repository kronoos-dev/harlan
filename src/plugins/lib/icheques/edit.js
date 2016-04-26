import {
    CMC7Parser
} from "./cmc7-parser.js";

module.exports = function(controller) {

    controller.registerCall("icheques::item::add::time", (check) => {
        controller.call("confirm", {
            icon: "reload",
            title: "Mais um mês de monitoramento.",
            subtitle: "Confirme que deseja adicionar mais 30 dias de monitoramento.",
            paragraph: "Ao custo de R$ 0,30 (um real e cinquenta centavos) monitore por mais 30 dias seus cheque e fique seguro na hora de depositar."
        }, () => {
            controller.call("credits::has", 30, () => {
                controller.serverCommunication.call("UPDATE 'ICHEQUES'.'ONEMONTH'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: check,
                        success: () => {
                            /* websocket updates =p */
                            toastr.success("Um mês adicionado ao vencimento com sucesso.", "Dados atualizados com sucesso.");
                        }
                    }, true)));
            });
        });
    });

    controller.registerCall("icheques::item::edit", function(check, callback, optionalAmmount = true) {
        var cmc7Data = new CMC7Parser(check.cmc),
            form = controller.call("form", (parameters) => {
                parameters.cmc = check.cmc;
                parameters.ammount = Math.floor(parameters.ammount * 100);
                controller.call("confirm", {}, () => {
                    controller.serverCommunication.call("UPDATE 'ICHEQUES'.'CHECKDATA'",
                        controller.call("error::ajax", controller.call("loader::ajax", {
                            data: parameters,
                            error: function() {
                                if (callback) callback("ajax failed", check);
                            },
                            success: () => {
                                /* websocket updates =p */
                                check.ammount = parameters.ammount;
                                check.observation = parameters.observation;
                                toastr.success("Os dados do cheque foram atualizados com sucesso.", "Dados atualizados com sucesso.");
                                if (callback) callback(null, check);
                            }
                        }, true)));
                }, () => {
                    controller.call("icheques::item::edit", check, callback, optionalAmmount);
                });
            }, () => {
                if (callback) callback("can't edit", check);
            });

        form.configure({
            title: "Edição de Cheque",
            subtitle: "Correção e inserção de dados do cheque.",
            gamification: "magicWand",
            paragraph: `É muito importante que os dados do cheque <strong class="break">${check.cmc}</strong> estejam corretos para que seja mantido um cadastro saneado.`,
            screens: [{
                nextButton: "Alterar Dados",
                magicLabel: true,
                fields: [
                    [{
                        name: "document",
                        type: "text",
                        placeholder: "Documento",
                        labelText: "Documento",
                        disabled: true,
                        optional: true,
                        value: check.cpf || check.cnpj,
                    }, {
                        name: "name",
                        type: "text",
                        placeholder: "Nome",
                        labelText: "Nome do Titular",
                        optional: true,
                        disabled: true
                    }],
                    [{
                        name: "check-number",
                        type: "text",
                        placeholder: "Número do Cheque",
                        labelText: "Número do Cheque",
                        disabled: true,
                        optional: true,
                        value: cmc7Data.number,
                    }, {
                        name: "ammount",
                        type: "text",
                        placeholder: "Valor do Cheque",
                        labelText: "Valor do Cheque",
                        value: check.ammount,
                        mask: "000.000.000.000,00",
                        optional: optionalAmmount,
                        maskOptions: {
                            reverse: true
                        },
                        numeral: true

                    }], {
                        name: "observation",
                        type: "textarea",
                        placeholder: "Observação",
                        labelText: "Observação",
                        optional: true,
                        value: check.observation
                    }
                ]
            }]
        });

        controller.server.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'", {
            data: {
                documento: check.cpf || check.cnpj
            },
            success: (ret) => {
                form.setValue("name", $("BPQL > body nome", ret).text());
            }
        });

    });

    controller.registerCall("icheques::item::setAmmount", function(check, callback) {
        controller.call("icheques::item::edit", check, callback, false);
    });

};
