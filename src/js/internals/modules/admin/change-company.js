module.exports = (controller) => {

    controller.registerCall("admin::changeCompany", (addressInputs) => {
        var form = controller.call("form");
        form.configure({
            "title": "Alteração de Conta",
            "subtitle": "Preencha os dados abaixo.",
            "gamification": "magicWand",
            "paragraph": "É muito importante que os dados estejam preenchidos de maneira correta para que seja mantido um cadastro saneado.",
            "screens": [{
                "magicLabel": true,
                "fields": [
                    {
                        "name": "company",
                        "type": "text",
                        "placeholder": "Empresa",
                        "optional": true,
                        "labelText": "Empresa"
                    },
                    [{
                        "name": "username",
                        "type": "text",
                        "placeholder": "Usuário",
                        "optional": true,
                        "labelText": "Usuário"
                    }, {
                        "name": "name",
                        "type": "text",
                        "placeholder": "Nome do Responsável",
                        "optional": true,
                        "labelText": "Nome"
                    }],
                    [{
                        "name": "cnpj",
                        "type": "text",
                        "placeholder": "CNPJ",
                        "labelText": "CNPJ",
                        "mask": "00.000.000/0000-00",
                        "optional": true,
                        "maskOptions": {
                            "reverse": true
                        }
                    }, {
                        "name": "cpf",
                        "type": "text",
                        "placeholder": "CPF",
                        "labelText": "CPF",
                        "mask": "000.000.000-00",
                        "optional": true,
                        "maskOptions": {
                            "reverse": true
                        }
                    }]
                ],
                validate: (callback, configuration, screen, formManager) => {
                    formManager.defaultScreenValidation((isValid) => {
                        if (!isValid) {
                            callback(isValid);
                            return;
                        }

                        var values = formManager.readValues();
                        if (!values.cpf && !values.cnpj) {
                            toastr.error(
                                "É necessário ao menos um documento para emissão de documento fiscal.",
                                "Impossível continuar sem CPF ou CNPJ");
                            isValid = false;
                        }

                        if (values.cpf) {
                            if (!values.name) {
                                toastr.error(
                                    "É necessário que o nome seja preenchido caso haja CPF.",
                                    "Impossível continuar sem nome");
                                isValid = false;
                            }
                            if (!documentValidator.CPF.isValid(values.cpf)) {
                                toastr.error("O CPF inserido não confere, verifique e tente novamente.");
                                isValid = false;
                            }
                        }

                        if (values.cnpj) {
                            if (!values.company) {
                                toastr.error(
                                    "É necessário que o nome da empresa seja preenchido caso haja CNPJ.",
                                    "Impossível continuar sem nome da empresa");
                                isValid = false;
                            }
                            if (!documentValidator.CNPJ.isValid(values.cnpj)) {
                                toastr.error("O CNPJ inserido não confere, verifique e tente novamente.");
                                isValid = false;
                            }
                        }

                        callback(isValid);
                    }, configuration, screen);
                }
            }]
        });

    })

};
