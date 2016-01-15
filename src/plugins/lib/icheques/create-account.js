/* global module, toastr */

var SAFE_PASSWORD = /^.{6,}$/,
        PHONE_REGEX = /^\((\d{2})\)\s*(\d{4})\-(\d{4,5})$/i,
        VALIDATE_NAME = /^[a-zA-Z\s]+$/,
        CPF = require("cpf_cnpj").CPF,
        CNPJ = require("cpf_cnpj").CNPJ,
        emailRegex = require("email-regex");

module.exports = function (controller) {

    controller.registerCall("icheques::createAccount::1", function (data, callback) {
        var modal = controller.call("modal");
        modal.title("Crie sua conta iCheques");
        modal.subtitle("Informe os dados abaixo para que possamos continuar");
        modal.addParagraph("Sua senha é secreta e recomendamos que não a revele a ninguém.");

        var form = modal.createForm();

        var inputName = form.addInput("nome", "text", "Nome Completo"),
                inputEmail = form.addInput("email", "email", "E-mail"),
                objDocument = {
                    append: form.multiField(),
                    labelPosition: "before"
                }, objLocation = {
            append: form.multiField(),
            labelPosition: "before"
        }, inputCpf = form.addInput("cpf", "text", "CPF", objDocument).mask("000.000.000-00"),
                inputCnpj = form.addInput("cnpj", "text", "CNPJ", objDocument, "CNPJ (Empresas)").mask("00.000.000/0000-00"),
                inputZipcode = form.addInput("cep", "text", "CEP", objLocation).mask("00000-000"),
                inputPhone = form.addInput("phone", "text", "Telefone", objLocation).mask("(00) 0000-00009");

        form.addSubmit("login", "Criar Conta");

        form.element().submit(function (e) {
            e.preventDefault();

            var errors = [],
                    name = inputName.val(),
                    cpf = inputCpf.val(),
                    cnpj = inputCnpj.val(),
                    zipcode = inputZipcode.val(),
                    email = inputEmail.val();

            if (!VALIDATE_NAME.test(name)) {
                errors.push("O nome informado não é válido.");
                inputName.addClass("error");
            } else {
                inputName.removeClass("error");
            }

            if (!CPF.isValid(cpf)) {
                inputCpf.addClass("error");
                errors.push("O CPF informado não é válido.");
            } else {
                inputCpf.removeClass("error");
            }

            if (cnpj) {
                if (!CNPJ.isValid(cnpj)) {
                    inputCnpj.addClass("error");
                    errors.push("O CNPJ informado não é válido.");
                } else {
                    data.cnpj = cnpj;
                    inputCnpj.removeClass("error");
                }
            } else {
                inputCnpj.removeClass("error");
            }

            if (!emailRegex().test(email)) {
                inputEmail.addClass("error");
                errors.push("O endereço de e-mail informado não é válido.");
            } else {
                inputEmail.removeClass("error");
            }

            if (!/\d{5}-\d{3}/.test(zipcode)) {
                inputZipcode.addClass("error");
                errors.push("O CEP informado não é válido.");
            } else {
                inputZipcode.removeClass("error");
            }

            if (!PHONE_REGEX.test(inputPhone.val())) {
                inputPhone.addClass("error");
                errors.push("O telefone informado não é válido.");
            } else {
                inputPhone.removeClass("error");
            }

            if (errors.length) {
                for (var i in errors.length) {
                    toastr.warning(errors[i], "Não foi possível prosseguir");
                }
                return;
            }

            var phoneMatch = PHONE_REGEX.exec(inputPhone.val()),
                    ddd = phoneMatch[1], phone = phoneMatch[2] + '-' + phoneMatch[3];

            controller.serverCommunication.call("INSERT INTO 'IChequesAuthentication'.'ACCOUNT'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: $.extend({
                            name: name,
                            email: email,
                            cpf: cpf,
                            zipcode: zipcode,
                            ddd: ddd,
                            phone: phone
                        }, data),
                        success: function () {
                            modal.close();
                            callback();
                        }
                    })));
        });
        var actions = modal.createActions();
        actions.add("Voltar").click(function (e) {
            e.preventDefault();
            modal.close();
            controller.call("icheques::createAccount", callback);
        });

        actions.add("Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("icheques::createAccount", function (callback) {
        var modal = controller.call("modal");
        modal.title("Crie sua conta iCheques");
        modal.subtitle("Informe seu usuário e senha desejados para continuar");
        modal.addParagraph("Sua senha é secreta e recomendamos que não a revele a ninguém.");

        var form = modal.createForm(),
                inputUsername = form.addInput("user", "text", "Usuário"),
                inputPassword = form.addInput("password", "password", "Senha"),
                inputConfirmPassword = form.addInput("password-confirm", "password", "Confirmar Senha");

        form.addSubmit("login", "Próximo Passo");

        form.element().submit(function (e) {
            e.preventDefault();

            var errors = [],
                    username = inputUsername.val(),
                    password = inputPassword.val(),
                    confirmPassword = inputConfirmPassword.val();

            if (/^\s*$/.test(username)) {
                inputUsername.addClass("error");
                errors.push("O nome de usuário esta em branco.");
            } else if (!/^[a-z]{4,}$/i.test(username)) {
                inputUsername.addClass("error");
                errors.push("O nome de usuário é inválido.");
            } else {
                inputUsername.removeClass("error");
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

            controller.serverCommunication.call("SELECT FROM 'HARLANAUTHENTICATION'.'USERNAMETAKEN'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            username: username
                        },
                        success: function () {
                            modal.close();
                            controller.call("icheques::createAccount::1", {
                                username: username,
                                password: password
                            }, callback);
                        }
                    })));
        });

        var actions = modal.createActions(); 
        
        actions.add("Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });
        
        actions.add("Login").click(function (e) {
            e.preventDefault();
            modal.close();
            controller.call("icheques::login", callback);
        });
    });

    controller.registerCall("icheques::login", function (callback) {
        var modal = controller.call("modal");
        modal.title("Autentique-se");
        modal.subtitle("Informe seu usuário e senha para continuar");
        modal.addParagraph("Sua senha é secreta e recomendamos que não a revele a ninguém.");

        var form = modal.createForm(),
                inputUsername = form.addInput("user", "text", "Usuário"),
                inputPassword = form.addInput("password", "password", "Senha");

        form.addSubmit("login", "Autenticar");

        form.element().submit(function (e) {
            e.preventDefault();
            controller.call("authentication::authenticate", inputUsername, inputPassword, false, function () {
                modal.close();
                callback();
            });
        });

        var actions = modal.createActions();

        actions.add("Criar Conta").click(function (e) {
            e.preventDefault();
            controller.call("icheques::createAccount", function () {
                controller.call("icheques::login", callback);
            });
            modal.close();
        });

        actions.add("Esqueci minha Senha").click(function (e) {
            e.preventDefault();
            controller.call("forgotPassword", function () {
                controller.call("icheques::login", callback);
            });
            modal.close();
        });

        actions.add("Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("authentication::need", function (callback) {
        if (controller.serverCommunication.freeKey()) {
            controller.call("icheques::login", callback);
            return true;
        }

        if (callback) {
            callback();
        }

        return false;
    });

};