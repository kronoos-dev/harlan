/* global module */

module.exports = function (controller) {

    controller.endpoint.subaccountCreate = "INSERT INTO 'IChequesProfile'.'SUBACCOUNT'";

    controller.call("subaccount::formDescription", {
        "title": "Criação de Subconta",
        "subtitle": "Preencha os dados abaixo.",
        "paragraph": "As subchaves possibilitam você trabalhar em um cadastro independente.",
        "gamification": "star",
        "screens": [
            {
                "magicLabel": true,
                "fields": [
                    [{
                            "name": "name",
                            "type": "text",
                            "placeholder": "Nome do Responsável",
                            "optional": true,
                            "labelText": "Nome do Responsável"
                        },
                        {
                            "name": "zipcode",
                            "type": "text",
                            "placeholder": "CEP",
                            "optional": true,
                            "labelText": "CEP",
                            "mask": "00000-000"
                        }],
                    [{
                            "name": "email",
                            "type": "text",
                            "placeholder": "E-mail",
                            "optional": false,
                            "labelText": "E-mail"
                        },
                        {
                            "name": "phone",
                            "type": "text",
                            "placeholder": "Telefone (opcional)",
                            "labelText": "Telefone",
                            "mask": "(00) 0000-00009",
                            "optional": true
                        }],
                    [{
                            "name": "password",
                            "type": "password",
                            "placeholder": "Senha",
                            "labelText": "Senha",
                            "optional": false
                        },
                        {
                            "name": "repeat-password",
                            "type": "password",
                            "placeholder": "Repita sua Senha",
                            "labelText": "Repita sua Senha",
                            "optional": false
                        }],
                    {
                        "name": "cnpj",
                        "type": "text",
                        "placeholder": "CNPJ",
                        "labelText": "CNPJ",
                        "mask": "00.000.000/0000-00",
                        "optional": false,
                        "maskOptions": {
                            "reverse": true
                        }
                    },
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
