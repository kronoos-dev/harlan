import e from '../library/server-communication/exception-dictionary';

module.exports = function(controller) {

    controller.registerCall("error::server", (exceptionType, exceptionMessage, exceptionCode, push) => {

        if (exceptionType === "ExceptionDatabase") {
            switch (exceptionCode) {
                case e.ExceptionDatabase.authenticationFailure:
                    controller.call("buyit");
                    return;
                case e.ExceptionDatabase.missingBillingInformation:
                        controller.confirm({
                            icon: 'fail',
                            title: "Sem informações de bilhetagem.",
                            subtitle: "Você não possui informações de bilhetagem para continuar.",
                            paragraph: "Registre suas informações de bilhetagem e tente novamente.",
                            confirmText: "Informações de Bilhetagem"
                        }, () => {
                            controller.call("billingInformation::force");
                        });
                        return;
                case e.ExceptionDatabase.insufficientFunds:
                    controller.confirm({
                        icon: 'fail',
                        title: "Sem créditos suficientes.",
                        subtitle: "Você não possui créditos suficientes para continuar.",
                        paragraph: "Recarregue sua conta para poder usufruir dessa funcionalidade.",
                        confirmText: "Recarregar"
                    }, () => {
                        controller.call("credits::buy");
                    });
                    return;
            }

            if (exceptionMessage) {
                toastr.error(exceptionMessage);
                return;
            }

        }

        if (push && exceptionMessage) {
            toastr.error(exceptionMessage);
            return;
        }

        toastr.error("Não foi possível processar a sua requisição.", "Tente novamente mais tarde.");
    });

    controller.registerCall("error::ajax", function(dict) {
        var error = dict.error;
        dict.error = function(jqXHR, ...args) {
            try {
                var xml = $.parseXML(jqXHR.responseText);
                $.bipbopAssert(xml, dict.bipbopError || controller.reference("error::server"));
            } catch (err) {
                toastr.error("Não foi possível processar a sua requisição.", "Tente novamente mais tarde.");
            }

            if (error) {
                error(jqXHR, ...args);
            }

        };
        return dict;
    });



};
