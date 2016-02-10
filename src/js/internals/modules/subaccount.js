/* global module */

var _ = require("underscore");
var formDescription = {
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
                        "placeholder": "E-mail do Responsável",
                        "optional": true,
                        "labelText": "E-mail do Responsável"
                    },
                    {
                        "name": "phone",
                        "type": "text",
                        "placeholder": "Telefone do Responsável",
                        "labelText": "Telefone do Responsável",
                        "mask": "(00) 0000-00009",
                        "optional": true
                    }],
                [{
                        "name": "cpf",
                        "type": "text",
                        "placeholder": "CPF",
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
                        "placeholder": "CNPJ",
                        "labelText": "CNPJ",
                        "mask": "00.000.000/0000-00",
                        "optional": true,
                        "maskOptions": {
                            "reverse": true
                        }
                    }]
            ]
        }
    ]
};
module.exports = function (controller) {

    var register = function (data) {
        controller.serverCommunication.call("SELECT FROM 'BIPBOPAPIKEY'.'GENERATE'",
                controller.call("error::ajax", {
                    data: data,
                    success: function () {
                        controller.call("alert", {
                            icon: "pass",
                            title: "Subconta Criada com Sucesso",
                            subtitle: "Agora você já pode acessar esse novo usuário",
                            pagraph: "As subcontas não podem criar novas subcontas."
                        });
                    }
                }));
    };
    var listAccounts = function (data) {
        var modal = controller.call("modal");
        modal.title("Gestão de Subcontas");
        modal.subtitle("Crie e Bloqueie Subchaves");
        modal.addParagraph("A gestão de subcontas permite você administrar múltiplos usuários.");
        var form = modal.createForm();
        var list = form.createList();

        $("BPQL > body > company", data).each(function (idx, item) {

            var status = $("status", item).text() === "1",
                    cpf = $("cpf", item).text(),
                    cnpj = $("cnpj", item).text(),
                    username = $("username", item).text();
            var iconStatus = function () {
                return status ? "fa-check" : "fa-times";
            };

            var item = list.add(iconStatus(), _.filter([
                cnpj, cpf, username
            ])).click(function () {
                var unregisterLoader = $.bipbopLoader.register();
                controller.serverCommunication.call("SELECT FROM 'BIPBOPAPIKEY'.'CHANGESTATUS'", {
                    data: {username: username},
                    success: function () {
                        status = !status;
                        item.find(".fa").removeClass("fa-check fa-times").addClass(iconStatus());
                    },
                    complete: function () {
                        unregisterLoader();
                    }
                });
            });
        });

        var actions = modal.createActions();
        form.element().submit(function (e) {
            e.preventDefault();
            controller.call("subaccount::create");
            modal.close();
        });
        form.addSubmit("create-subaccount", "Criar Subconta");
        actions.add("Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    };
    controller.registerCall("subaccount::create", function () {
        var form = controller.call("form", register);
        form.configure(formDescription);
    });
    controller.registerCall("subaccount::list", function () {
        controller.serverCommunication.call("SELECT FROM 'BIPBOPAPIKEY'.'LIST'", {
            success: function (data) {
                listAccounts(data);
            }
        });
    });
    controller.registerBootstrap("subaccount", function (cb) {
        cb();
        $("#action-subaccount").click(function (e) {
            e.preventDefault();
            controller.call("subaccount::list");
        });
    });
};