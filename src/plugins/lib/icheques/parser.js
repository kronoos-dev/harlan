
module.exports = function (controller) {

    var databaseInteger = function (value) {

        return value && /^\d+$/.test(value) ? parseInt(value) : null;
    };

    controller.registerCall("icheques::parse::element", function (element) {

        var getElement = function (node) {
            var nodeElement = $(node, element);
            return nodeElement.length ? nodeElement.text() : null;
        };

        let ret = {
            creation: parseInt(getElement("creation")),
            company: getElement("company"),
            cmc: getElement("cmc"),
            cpf: getElement("cpf"),
            cnpj: getElement("cnpj"),
            observation: getElement("observation"),
            expire: getElement("expire"),
            ammount: databaseInteger(getElement("ammount")),
            pushId: getElement("pushId"),
            situation: getElement("situation"),
            display: getElement("display"),
            queryStatus: databaseInteger(getElement("queryStatus")),
            ocurrenceCode: databaseInteger(getElement("ocurrenceCode")),
            ocurrence: getElement("ocurrence"),
            operation: databaseInteger(getElement("operation")),
            ccf: databaseInteger(getElement("ccf")),
            protesto: databaseInteger(getElement("protesto")),
            debtCollector: getElement("debtCollector"),
            alinea: getElement("alinea"),
            lastDebtCollectorMessage: getElement("lastDebtCollectorMessage")
        };
        return ret;
    });

};
