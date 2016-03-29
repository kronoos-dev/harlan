/* global Iugu, TwinBcrypt, toastr, module */
var AES = require("crypto-js/aes"),
        CryptoJS = require("crypto-js"),
        owasp = require('owasp-password-strength-test');

/**
 * Gere o Token da IUGU no Harlan para Cobrar de Seus Clientes! =D
 */
module.exports = function (controller) {

    var loaded = false;

    var iuguError = function () {
        controller.call("alert", {
            title: "Ocorreu um erro no sistema de pagamentos!",
            subtitle: "Não foi possível carregar a biblioteca de pagamentos.",
            paragraph: "Para que o sistema carregue corretamente é necessário que todo o domínio iugu.com esteja liberado, solicite ao seu administrador de redes."
        });
    };

    var iuguKey = function () {
        return 'iugu_' + controller.confs.iugu.token;
    };

    var getPaymentToken = function (callback, password) {
        if (typeof localStorage[iuguKey()] === "undefined") {
            callback();
            return;
        }

        var data = JSON.parse(localStorage[iuguKey()]);

        var getToken = function (password) {

            if (!TwinBcrypt.compareSync(password, data.password)) {
                return false;
            }

            Iugu.createPaymentToken(JSON.parse(
                    AES.decrypt(data.token, password)
                    .toString(CryptoJS.enc.Utf8)
                    .replace(/^[^{]+/, '')), function (paymentToken) {
                callback(paymentToken);
            });

            return true;
        };

        if (password && getToken(password)) {
            return;
        }

        var modal = controller.call("modal");
        modal.title("Cartão de Crédito");
        modal.subtitle("Digite a senha que configurou para seu cartão " + data.cardLabel);
        modal.addParagraph("Armazenamos seu cartão de crédito com segurança, para acessá-lo é necessário que você digite a senha que usou para registrar o mesmo.");
        var form = modal.createForm();
        var passwordInput = form.addInput("password", "password", "Senha do cartão " + data.cardLabel);
        form.addSubmit("submit", "Acessar");
        form.element().submit(function (e) {
            e.preventDefault();
            if (!getToken(passwordInput.val())) {
                passwordInput.addClass("error");
                return;
            }
            modal.close();
        });

        var actions = modal.createActions();
        actions.add("Atualizar Método de Pagamento").click(function (e) {
            e.preventDefault();
            callback(null);
            modal.close();
        });

        actions.add("Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

        return true;
    };

    var owaspAlert = function (finish) {
        var modal = controller.call("modal");
        modal.title("Sua senha não é tão segura!");
        modal.subtitle("Você deseja continuar mesmo assim?");
        modal.addParagraph("Quanto mais forte a senha, mais protegido estará o computador contra os hackers e softwares mal-intencionados. Use para uma frase secreta ou senha de no mínimo oito dígitos, com números, caracteres especiais, letras minúsculas e maiúsculas.");
        var form = modal.createForm();

        form.element().submit(function (e) {
            e.preventDefault();
            modal.close();
        });

        form.addSubmit("changepw", "Mudar Senha");

        modal.createActions().add("Eu aceito o risco!").click(function (e) {
            e.preventDefault();
            modal.close();
            finish();
        });
    };

    var storePaymentToken = function (token, creditCard, cardLabel, callback, password) {

        var saveToken = function (password) {
            localStorage[iuguKey()] = JSON.stringify({
                token: AES.encrypt(CryptoJS.lib.WordArray.random(256).toString() +
                        JSON.stringify(creditCard), password).toString(),
                cardLabel: cardLabel,
                password: TwinBcrypt.hashSync(password)
            });
        };

        if (password) {
            saveToken(password);
            callback(token);
            return;
        }

        var modal = controller.call("modal");
        modal.title("Cartão de Crédito");
        modal.subtitle("Defina uma senha para seu cartão " + cardLabel);
        modal.addParagraph("Armazenamos seu cartão de crédito com segurança, para acessá-lo novamente é necessário que crie uma senha de cobranças.");
        var form = modal.createForm();
        var passwordInput = form.addInput("password", "password", "Senha para o cartão " + cardLabel);
        form.addSubmit("submit", "Configurar Senha");

        form.element().submit(function (e) {
            e.preventDefault();
            var password = passwordInput.val();

            var finish = function () {
                saveToken(password);
                modal.close();
                callback(token);
            };

            if (!owasp.test(password).strong) {
                owaspAlert(finish);
                return;
            }

            finish();

        });

        var actions = modal.createActions();
        actions.add("Não Armazenar o Cartão").click(function (e) {
            callback(token);
            modal.close();
        });
        actions.add("Cancelar").click(function (e) {
            modal.close();
        });
    };

    var getCreditCard = function (callback, config) {
        config = config || {};
        var modal = controller.call("modal");
        modal.title(config.title || "Cartão de Crédito");
        modal.subtitle(config.subtitle || "Configure seu Cartão de Crédito");
        modal.addParagraph(config.paragraph || "Armazenamos seu cartão de crédito com segurança, para acessá-lo novamente é necessário que crie uma senha de cobranças.");
        var form = modal.createForm();

        var creditCardHead = form.multiField(),
                creditCardFooter = form.multiField();

        var inputCardNumber = form.addInput("credit-card", "text", "Número do Cartão", {
            labelPosition: "before",
            append: creditCardHead}, "Número do Cartão").payment('formatCardNumber').addClass("cc-number").magicLabel(),
                inputCardExpiry = form.addInput("expire", "text", "Mês / Ano", {
                    labelPosition: "before",
                    append: creditCardHead
                }, "Vencimento").payment('formatCardExpiry').addClass("cc-expiry").magicLabel(),
                inputCardHolder = form.addInput("holder", "text", "Nome do Titular", {
                    labelPosition: "before",
                    append: creditCardFooter
                }, "Nome do Titular").addClass("cc-holder").magicLabel(),
                inputCardCVV = form.addInput("cvv", "text", "CVV do Cartão (verso)", {
                    labelPosition: "before",
                    append: creditCardFooter
                }, "CVV").addClass("cc-cvv").magicLabel();

        form.addSubmit("submit", config.submit || "Configurar Cartão");

        form.element().submit(function (e) {
            e.preventDefault();

            var errors = [];

            var cardNumber = inputCardNumber.val();
            if (!$.payment.validateCardNumber(cardNumber)) {
                errors.push("O número do cartão de crédito não confere.");
                inputCardNumber.addClass("error");
            } else {
                inputCardNumber.removeClass("error");
            }


            var cardExpire = inputCardExpiry.val().split("/").map(function (v) {
                return v.replace(/[^\d]/, "");
            });

            if (cardExpire.length !== 2 || !$.payment.validateCardExpiry(cardExpire[0], cardExpire[1])) {
                errors.push("A data de expiração do cartão de crédito não confere.");
                inputCardExpiry.addClass("error");
            } else {
                inputCardExpiry.removeClass("error");
                if (cardExpire[1].length === 2)
                    cardExpire[1] = '20' + cardExpire[1];
            }

            var cardCVV = inputCardCVV.val();
            if (!$.payment.validateCardCVC(cardCVV, $.payment.cardType(cardNumber))) {
                errors.push("O CVV do cartão de crédito não confere.");
                inputCardCVV.addClass("error");
            } else {
                inputCardCVV.removeClass("error");
            }

            var names = inputCardHolder.val().split(" ");
            if (names.length < 2) {
                inputCardHolder.addClass("error");
            } else {
                inputCardHolder.removeClass("error");
            }

            if (errors.length) {
                for (var i in errors) {
                    toastr.warning(errors[i], "Verifique seu cartão de crédito");
                }
                return;
            }

            callback({
                number: cardNumber,
                month: cardExpire[0],
                year: cardExpire[1],
                first_name: names[0],
                last_name: names[names.length - 1],
                verification_value: cardCVV
            });

            modal.close();
        });

        var actions = modal.createActions();

        actions.add("Cancelar").click(function (e) {
            modal.close();
        });
    };

    controller.registerCall("getCreditCard", function (callback, config) {
        return getCreditCard(callback, config);
    });

    controller.registerBootstrap("iugu::init", function (callback) {
        var alreadyLoaded = false,
                timeout = setTimeout(function () {
                    alreadyLoaded = true;
                    console.error("Iugu can't load");
                    callback();
                }, 5000);

        $.getScript("https://js.iugu.com/v2", function () {
            loaded = true;
            clearTimeout(timeout);
            if (!alreadyLoaded) {
                callback(); /* Fucking Done! */
            }
        });
    });

    controller.registerCall("iugu::requestPaymentToken", function (callback, passesErrors, password) {
        if (!loaded) {
            return iuguError();
        }
        Iugu.setAccountID(controller.confs.iugu.token);
        console.log("Iugu::requestPaymentToken", callback);
        getPaymentToken(function (paymentToken) {
            if (paymentToken) {
                callback(paymentToken);
                return;
            }

            getCreditCard(function (creditCard) {
                Iugu.createPaymentToken(creditCard, function (paymentToken) {
                    if (paymentToken.errors) {
                        if (passesErrors) {
                            callback(paymentToken);
                        } else {
                            var errors = typeof paymentToken.errors === "string" ? [paymentToken.errors] : paymentToken.errors;
                            for (var i in errors) {
                                /* toast error */
                                toastr.error(errors[i]);
                            }
                            controller.call("iugu::requestPaymentToken", callback, passesErrors, password);
                        }
                        return;
                    }
                    storePaymentToken(paymentToken, creditCard, creditCard.number.slice(-4), callback, password);
                });
            });
        });
    });
};
