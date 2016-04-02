const CREATE_COMPANY = /(^|\s)(adicio?n?a?r?|nova|criar)($|\s)/i;
const ADMIN_COMPANY = /(^|\s)(admi?n?i?s?t?r?a?r?)($|\s)/i;

module.exports = function(controller) {
    controller.registerTrigger("findDatabase::instantSearch", "admin::createCompany", function(args, callback) {
        callback();
        var [argument, autocomplete] = args;
        if (CREATE_COMPANY.test(argument)) {
            controller.call("admin::autocompleteCreateCompany", autocomplete);
        }
    });

    controller.registerTrigger("findDatabase::instantSearch", "admin::index", function(args, callback) {
        callback();
        var [argument, autocomplete] = args;
        if (!ADMIN_COMPANY.test(argument)) {
            return;
        }

        autocomplete.item("Administrar Usuários",
                "Gestão de Usuários do Sistema",
                "Adicionar, remover ou alterar dados cadastrais, contratuais e afins.")
            .addClass("admin-company admin-new-company")
            .click(function(e) {
                e.preventDefault();
                controller.call("admin::index");
            });
    });


    controller.registerTrigger("findDatabase::instantSearch", "admin::listCompany", function(args, callback) {
        var [argument, autocomplete] = args;
        if (argument.length < 3) {
            callback();
            return;
        }

        controller.serverCommunication.call("SELECT FROM 'BIPBOPCOMPANYS'.'LIST'", {
            data: {
                data: argument,
                limit: 3
            },
            success: function(response) {
                controller.call("admin::fillCompanysAutocomplete", response, autocomplete);
            },
            complete: function() {
                callback();
            }
        });
    });

};
