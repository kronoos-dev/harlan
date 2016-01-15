/* global toastr, module, require */

module.exports = function (controller) {

    var CPF = require("cpf_cnpj").CPF, CNPJ = require("cpf_cnpj").CNPJ;

    var validNewAccount = function (document, password) {
        if (password.length < 6) {
            toastr.error("Sua senha precisa de no mínimo 6 caracteres", "Senha informada é muito fraca");
            return false;
        }

        if (!(CPF.isValid(document) || CNPJ.isValid(document))) {
            toastr.error("Verifique e tente novamente", "O CPF/CNPJ informado não é válido");
            return false;
        }
        
        return true;
    };

    controller.registerCall("icheques::authentication::login", function (email, callback, action) {
        var modal = controller.call("modal");
        modal.title("Digite a senha de seu usuário");
        modal.subtitle("Para prosseguir é necessário que preencha sua senha");

        var form = modal.createForm(),
                inputPassword = form.addInput("password", "password", "Senha da sua conta", {}, "Senha");
        form.addSubmit("submit", action || "Entrar");
        form.element().submit(function (e) {
            e.preventDefault();
            controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CUSTOMER'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            email: email,
                            password: inputPassword.val()
                        },
                        success: function (data) {
                            callback(data);
                        },
                        error: function () {
                            inputPassword.addClass("error");
                        }
                    })));
        });
    });

    controller.registerCall("icheques::authentication::createAccount", function (callback, email, title, subtitle, paragraph) {
        var modal = controller.call("modal");
        modal.title(title || "Você não possui cadastro no iCheques");
        modal.subtitle(subtitle || "Cadastre agora para começar a se proteger.");
        modal.addParagraph(paragraph || "Você precisa cadastrar para começar a acompanhar seus cheques, digite seus dados e clique em continuar.");

        var form = modal.createForm(),
                options = {
                    onKeyPress: function (input, e, field, options) {
                        var masks = ['000.000.000-009', '00.000.000/0000-00'],
                                mask = (input.length > 14) ? masks[1] : masks[0];
                        inputDocument.mask(mask, options);
                    }
                }, inputDocument = form.addInput("CPF/CNPJ", "text", "CPF/CNPJ impresso no cheque.", {}, "CPF/CNPJ (?)").mask("000.000.000-00", options),
                inputBirthday = form.addInput("birthday", "text", "00/00/0000", {}, "Data de Nascimento").mask("00/00/0000"),
                inputCEP = form.addInput("zipcode", "text", "11630-000", {}, "CEP").mask("00000-000"),
                inputPhone = form.addInput("phone", "text", "(11) 99999-9999", {}, "Telefone").mask("(00) 00009-0000"),
                inputPassword = form.addInput("password", "password", "Digite sua senha (mínimo 6 caracteres)", {}, "Senha");

        form.addSubmit("signup", "Cadastrar");

        form.element().submit(function (e) {
            e.preventDefault();

            var document = inputDocument.val(), password = inputPassword.val();
            if (!validNewAccount(document, password)) {
                return false;
            }

            controller.serverCommunication.call("INSERT INTO 'ICHEQUES'.'CUSTOMER'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            document: document,
                            birthday: inputBirthday.val(),
                            cep: inputCEP.val(),
                            phone: inputPhone.val(),
                            password: password
                        },
                        success: function (data) {
                            callback(data);
                            modal.close();
                        }
                    })));
        });

        modal.createActions().add("Cancelar").click(function (e) {
            e.preventDefault();
            callback(null);
            modal.close();
        });

        return null;
    });


    controller.registerCall("icheques::authentication::hasAccount", function (email, callback) {
        controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CUSTOMER'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    data: {
                        email: email
                    },
                    success: function (data) {
                        askPassword(email, callback);
                    },
                    error: function () {
                        registerModal(callback);
                    }})));
    });

};