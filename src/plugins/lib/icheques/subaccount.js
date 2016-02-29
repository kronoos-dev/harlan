/* global module */

module.exports = function (controller) {

    controller.call("subaccount::formDescription", {
        "title": "Criação de Subconta",
        "subtitle": "Preencha os dados abaixo.",
        "paragraph": "As subchaves possibilitam você trabalhar em um cadastro independente.",
        "gamification": "star",
        "screens": [
            {
                "magicLabel": true,
                "fields": [
                    {
                        "name": "alias",
                        "type": "text",
                        "placeholder": "Nome de Usuário",
                        "labelText": "Nome de Usuário"
                    },
                    [{
                            "name": "password",
                            "type": "password",
                            "placeholder": "Senha",
                            "labelText": "Senha"
                        },
                        {
                            "name": "repeat-password",
                            "type": "password",
                            "placeholder": "Repita sua Senha",
                            "labelText": "Repita sua Senha"
                        }],
                    [{
                            "name": "name",
                            "type": "text",
                            "placeholder": "Nome do Responsável (opcional)",
                            "optional": true,
                            "labelText": "Nome do Responsável"
                        },
                        {
                            "name": "zipcode",
                            "type": "text",
                            "placeholder": "CEP (opcional)",
                            "optional": true,
                            "labelText": "CEP",
                            "mask": "00000-000"
                        }],
                    [{
                            "name": "email",
                            "type": "text",
                            "placeholder": "E-mail do Responsável (opcional)",
                            "optional": true,
                            "labelText": "E-mail do Responsável"
                        },
                        {
                            "name": "phone",
                            "type": "text",
                            "placeholder": "Telefone do Responsável (opcional)",
                            "labelText": "Telefone do Responsável",
                            "mask": "(00) 0000-00009",
                            "optional": true
                        }],
                    [{
                            "name": "cpf",
                            "type": "text",
                            "placeholder": "CPF (opcional)",
                            "labelText": "CPF",
                            "mask": "000.000.000-00",
                            "optional": true,
                            "maskOptions": {
                                "reverse": true
                            }
                        },
                        {
                            "name": "cnpj",
                            "type": "text",
                            "placeholder": "CNPJ (opcional)",
                            "labelText": "CNPJ",
                            "mask": "00.000.000/0000-00",
                            "optional": true,
                            "maskOptions": {
                                "reverse": true
                            }
                        }],
                    {
                        "name": "accept",
                        "type": "checkbox",
                        "labelText": "Aceito o <a href=\"/legal/icheques/MINUTA___CONTRATO___CONTA_CORPORATIVA.pdf\" target=\"_blank\">contrato de utilização</a>.",
                        "optional": false
                    }
                ]
            }
        ]
    });

};