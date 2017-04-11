let _authData = null;

module.exports = function (controller) {

    /* Verifica se o usuário já está autenticado */
    controller.registerCall("accuracy::authentication", (authentication, logged) => {
        if (localStorage.accuracyAuth) {
            let authData = JSON.parse(localStorage.accuracyAuth);
            _authData = authData;
            controller.call("accuracy::server::auth", authData);
            return logged();
        }
        return authentication();
    });

    controller.registerCall("accuracy::authentication::data", () => {
        return _authData || JSON.parse(localStorage.accuracyAuth);
    });

    /* Sai da conta do usuário */
    controller.registerCall("accuracy::logout", (callback) => {
        delete localStorage.accuracyAuth;
        _authData = null;
        controller.call("accuracy::server::reset");
        if (callback) callback();
    });

    controller.registerCall("accuracy::authentication::auth", (cpf, callback, errorCallback) => {
        controller.accuracyServer.call("auth", {cpf: cpf}, {
            success: (authData) => {
                if (!authData[0].token) {
                    if (!errorCallback) return;
                    errorCallback(authData[0].message || "Não foi possível acessar o sistema");
                    return;
                }
                localStorage.accuracyAuth = JSON.stringify(authData);
                controller.call("accuracy::server::auth", authData);
                _authData = authData;
                if (callback) callback();
            },
            error: () => {
                if (errorCallback) errorCallback("Rede não disponível para autenticação");
                controller.alert({
                    title: "Não foi possível se autenticar",
                    subtitle: "Ocorreu um erro de comunicação na rede",
                    paragraph: "Verifique se a sua conexão com a internet está funcionando"
                });
            }
        });
    });


};
