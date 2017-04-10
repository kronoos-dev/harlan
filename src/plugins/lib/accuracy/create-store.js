var CPF = require("cpf_cnpj").CPF,
CNPJ = require("cpf_cnpj").CNPJ,
emailRegex = require("email-regex"),
PHONE_REGEX = /^[\(]?\d{2}[\)]?\s*\d{4}[\-]?\d{4,5}$/;

module.exports = function (controller) {

    controller.registerCall("accuracy::createStore", () => {
        var form = controller.call("form", (opts) => {
            controller.accuracyServer.call("./saveStore/", opts, {
                success: (ret) => toastr.success("Loja criada com sucesso", "Já está disponível a loja no dashboard de usuário para começar a realizar os check-ins."),
                error: () => toastr.error("Não foi possível criar a loja", "Verifique sua conexão com a internet e tente novamente mais tarde.")
            });
        });

        form.configure({
            "title": "Dados para Cadastro de Loja",
            "subtitle": "Uma vez cadastrada a loja você poderá realizar o check-in.",
            "paragraph": "É muito importante que os dados estejam preenchidos de maneira correta para que a loja seja criada corretamente.",
            "screens": [{
                "fields": [
                    {
                        "name": "name",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Nome Fantasia",
                    },
                    {
                        "name": "company",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Razão Social",
                    }, {
                        "name": "cnpj",
                        "placeholder": "CNPJ",
                        "mask": '00.000.000/0000-00',
                        "optional": false,
                    }, {
                        "name": "ie",
                        "placeholder": "Inscrição Estadual",
                        "optional": false,
                    }, {
                        "name": "address",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Endereço",
                    }, {
                        "name": "zipcode",
                        "type": "text",
                        "placeholder": "CEP",
                        "optional": false,
                        "labelText": "CEP",
                        "mask": "00000-000"
                    }, {
                        "name": "complement",
                        "type": "text",
                        "optional": true,
                        "placeholder": "Complemento"
                    }, {
                        "name": "city",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Cidade"
                    }, {
                        "name": "state",
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
                            "RS": "Rio Grande do Sul",
                            "RO": "Rondônia",
                            "RR": "Roraima",
                            "SC": "Santa Catarina",
                            "SP": "São Paulo",
                            "SE": "Sergipe",
                            "TO": "Tocantins"
                        }
                    },
                    {
                        "name": "email",
                        "optional": false,
                        "type": "text",
                        "placeholder": "E-mail",
                        "validate": (item) => {
                            return emailRegex().test(item.element.val());
                        }
                    } ,{
                        "name": "phone",
                        "optional": false,
                        "type": "text",
                        "mask": "(00) 0000-00009",
                        "placeholder": "Telefone de Contato",
                        "validate": (item) => {
                            return PHONE_REGEX.test(item.element.val());
                        }
                    },{
                        "name": "cell",
                        "optional": false,
                        "type": "text",
                        "mask": "(00) 0000-00009",
                        "placeholder": "Celular de Contato",
                        "validate": (item) => {
                            return PHONE_REGEX.test(item.element.val());
                        }
                    },
                    {
                        "name": "region",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Região"
                    },
                    {
                        "name": "network",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Rede"
                    },
                    {
                        "name": "channel",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Canal"
                    },
                    {
                        "name": "manager",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Gerente"
                    },
                    {
                        "name": "note",
                        "optional": false,
                        "type": "text",
                        "placeholder": "Nota"
                    },
                ]
            }]
        });
    });
};
