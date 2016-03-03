/* global toastr, BIPBOP_FREE, module */

module.exports = function (controller) {

    /**
     * Captura o Session ID
     * @param {string} key
     * @returns {Storage|window.localStorage}
     */
    var getSessionId = function () {
        var apiKey = controller.query.apiKey;
        return apiKey ? apiKey.replace(/[^a-z0-9]/ig, "") : localStorage.sessionId;
    };

    /**
     * Define um Session ID
     * @param {string} key
     * @param {mixed} value
     * @returns {undefined}
     */
    var setSessionId = function (value) {
        if (!value) {
            delete localStorage.sessionId;
            return;
        }
        localStorage.sessionId = value;
    };

    /**
     * Set the default page! \m/
     */
    controller.registerCall("default::page", function () {
        controller.interface.helpers.activeWindow(".site");
    });

    /**
     * Registra o formulário
     */
    controller.registerTrigger("bootstrap::end", "authentication::bootstrap", function (obj, callback) {
        callback();

        if (!authenticate()) {
            controller.call("default::page");
        }

        $("#action-logout").click(function (e) {
            e.preventDefault();
            controller.call("authentication::logout");
        });

        $("#form-login").submit(function (e) {
            e.preventDefault();
            controller.call("authentication::authenticate");
        });

    });


    /**
     * Chama pelo logout
     */
    controller.registerCall("authentication::logout", function () {
        var modal = controller.call("modal");
        modal.title("Você está saindo da conta.");
        modal.subtitle("Aguarde enquanto a página é recarregada para sua segurança.");
        modal.addParagraph("Esperamos que sua visita tenha sido proveitosa e sua experiência incrível.");

        var loggedout = false, logout = function () {
            loggedout = true;
            controller.serverCommunication.apiKey(BIPBOP_FREE);
            controller.call("default::page");
            $("#input-username").val("");
            $("#input-password").val("");
            $("#input-save-password").removeAttr("checked");
            setSessionId(null);
            controller.trigger("authentication::logout::end");
            location.reload(true); /* prevent information leak */
        }, timeout = setTimeout(logout, 10000);

        controller.trigger("authentication::logout", null, function () {
            if (loggedout) {
                return;
            }
            clearTimeout(timeout);
            logout();
        });
    });

    controller.registerCall("authentication::loggedin", function () {
        controller.interface.helpers.activeWindow(".app");
    });

    var authenticate = function (apiKey, ret) {
        var key = apiKey || getSessionId();
        if (!key) {
            return false;
        }
        controller.serverCommunication.apiKey(key);

        controller.trigger("authentication::authenticated", ret, function (err) {
            if (err) {
                controller.call("default::page");
                return;
            }
            controller.call("authentication::loggedin");
        });

        return true;
    };

    /**
     * Força uma autenticação
     */
    controller.registerCall("authentication::force", function (apiKey, ret) {
        authenticate(apiKey, ret);
    });

    /**
     * Chama pela autenticação
     */
    controller.registerCall("authentication::authenticate", function (inputUsername, inputPassword, savePassword, callback) {

        savePassword = typeof savePassword !== "undefined" ?
                savePassword :
                $("#input-save-password").is(":checked");

        inputUsername = inputUsername || $("#input-username");
        inputPassword = inputPassword || $("#input-password");

        if (/^\s*$/.test(inputUsername.val()) || inputPassword.val() === "") {
            toastr.error("Para acessar o Harlan você precisa inserir seu usuário e senha.", "Insira seu nome de usuário e senha.");
            onError();
            return;
        }

        controller.serverCommunication.call("SELECT FROM 'HarlanAuthentication'.'Authenticate'",
                controller.call("loader::ajax", controller.call("error::ajax", {
                    error: function () {
                        inputUsername.addClass("error");
                        inputPassword.addClass("error");
                    },
                    success: function (domDocument) {
                        var apiKey = $("BPQL > body apiKey", domDocument).text();
                        authenticate(apiKey, domDocument);

                        if (savePassword) {
                            setSessionId(apiKey);
                        }
                        if (callback) {
                            callback();
                        }
                    },
                    data: {
                        username: inputUsername.val(),
                        password: inputPassword.val()
                    }
                })));
    });

    controller.registerCall("authentication::need", function (callback) {
        if (controller.serverCommunication.freeKey()) {
            controller.interface.helpers.activeWindow(".login");
            var modal = controller.call("modal");
            modal.title("Você precisa estar autenticado");
            modal.subtitle("Essa operação exige que você esteja autenticado.");
            modal.addParagraph("Reinicie a operação após autenticar-se.");
            var form = modal.createForm();
            form.element().submit(function (e) {
                e.preventDefault();
                modal.close();
            });
            form.addSubmit("ok", "Entendido");
            return true;
        }

        if (callback) {
            callback();
        }

        return false;
    });

};