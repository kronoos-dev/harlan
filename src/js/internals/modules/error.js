module.exports = function (controller) {

    controller.registerCall("error::toast", function () {
        return function (exceptionType, exceptionMessage, exceptionCode) {
            if (exceptionType === "ExceptionDatabase" && exceptionMessage) {
                if (exceptionCode === 9) {
                    /* Sem poderes para usar a consulta */
                    controller.call("buyit");
                } else {
                    toastr.error(exceptionMessage);
                }
            } else {
                toastr.error("Não foi possível processar a sua requisição.", "Tente novamente mais tarde.");
            }
        };
    });

    controller.registerCall("error::ajax", function (dict) {
        var error = dict.error;
        dict.error = function (jqXHR) {
            var call = Array.from(arguments);
            try {
                var xml = $.parseXML(jqXHR.responseText);
                $.bipbopAssert(xml, controller.call("error::toast"));
                if (dict.bipbopError) {
                    dict.bipbopError(xml);
                }
            } catch (err) {
                toastr.error("Não foi possível processar a sua requisição.", "Tente novamente mais tarde.");
            }

            if (error) {
                error(...arguments);
            }

        };
        return dict;
    });



};
