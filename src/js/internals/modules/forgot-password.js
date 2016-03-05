/* global toastr, module */

var SAFE_PASSWORD = /^.{6,}$/;

module.exports = function (controller) {

    controller.endpoint.forgotPassword = "SELECT FROM 'HARLANAUTHENTICATION'.'FORGOTPASSWORD'";

    controller.registerCall("forgotPassword", function (callback) {
        var modal = controller.call("modal");
        modal.title("Recupere sua senha");
        modal.subtitle("Insira seus dados para prosseguir");
        modal.addParagraph("Para recuperar sua senha você tem de saber o usuário que usou quando se registrou, caso não lembre entre em contato.");
        var form = modal.createForm(),
                usernameInput = form.addInput("username", "text", "Usuário");

        form.element().submit(function (e) {
            e.preventDefault();

            var username = usernameInput.val();
            if (/^\s*$/.test(username)) {
                usernameInput.addClass("error");
                toastr.warning("É necessário que preencha o campo usuário", "Preencha seu usuário");
                return;
            }

            usernameInput.removeClass("error");

            controller.serverCommunication.call(controller.endpoint.forgotPassword,
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {username: username},
                        success: function () {
                            controller.call("forgotPassword::code", callback, username);
                            modal.close();
                        }
                    })));
        });

        form.addSubmit("recover", "Recuperar");
        form.addSubmit("exit", "Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("forgotPassword::code", function (callback, username) {
        var modal = controller.call("modal");
        modal.title("Confirmação de Conta");
        modal.subtitle("Digite o código que recebeu em seu e-mail");
        modal.addParagraph("Você recebeu no endereço de e-mail principal registrado um código, precisamos que o digite abaixo");

        var form = modal.createForm(),
                inputSecureCode = form.addInput("code", "text", "Código Recebido"),
                inputPassword = form.addInput("newpassword", "password", "Nova Senha"),
                inputConfirmPassword = form.addInput("newpassword-confirm", "password", "Confirmar Nova Senha");

        form.element().submit(function (e) {
            e.preventDefault();

            var errors = [],
                    password = inputPassword.val(),
                    secureCode = inputSecureCode.val(),
                    confirmPassword = inputConfirmPassword.val();

            if (/^\s*$/.test(secureCode)) {
                inputSecureCode.addClass("error");
                errors.push("Você deve preencher o código de segurança.");
            } else {
                inputSecureCode.removeClass("error");
            }

            if (!SAFE_PASSWORD.test(password)) {
                inputPassword.addClass("error");
                errors.push("A senha deve possuir no mínimo 6 dígitos.");
            } else if (password !== confirmPassword) {
                inputPassword.addClass("error");
                inputConfirmPassword.addClass("error");
                errors.push("A senha não confere");
            } else {
                inputPassword.removeClass("error");
                inputConfirmPassword.removeClass("error");
            }

            if (errors.length) {
                for (var i in errors.length) {
                    toastr.warning(errors[i], "Não foi possível prosseguir");
                }
                return;
            }

            controller.serverCommunication.call("UPDATE 'HARLANAUTHENTICATION'.'FORGOTPASSWORD'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            securecode: inputSecureCode.val(),
                            username: username,
                            password: inputPassword.val()
                        },
                        success: function () {
                            modal.close();
                            callback();
                        }
                    })));
        });


        form.addSubmit("new-password", "Alterar Senha");

        modal.createActions().add("Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("changePassword", function () {

    });

    controller.registerBootstrap("forgotPassword", function (callback) {
        callback();
        $("#forgot-password").click(function () {
            controller.call("forgotPassword");
        });
    });
}; 