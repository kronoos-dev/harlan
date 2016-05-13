/* global numeral */

module.exports = function(controller) {

    controller.registerCall("icheques::form::bank::add", (callback) => {
        controller.call("billingInformation::force", () => {
            controller.call("icheques::form::bank::add::master", callback);
        })
    });

    controller.registerCall("icheques::form::bank::add::master", function(callback) {
        var form = controller.call("form", function(formData) {
            controller.serverCommunication.call("INSERT INTO 'ICHEQUESBANK'.'BANK'",
                controller.call("error::ajax", {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(formData),
                    success: function() {
                        controller.call("alert", {
                            icon: "pass",
                            title: "Parabéns, cadastro atualizado!",
                            subtitle: "Seu cadastro foi atualizado com sucesso.",
                            paragraph: "Os dados cadastrais foram atualizados com sucesso.",
                            confirmText: "Continuar"
                        }, () => {
                            callback();
                        });
                    }
                }));
        });
        form.configure({
            "title": "Cadastro de Banco",
            "subtitle": "Realize o cadastro completo de sua empresa.",
            "paragraph": "O cadastro completo permite a realização de operações de crédito.",
            "gamification": "moneyBag",
            "screens": [{
                "magicLabel": true,
                "fields": [{
                        "name": "name",
                        "type": "text",
                        "placeholder": "Nome do Banco ou Factoring",
                        "labelText": "Nome do Banco ou Factoring"
                    }, {
                        "name": "actual-risk",
                        "type": "text",
                        "placeholder": "Risco Atual (R$)",
                        "labelText": "Risco Atual (R$)",
                        "mask": "000.000.000.000,00",
                        "maskOptions": {
                            "reverse": true
                        },
                        "numeral": true
                    },
                    [{
                        "name": "tax",
                        "type": "text",
                        "placeholder": "Taxa (%)",
                        "labelText": "Taxa (%)",
                        "mask": "##0,00%",
                        "maskOptions": {
                            "reverse": true
                        },
                        "numeral": true
                    }, {
                        "name": "account-limit",
                        "type": "text",
                        "placeholder": "Limite Disponível (R$)",
                        "labelText": "Limite Disponível (R$)",
                        "mask": "000.000.000.000,00",
                        "maskOptions": {
                            "reverse": true
                        },
                        "numeral": true
                    }]
                ]
            }]
        });
    });

    /* List Banks */
    controller.registerCall("icheques::form::bank", function() {
        controller.serverCommunication.call("SELECT FROM 'ICHEQUESBANK'.'BANKS'",
            controller.call("loader::ajax", controller.call("error::ajax", {
                success: function(ret) {
                    controller.call("icheques::form::bank::show", ret);
                }
            })));
    });

    /**
     * Este é o formulário para antecipar cheques
     */
    controller.registerCall("icheques::form::bank::show", function(data) {
        var modal = controller.call("modal");
        modal.gamification("moneyBag");
        modal.title("Bancos e Factorings");
        modal.subtitle("Relação de Bancos e Factorings Cadastrados");
        modal.addParagraph("Adicione bancos e factorings os quais você utiliza para antecipar seus pagamentos.");

        var form = modal.createForm();
        var list = form.createList();

        $("BPQL > body > banks > node", data).each(function(i, element) {
            var item = list.add("fa-times", [
                $("name", element).text(),
                $("actualRisk", element).text(),
                numeral($("tax", element).text()).format("0%"),
                numeral($("accountLimit", element).text()).format("$0,0.00")
            ]).click(function(e) {
                controller.call("confirm", {}, function() {
                    e.preventDefault();
                    controller.serverCommunication.call("DELETE FROM 'ICHEQUESBANK'.'BANK'", {
                        data: {
                            id: $("id", element).text()
                        },
                        success: function() {
                            item.remove();
                        }
                    });
                });
            });
        });

        form.element().submit(function(e) {
            e.preventDefault();
            modal.close();
            controller.call("icheques::form::bank::add", function() {
                controller.call("icheques::form::bank");
            });
        });

        form.addSubmit("newbank", "Adicionar Banco ou Factoring");

        var actions = modal.createActions();
            actions.add("Pesquisa Factoring").click(function (e) {
            e.preventDefault();
            modal.close();
            controller.call("icheques::factoring::search");
        });

        actions.add("Sair").click(function(e) {
            e.preventDefault();
            modal.close();
        });
    });
};
