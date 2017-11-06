var sprintf = require("sprintf");

module.exports = controller => {

    controller.registerCall("admin::autocompleteCreateCompany", function(autocomplete) {
        autocomplete.item("Criar novo Usuário",
                "Criação Manual de Usuário",
                "Adicionar manualmente cliente da API/Harlan")
            .addClass("admin-company admin-new-company")
            .click(function(e) {
                e.preventDefault();
                controller.call("admin::createCompany");
            });
    });

    controller.registerCall("admin::fillCompanysAutocomplete", function(document, autocomplete) {
        $("BPQL > body > company", document).each(function(idx, company) {
            controller.call("admin::fillCompanyAutocomplete", company, autocomplete);
        });
    });

    controller.registerCall("admin::fillCompanyAutocomplete", function(companyNode, autocomplete) {
        var company = $(companyNode),
            document = company.children("cnpj").text() || company.children("cpf").text();

        autocomplete.item(company.children("nome").text(), document ?
                sprintf("%s - %s", document, company.children("username").text()) :
                company.children("username").text(), "Visualizar e editar cliente da API/Harlan")
            .addClass("admin-company")
            .click(e => {
                e.preventDefault();
                autocomplete.empty();
                controller.call("admin::viewCompany", company);
            });
    });

};
