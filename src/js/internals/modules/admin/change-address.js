module.exports = (controller) => {

    controller.registerCall("admin::changeAddress", (addressInputs) => {
        var form = controller.call("form");
        form.configure({
            "title": "Alteração de Endereço",
            "subtitle": "Preencha os dados abaixo.",
            "gamification": "magicWand",
            "paragraph": "É muito importante que os dados estejam preenchidos de maneira correta para que seja mantido um cadastro saneado.",
            "screens": [{
                "magicLabel": true,
                "fields": [
                    [{
                        "name": "endereco",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Endereço"
                    }, {
                        "name": "zipcode",
                        "type": "text",
                        "placeholder": "CEP",
                        "optional": false,
                        "labelText": "CEP",
                        "mask": "00000-000"
                    }],
                    [{
                        "name": "numero",
                        "optional": false,
                        "type": "text",
                        "numeral": true,
                        "placeholder": "Número"
                    }, {
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
                    }, {
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
            }]
        });

    })

};
