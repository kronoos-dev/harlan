module.exports = function (controller) {

    var siteTemplate = require('../../templates/icheques-site.html.js'),
            emailRegex = require("email-regex"),
            installDatabase = require("../../sql/icheques.sql.js");

    installDatabase(controller);

    document.title = "Proteja sua carteira de cheques | iCheques";
    controller.interface.helpers.changeFavicon("images/icheques/favicon.png");
    require("../../styles/icheques.js");
    $("body").append(siteTemplate);

    $("body > .icheques-site .call-to-action").css({
        "min-height": $(window).height()
    });

    /* Instalar o CHECKOUT HARLAN aqui */

    $("body > .icheques-site .action-login").click(function () {
        controller.interface.helpers.activeWindow(".login");
    });

    controller.registerCall("default::page", function () {
        controller.interface.helpers.activeWindow(".icheques-site");
    });

    var emailInput = $("body > .icheques-site .email");
    $("body > .icheques-site .form-trial").submit(function (e) {
        e.preventDefault();
        if (!emailRegex().test(emailInput.val())) {
            emailInput.addClass("error");
            return;
        }
        emailInput.removeClass("error");
        controller.call("icheques::newcheck");
    });

    $(".icheques-site .action-buy-harlan, .icheques-site .action-buy").click(function (e) {
        e.preventDefault();
        controller.call("icheques::createAccount", function () {
            var modal = controller.call("modal");
            modal.title("Você completou sou cadastro no iCheques");
            modal.subtitle("Parabéns! Sua conta foi criada com sucesso.");
            modal.addParagraph("Esperamos que tenha uma ótima experiência com nosso produto, a partir de agora nunca mais se preocupe se seus cheques estão seguros em sua carteira.");
            var form = modal.createForm();
            form.element().submit(function (e) {
                e.preventDefault();
            });
            form.addSubmit("exit", "Sair");
        });
    });

};