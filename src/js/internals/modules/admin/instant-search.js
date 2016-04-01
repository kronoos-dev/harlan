const CREATE_COMPANY = /(^|\s)(adicio?n?a?r?|nova|criar)($|\s)/i;

module.exports = function (controller) {
    controller.registerTrigger("findDatabase::instantSearch", "admin::createCompany", function (args, callback) {
        callback();
        var [argument, autocomplete] = args;
        if (CREATE_COMPANY.test(argument)) {
            controller.call("admin::autocompleteCreateCompany", autocomplete);
        }
    });

    controller.registerTrigger("findDatabase::instantSearch", "admin::listCompany", function (args, callback) {
        var [argument, autocomplete] = args;
        controller.serverCommunication.call("SELECT FROM 'BIPBOPCOMPANYS'.'LIST'", {
            data: {
                data: argument,
                limit: 3
            },
            success: function (response) {
                controller.call("admin::fillCompanysAutocomplete", response, autocomplete);
            },
            complete: function () {
                callback();
            }
        });
    });

};
