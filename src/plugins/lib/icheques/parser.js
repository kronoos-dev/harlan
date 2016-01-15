
module.exports = function (controller) {

    var databaseInteger = function (value) {
        return value ? parseInt(value) : null;
    };

    controller.registerCall("icheques::parse::element", function (element) {

        var getElement = function (node) {
            var nodeElement = $(node, element);
            return nodeElement.length ? nodeElement.text() : null;
        };

        return {
            creation: parseInt(getElement("creation")),
            company: getElement("company"),
            cmc: getElement("cmc"),
            cpf: getElement("cpf"),
            cnpj: getElement("cnpj"),
            expire: getElement("expire"),
            ammount: databaseInteger(getElement("ammount")),
            pushId: getElement("pushId"),
            exceptionMessage: getElement("exceptionMessage"),
            exceptionCode: databaseInteger(getElement("exceptionCode")),
            exceptionType: getElement("exceptionType"),
            exceptionPushable: getElement("exceptionPushable") === "true" ? 1 : 0,
            situation: getElement("situation"),
            display: getElement("display"),
            queryStatus: databaseInteger(getElement("queryStatus")),
            ocurrenceCode: databaseInteger(getElement("ocurrenceCode")),
            ocurrence: getElement("ocurrence")
        };
    });

};