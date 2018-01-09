import localForage from 'localforage';

let _authData = null;

module.exports = controller => {

    /* Verifica se o usuário já está autenticado */
    controller.registerCall('accuracy::authentication', (authentication, logged) => {
        localForage.getItem('accuracyAuth', (err, value) => {
            if (!err && value) {
                _authData = value;
                controller.call('accuracy::server::auth', _authData);
                return logged();
            }
            return authentication();
        });
    });
    
    controller.registerCall('accuracy::authentication::data', cb => {
        if (_authData) cb(_authData);
        else localForage.getItem('accuracyAuth', (err, value) => {
            if (err) console.error(err);
            cb(value);
        });
    });

    /* Sai da conta do usuário */
    controller.registerCall('accuracy::logout', callback => {
        localForage.removeItem('accuracyAuth', err => {
            console.error(err);
        });
        _authData = null;
        controller.call('accuracy::server::reset');
        if (callback) callback();
    });

    controller.registerCall('accuracy::authentication::auth', (cpf, callback, errorCallback) => {
        controller.accuracyServer.call('auth', {cpf}, {
            success: (authData) => {
                if (!authData[0].token) {
                    if (!errorCallback) return;
                    errorCallback(authData[0].message || 'Não foi possível acessar o sistema');
                    return;
                }
                localForage.setItem('accuracyAuth', authData, err => {
                    if (err) console.log(err);
                });
                _authData = authData;
                controller.call('accuracy::server::auth', authData);
                if (callback) callback();
            },
            error: () => {
                if (errorCallback) errorCallback('Rede não disponível para autenticação');
                controller.alert({
                    title: 'Não foi possível se autenticar',
                    subtitle: 'Ocorreu um erro de comunicação na rede',
                    paragraph: 'Verifique se a sua conexão com a internet está funcionando'
                });
            }
        }, true);
    });

};
