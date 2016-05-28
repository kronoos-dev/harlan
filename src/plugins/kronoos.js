(function (controller) {

    controller.registerCall("admin::roleTypes", function() {
        return {
            "": "Tipo de Contrato",
            "kronoosCustomer": "Kronoos"
        };
    });

    require("./lib/kronoos/design")(controller);
    require("./lib/kronoos/contact-us")(controller);
    require("./lib/kronoos/terms")(controller);
    require("./lib/kronoos/contract-accept")(controller);
    require("./lib/kronoos/parser")(controller);
    require("./lib/kronoos/search")(controller);
    require("./lib/kronoos/juristek")(controller);
})(harlan);
