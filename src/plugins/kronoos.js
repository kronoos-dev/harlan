harlan.addPlugin((controller) => {
    controller.registerCall("admin::roleTypes", function() {
        return {
            "": "Tipo de Contrato",
            "kronoosCustomer": "Kronoos"
        };
    });

    controller.confs.smartsupp = "";
    require("./lib/kronoos/design")(controller);
    require("./lib/kronoos/authentication")(controller);
    require("./lib/kronoos/contact-us")(controller);
    require("./lib/kronoos/terms")(controller);
    require("./lib/kronoos/contract-accept")(controller);
    require("./lib/kronoos/queue")(controller);
    require("./lib/kronoos/search")(controller);
    require("./lib/kronoos/status")(controller);
    require("./lib/kronoos/element")(controller);
    require("./lib/kronoos/print")(controller);
});
