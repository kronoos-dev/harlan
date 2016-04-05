var CPF = require("cpf_cnpj").CPF,
    CNPJ = require("cpf_cnpj").CNPJ,
    emailRegex = require("email-regex");

module.exports = (controller) => {

    var billingInformation;

    controller.registerCall("billingInformation::need", function(callback) {
        controller.serverCommunication.call("SELECT FROM 'HARLAN'.'billingInformation'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                success: (response) => {
                    if (!$("BPQL > body > has", response).length) {
                        controller.call("billingInformation::changeAddress", callback, response);
                        return;
                    }
                    callback();
                }
            })));
    });

    controller.registerCall("billingInformation::changeAddress", (callback, response) => {
        var form = controller.call("form", (opts) => {
            controller.serverCommunication.call("UPDATE 'HARLAN'.'billingInformation'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    data: opts,
                    success: () => {
                        callback();
                    }
                }, true)));
        });

        var endereco = $("BPQL > body > company > endereco", response),
            document = $("BPQL > body > company > cnpj", response).text() ||
                $("BPQL > body > company > cpf", response).text();
        form.configure({
            "title": "Dados de Faturamento",
            "subtitle": "Preencha os dados de faturamento para emissão de nota fiscal.",
            "gamification": "magicWand",
            "paragraph": "É muito importante que os dados estejam preenchidos de maneira correta para que seja a nota seja emitida corretamente.",
            "screens": [{
                "magicLabel": true,
                "fields": [
                    [{
                        "name": "name",
                        "optional": false,
                        "type": "text",
                        "value": $("BPQL > body > company > nome", response).text() ||
                            $("BPQL > body > company > responsavel", response).text(),
                        "placeholder": "Nome da Empresa ou Próprio",
                    }, {
                        "maskOptions": {
                            onKeyPress: (input, e, field, options) => {
                                var masks = ['000.000.000-009', '00.000.000/0000-00'],
                                    mask = (input.length > 14) ? masks[1] : masks[0];
                                field.mask(mask, options);
                            }
                        },
                        "name": "document",
                        "placeholder": "CPF ou CNPJ de faturamento",
                        "mask": document.replace(/[^0-9]/, '').length <= 11 ? "000.000.000-00" : '00.000.000/0000-00',
                        "optional": false,
                        "value": document,
                        validate: (item) => {
                            return CNPJ.isValid(item.element.val()) || CPF.isValid(item.element.val());
                        },
                        validateAsync: function(callback, item, screen,configuration, form) {
                            callback(true);
                            controller.serverCommunication.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'", {
                                    data: {
                                        apiKey: BIPBOP_FREE,
                                        documento: item.element.val()
                                    },
                                    success: function(response) {
                                        form.setValue('name', $("BPQL > body nome", response).text());
                                    },
                                    error: function() {
                                        usernameElement.addClass("error");
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
                        "value": endereco.find("endereco:eq(4)").text(),
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
                        "value": endereco.find("endereco:eq(5)").text(),
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
                            "RO": "Rondônia",
                            "RS": "Rio Grande do Sul",
                            "RR": "Roraima",
                            "SC": "Santa Catarina",
                            "SE": "Sergipe",
                            "SP": "São Paulo",
                            "TO": "Tocantins"
                        }
                    }],
                    {
                        "name": "email",
                        "optional": false,
                        "type": "text",
                        "value": $("BPQL > body > company email", response).filter((idx, element) => {
                            return $(element).children("email:eq(1)") == "financeiro";
                        }).children("email:eq(0)").text(),
                        "placeholder": "Endereço de E-mail do Financeiro",
                        "validate": (item) => {
                            return emailRegex().test(item.element.val());
                        }
                    }
                ]
            }]
        });

    });

};
