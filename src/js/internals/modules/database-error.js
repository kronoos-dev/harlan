module.exports = function (controller) {

    var toastFatalError = function (message, type) {
        toastr[type || 'error'](message || 'Ocorreu um erro interno do servidor.', 'Não foi possível processar sua requisição!');
    };

    controller.registerTrigger('database::error', 'databaseError::error', function (args, callback) {
        var jqXHR = args[0], e = args[1];

        if (jqXHR && (jqXHR.status === 0 && e === 'abort')) {
            return;
        }

        if (jqXHR.status === 500) {

            try {
                var ret = $.parseXML(jqXHR.responseText);

                if ($.bipbopAssert(ret, function (source, message) {
                    if (source === 'ExceptionDatabase') {
                        toastFatalError(message, 'warning');
                    } else {
                        toastFatalError();
                    }
                })) {
                    return;
                }
            } catch (error) {
                toastFatalError();
            }
            return;
        }

        toastFatalError();
    });

};