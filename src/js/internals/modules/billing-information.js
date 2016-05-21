var CPF = require("cpf_cnpj").CPF,
    CNPJ = require("cpf_cnpj").CNPJ,
    emailRegex = require("email-regex");

module.exports = (controller) => {

    var billingInformation;

    controller.registerCall("billingInformation::need", function(callback, validator) {
        controller.serverCommunication.call("SELECT FROM 'HARLAN'.'billingInformation'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                success: (response) => {
                    if ((validator && !validator(response)) || !$("BPQL > body > has", response).length) {
                        controller.call("billingInformation::changeAddress", () => {
                            controller.call("billingInformation::need", callback, validator);
                        }, response);
                        return;
                    }
                    callback();
                }
            })));
    });

    controller.registerCall("billingInformation::force", (callback, next) => {
        controller.serverCommunication.call("SELECT FROM 'HARLAN'.'billingInformation'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                success: (response) => {
                    controller.call("billingInformation::changeAddress", () => {
                        if (callback) callback();
                        else
                            toastr.success("Os dados inseridos foram alterados com sucesso.", "Seus dados foram alterados com sucesso.");
                    }, response, next);
                }
            })));
    });

    controller.registerBootstrap("billingInformation", (cb) => {
        cb();
        controller.interface.helpers.menu.add("Empresa", "user").nodeLink.click((e) => {
            e.preventDefault();
            controller.call("billingInformation::force");
        });
    });

    controller.registerCall("billingInformation::changeAddress", (callback, response, next) => {
        var form = controller.call("form", (opts) => {
            controller.serverCommunication.call("UPDATE 'HARLAN'.'billingInformation'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    data: opts,
                    success: () => {
                        if (callback) callback();
                    }
                }, true)));
        });

        var endereco = $("BPQL > body > company > endereco", response),
            document = $("BPQL > body > company > cnpj", response).text() ||
            $("BPQL > body > company > cpf", response).text();
        form.configure({
            "title": "Dados para NF-e",
            "subtitle": "Preencha os dados de faturamento para emissão de nota fiscal.",
            "gamification": "magicWand",
            "paragraph": "É muito importante que os dados estejam preenchidos de maneira correta para que seja a NF-e seja emitida corretamente.",
            "screens": [{
                "nextButton" : next || undefined,
                "magicLabel": true,
                "fields": [
                    [{
                        "name": "name",
                        "optional": false,
                        "type": "text",
                        "value": $("BPQL > body > company > nome", response).text() ||
                            $("BPQL > body > company > responsavel", response).text(),
                        "placeholder": "Nome (PJ / PF)",
                    }, {
                        "maskOptions": {
                            onKeyPress: (input, e, field, options) => {
                                var masks = ['000.000.000-009', '00.000.000/0000-00'],
                                    mask = (input.length > 14) ? masks[1] : masks[0];
                                field.mask(mask, options);
                            }
                        },
                        "name": "document",
                        "placeholder": "CPF / CNPJ",
                        "mask": document.replace(/[^0-9]/g, '').length <= 11 ? "000.000.000-00" : '00.000.000/0000-00',
                        "optional": false,
                        "disabled": CNPJ.isValid(document),
                        "value": document.replace(/[^0-9]/g, ''),
                        validate: (item) => {
                            return CNPJ.isValid(item.element.val()) || CPF.isValid(item.element.val());
                        },
                        validateAsync: function(callback, item, screen, configuration) {
                            callback(true);
                            controller.serverCommunication.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'", {
                                data: {
                                    apiKey: BIPBOP_FREE,
                                    documento: item.element.val()
                                },
                                success: function(response) {
                                    form.setValue('name', $("BPQL > body nome", response).text());
                                }
                            });
                        }
                    }],
                    [{
                        "name": "endereco",
                        "optional": false,
                        "type": "text",
                        "value": endereco.find("endereco:eq(0)").text(),
                        "placeholder": "Endereço",
                    }, {
                        "name": "zipcode",
                        "type": "text",
                        "placeholder": "CEP",
                        "optional": false,
                        "labelText": "CEP",
                        "value": endereco.find("endereco:eq(5)").text(),
                        "mask": "00000-000"
                    }],
                    [{
                        "name": "numero",
                        "optional": false,
                        "type": "text",
                        "numeral": true,
                        "value": endereco.find("endereco:eq(1)").text(),
                        "placeholder": "Número"
                    }, {
                        "name": "complemento",
                        "value": endereco.find("endereco:eq(2)").text(),
                        "type": "text",
                        "optional": true,
                        "placeholder": "Complemento"
                    }],
                    [{
                        "name": "cidade",
                        "value": endereco.find("endereco:eq(4)").text(),
                        "optional": false,
                        "type": "text",
                        "placeholder": "Cidade"
                    }, {
                        "name": "estado",
                        "optional": false,
                        "type": "select",
                        "value": endereco.find("endereco:eq(6)").text(),
                        "placeholder": "Estado",
                        "list": {
                            "": "Escolha um estado",
                            "AC": "Acre",
                            "AL": "Alagoas",
                            "AM": "Amazonas",
                            "AP": "Amapá",
                            "BA": "Bahia",
                            "CE": "Ceará",
                            "DF": "Distrito Federal",
                            "ES": "Espírito Santo",
                            "GO": "Goiás",
                            "MA": "Maranhão",
                            "MT": "Mato Grosso",
                            "MS": "Mato Grosso do Sul",
                            "MG": "Minas Gerais",
                            "PA": "Pará",
                            "PB": "Paraíba",
                            "PR": "Paraná",
                            "PE": "Pernambuco",
                            "PI": "Piauí",
                            "RJ": "Rio de Janeiro",
                            "RN": "Rio Grande do Norte",
                            "RS": "Rio Grande do Sul",
                            "RO": "Rondônia",
                            "RR": "Roraima",
                            "SC": "Santa Catarina",
                            "SP": "São Paulo",
                            "SE": "Sergipe",
                            "TO": "Tocantins"
                        }
                    }], {
                        "name": "email",
                        "optional": false,
                        "type": "text",
                        "value": $("BPQL > body > company email", response).filter((idx, element) => {
                            return $(element).children("email:eq(1)").text() == "financeiro";
                        }).children("email:eq(0)").text(),
                        "placeholder": "E-mail do Financeiro",
                        "validate": (item) => {
                            return emailRegex().test(item.element.val());
                        }
                    }
                ]
            }]
        });

    });

};
