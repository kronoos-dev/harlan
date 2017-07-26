module.exports = function (controller) {

    var siteTemplate = require('../../templates/jane-site.html.js'),
            emailRegex = require("email-regex");

    document.title = "A Aranha Vendedora | Jane";
    controller.interface.helpers.changeFavicon('/images/jane.png');
    require("../../styles/jane.js");
    $(controller.confs.container).append(siteTemplate);

    var resize = function () {
        $("body > .jane-site .call-to-action").css({
            "min-height": $(window).height(),
            "height": $(window).height()
        });
    };

    $(window).resize(resize);
    resize();

    /* única forma segura de sair do sistema e voltar a home */
    $("body > .jane-site .action-login").click(function () {
        controller.interface.helpers.activeWindow(".login");
    });

    controller.registerCall("default::page", function () {
        controller.interface.helpers.activeWindow(controller.confs.isPhone ?
            ".login" : ".jane-site");
    });

    var emailInput = $("body > .jane-site .email");
    $("body > .jane-site .form-createAccount").submit(function (e) {
        e.preventDefault();
        if (!emailRegex().test(emailInput.val())) {
            emailInput.addClass("error");
            return;
        }
        emailInput.removeClass("error");
        controller.call("bipbop::createAccount", emailInput.val());
    });

    $(".jane-site .action-buy").click(function (e) {
        e.preventDefault();
        controller.call("bipbop::createAccount");
    });

};
