import { paramCase } from 'change-case';

var formDescription = {
    "title": "Cadastro Completo",
    "subtitle": "Realize o cadastro completo de sua empresa.",
    "paragraph": "O cadastro completo permite a realização de operações de crédito.",
    "gamification": "star",
    "screens": [{
        "magicLabel": true,
        "fields": [{
            "name": "name",
            "type": "text",
            "placeholder": "Nome do Responsábel",
            "labelText": "Nome do Responsável"
        }, {
            "name": "email",
            "type": "text",
            "placeholder": "E-mail do Responsável",
            "labelText": "E-mail do Responsável"
        }, {
            "name": "phone",
            "type": "text",
            "placeholder": "Telefone do Responsável",
            "labelText": "Telefone do Responsável",
            "mask": "(00) 0000-00009"
        }]
    }, {
        "magicLabel": true,
        "fields": [{
                "name": "revenue",
                "type": "text",
                "placeholder": "Faturamento (R$)",
                "labelText": "Faturamento (R$)",
                "mask": "000.000.000.000.000,00",
                "maskOptions": {
                    "reverse": true
                },
                "numeral": true
            },
            [{
                "name": "medium-term-sale",
                "type": "text",
                "placeholder": "Prazo Médio de Venda (dias)",
                "labelText": "Prazo Médio de Venda (dias)",
                "mask": "999",
                "numeral": true
            }, {
                "name": "check-liquidity",
                "type": "text",
                "placeholder": "Liquidez dos Cheques (%)",
                "labelText": "Liquidez dos Cheques (%)",
                "mask": "##0,00",
                "maskOptions": {
                    "reverse": true
                },
                "numeral": true
            }],
            [{
                "name": "pre-billing",
                "type": "text",
                "placeholder": "* Pré-Faturamento (R$)",
                "labelText": "* Pré-Faturamento (R$)",
                "optional": true,
                "mask": "000.000.000.000.000,00",
                "maskOptions": {
                    "reverse": true
                },
                "numeral": true
            }, {
                "name": "pre-billing-days",
                "type": "text",
                "placeholder": "* Quantos dias?",
                "labelText": "* Quantos dias?",
                "optional": true,
                "mask": "999",
                "numeral": true
            }]
        ]
    }, {
        "magicLabel": true,
        "fields": [
            [{
                "name": "number-employees",
                "type": "text",
                "placeholder": "Total de Funcionários",
                "labelText": "Total de Funcionários",
                "mask": "000.000.000.000.000",
                "maskOptions": {
                    "reverse": true
                },
                "numeral": true
            }, {
                "name": "total-payroll",
                "type": "text",
                "placeholder": "Total da Folha de Pagto. (R$)",
                "labelText": "Total da Folha de Pagto. (R$)",
                "numeral": true,
                "mask": "000.000.000.000.000,00",
                "maskOptions": {
                    "reverse": true
                }
            }], {
                "name": "own-property",
                "type": "checkbox",
                "placeholder": "Imóvel Próprio?",
                "labelText": "Imóvel Próprio?",
                "optional": true
            }, {
                "name": "location-value",
                "type": "text",
                "placeholder": "* Valor da Locação (R$)",
                "labelText": "* Valor da Locação (R$)",
                "optional": true,
                "numeral": true,
                "mask": "000.000.000.000.000,00",
                "maskOptions": {
                    "reverse": true
                }
            }
        ]
    }, {
        "magicLabel": true,
        "fields": [{
            "name": "month-check-ammount",
            "type": "text",
            "placeholder": "Quanto Desconta ao Mês (R$)",
            "numeral": true,
            "labelText": "R$",
            "mask": "000.000.000.000.000,00",
            "maskOptions": {
                "reverse": true
            }
        }, {
            "name": "bulk",
            "type": "checkbox",
            "placeholder": "Concentrado",
            "labelText": "Concentrado",
            "optional": true
        }, {
            "name": "avg-check-ammount",
            "type": "text",
            "placeholder": "Valor Médio do Cheque (R$)",
            "labelText": "Valor Médio do Cheque (R$)",
            "numeral": true,
            "mask": "000.000.000.000.000,00",
            "maskOptions": {
                "reverse": true
            }
        }, {
            "name": "own-send",
            "type": "select",
            "labelText": "Opção de Transportadora",
            "optional": true,
            "list": ["Sem Transportadora", "Transportadora Própria", "Transportadora Terceirizada"]
        }]
    }]
};

module.exports = function(controller) {
    /**
     * Este é o formulário para antecipar cheques
     */
    controller.registerCall("icheques::form::company", function() {
        var form = controller.call("form", function(formData) {
            controller.serverCommunication.call("INSERT INTO 'ICHEQUESPROFILE'.'PROFILE'", controller.call("error::ajax", {
                method: "post",
                contentType: "application/json",
                data: JSON.stringify(formData),
                success: function() {
                    controller.call("alert", {
                        icon: "pass",
                        title: "Parabéns, cadastro atualizado!",
                        subtitle: "Seu cadastro foi atualizado com sucesso.",
                        paragraph: "Os dados cadastrais foram atualizados com sucesso.",
                        confirmText: "Continuar"
                    });
                }
            }));
        });

        var lastData = {};
        controller.call("billingInformation::force", () => {
            controller.server.call("SELECT FROM 'ICHEQUESPROFILE'.'PROFILE'", {
                dataType: "json",
                success: (ret) => {
                    lastData = ret;
                },
                complete: () => {
                    form.configure(formDescription);
                    for (let idx in lastData) {
                        switch (idx) {
                            case 'preBilling':
                            case 'totalPayroll':
                            case 'locationValue':
                            case 'monthCheckAmmount':
                            case 'avgCheckAmmount':
                            case 'revenue':
                                lastData[idx] *= 100;
                                break;
                        }
                        form.setValue(paramCase(idx), lastData[idx]);
                    }
                }
            });
        }, "Próximo");
    });
};
