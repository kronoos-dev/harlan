/* global numeral, module, harlan, moment */

var documentValidator = require("cpf_cnpj");

var validateCPF = function (item) {
    return documentValidator.CPF.isValid(item.element.val());
};

var validateCNPJ = function (item) {
    var value = item.element.val();
    if (value === null) {
        return true;
    }
    return documentValidator.CNPJ.isValid(value);
};

module.exports = function (controller) {

    controller.registerCall("bipbop::createAccount::submit", function (formData, creditCard) {
        var unregister = $.bipbopLoader.register();
        controller.serverCommunication.call("SELECT FROM 'BIPBOP'.'CHECKOUT'", controller.call("error::ajax", {
            method: "POST",
            data: {
                "parameters": $.param($.extend({}, formData, creditCard))
            },
            success: function () {
                controller.call("alert", {
                    icon: "pass",
                    title: "Parabéns! Agora você tem uma conta BIPBOP.",
                    subtitle: "Enviamos um e-mail com as informações de acesso.",
                    paragraph: "Verifique seu e-mail para adquirir a senha de acesso. \
Caso não encontre aguarde alguns instantes e verifique novamente sua caixa de entrada e lixo eletrônico."
                });
            },
            complete: function () {
                unregister();
            }
        }));
    });

    controller.registerCall("bipbop::createAccount", function () {

        var form = controller.call("form", function (formData) {
            controller.call("getCreditCard", function (creditCard) {
                controller.call("bipbop::createAccount::submit", formData, {
                    "cc-nome": creditCard.first_name + " " + creditCard.last_name,
                    "cc": creditCard.number,
                    "cc-exp": creditCard.month + " / " + creditCard.year,
                    "cc-cvv": creditCard.verification_value
                });
            }, {
                title: "Configurar Método de Pagamento",
                subtitle: "Configure seu método de pagamento para continuar.",
                paragraph: "É necessário que você informe seu cartão de crédito para poder criar a conta.",
                submit: "Criar Conta"
            });
        });

        form.configure({
            "title": "Criar uma Conta BIPBOP",
            "subtitle": "Tenha acesso ao melhor do Harlan.",
            "paragraph": "Com uma única conta BIPBOP você pode acessar vários de nossos serviços.",
            "screens": [
                {
                    "magicLabel": true,
                    "fields": [
                        [{
                                "name": "email",
                                "optional": false,
                                "type": "text",
                                "placeholder": "Endereço de E-mail",
                                "labelText": "E-mail"
                            }, {
                                "name": "cpf",
                                "optional": false,
                                "type": "text",
                                "placeholder": "Número do CPF",
                                "labelText": "CPF",
                                "mask": "000.000.000-00",
                                "validate": validateCPF
                            }],
                        [{
                                "name": "cep",
                                "optional": false,
                                "type": "text",
                                "placeholder": "CEP",
                                "labelText": "CEP",
                                "mask": "00000-000"
                            }, {
                                "name": "telefone",
                                "optional": false,
                                "type": "text",
                                "placeholder": "Número Telefone",
                                "labelText": "Telefone",
                                "mask": "(00) 90000-0000"

                            }],
                        [{
                                "name": "nascimento",
                                "optional": false,
                                "type": "text",
                                "placeholder": "Data de Nascimento",
                                "pikaday": true,
                                "mask": "00/00/0000",
                                getValue: function (item) {
                                    return moment(item.element.val(),
                                            controller.i18n.pikaday.format).isValid() ? item.element.val() : null;
                                }
                            }, {
                                "name": "cnpj",
                                "optional": false,
                                "type": "text",
                                "placeholder": "CNPJ",
                                "mask": "00.000.000/0000-00",
                                "validate": validateCNPJ
                            }]
                    ]}, {
                    magicLabel: true,
                    fields: [
                        {
                            "name": "nome",
                            "optional": false,
                            "type": "text",
                            "placeholder": "Nome Completo"
                        },
                        {
                            "name": "endereco",
                            "optional": false,
                            "type": "text",
                            "placeholder": "Endereço"
                        },
                        [{
                                "name": "numero",
                                "optional": false,
                                "type": "text",
                                "numeral": true,
                                "placeholder": "Número"
                            },
                            {
                                "name": "complemento",
                                "type": "text",
                                "optional": true,
                                "placeholder": "Complemento"
                            }],
                        [{
                                "name": "cidade",
                                "optional": false,
                                "type": "text",
                                "placeholder": "Cidade"
                            },
                            {
                                "name": "estado",
                                "optional": false,
                                "type": "select",
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
                            }]
                    ]
                }
            ]
        });
    });
};