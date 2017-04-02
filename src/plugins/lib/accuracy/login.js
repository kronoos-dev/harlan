module.exportes = (controller) => {

    /* Verifica se o usuário já está autenticado */
    controller.call("accuracy::login", (login, logged) => {
        if (controller.accuracyServer) {
            let authData = JSON.parse(controller.accuracyServer);
            controller.call("accuracy::server::auth", authData);
            return login();
        }
        return logged();
    });

    /* Sai da conta do usuário */
    controller.registerCall("accuracy::logout", (callback) => {
        delete localStorage.accuracyAuth;
        if (callback) callback();
    });

    controller.registerCall("accuracy::login::auth", (cpf, callback, errorCallback) => {
        controller.accuracyServer.call("./auth", {cpf: cpf}, {
            success: (authData) => {
                if (!authData[0].token) {
                    if (!errorCallback) return;
                    errorCallback(authData[0].message || "Não foi possível acessar o sistema");
                    return;
                }
                localStorage.accuracyAuth = JSON.stringify(authData);
                controller.call("accuracy::server::auth", authData);
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
