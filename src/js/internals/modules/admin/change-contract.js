module.exports = (controller) => {

    controller.registerCall("admin::changeContract", (addressInputs) => {
        var form = controller.call("form");
        form.configure({
            "title": "Alteração de Contrato",
            "subtitle": "Preencha os dados abaixo.",
            "gamification": "magicWand",
            "paragraph": "É muito importante que os dados estejam preenchidos de maneira correta para que seja mantido um cadastro saneado.",
            "screens": [{
                "magicLabel": true,
                "fields": [
                    [{
                        "name": "roleValue",
                        "type": "text",
                        "placeholder": "Contrato (R$)",
                        "labelText": "Valor do Contrato (R$)",
                        "mask": "000.000.000.000.000,00",
                        "optional": false,
                        "maskOptions": {
                            "reverse": true
                        },
                        "numeral": true
                    }, {
                        "name": "queryValue",
                        "type": "text",
                        "placeholder": "Consulta Excedente (R$)",
                        "labelText": "Consulta Excedente (R$)",
                        "mask": "000.000.000.000.000,00",
                        "optional": false,
                        "maskOptions": {
                            "reverse": true
                        },
                        "numeral": true
                    }],
                    [{
                        "name": "roleType",
                        "type": "select",
                        "labelText": "Tipo de Contrato",
                        "optional": false,
                        "list": controller.call("admin::roleTypes")
                    }, {
                        "name": "roleQuerys",
                        "type": "text",
                        "optional": false,
                        "placeholder": "Mínimo Consultas",
                        "labelText": "Mínimo Consultas",
                        "numeral": true
                    }]
                ]
            }]
        });

    })

};
