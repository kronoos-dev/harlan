module.exports = controller => {

    const toastFatalError = (message, type) => {
        toastr[type || 'error'](message || 'Ocorreu um erro interno do servidor.', 'Não foi possível processar sua requisição!');
    };

    controller.registerTrigger('database::error', 'databaseError::error', (args, callback) => {
        const jqXHR = args[0];
        const e = args[1];

        if (jqXHR && (jqXHR.status === 0 && e === 'abort')) {
            return;
        }

        if (jqXHR.status === 500) {

            try {
                const ret = $.parseXML(jqXHR.responseText);

                if ($.bipbopAssert(ret, (source, message) => {
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