/* global module */

var loaderRegister = 0,
    loaderUnregister = null;

module.exports = function(controller) {

    controller.unregisterTriggers("serverCommunication::websocket::sendMessage");
    controller.unregisterTrigger("authentication::authenticated", "inbox");

    controller.confs.subaccount.icons = ["fa-key", "fa-folder-open"];

    var siteTemplate = require('../../templates/icheques-site.html.js'),
        emailRegex = require("email-regex"),
        installDatabase = require("../../sql/icheques.sql.js");

    installDatabase(controller);

    /* Sem demonstração */
    $("#demonstration").parent().hide();

    /* Cadastrar no Login */
    $(".login .actions").append($("<li />").append($("<a />").text("Cadastrar").click((e) => {
        e.preventDefault();
        controller.call("icheques::createAccount", function(data) {
            var modal = controller.call("modal");
            modal.title("Você completou sou cadastro no iCheques");
            modal.subtitle("Parabéns! Sua conta foi criada com sucesso.");
            modal.addParagraph("A última etapa necessária é confirmar seu endereço de e-mail na sua caixa de entrada.");
            modal.addParagraph("Esperamos que tenha uma ótima experiência com nosso produto, a partir de agora nunca mais se preocupe se seus cheques estão seguros em sua carteira.");
            var form = modal.createForm();
            form.element().submit(function(e) {
                e.preventDefault();
                modal.close();
            });
            form.addSubmit("exit", "Entrar");
        }, "retail", {
            type: "retail"
        });
    })));

    document.title = "Proteja sua carteira de cheques | iCheques";
    controller.interface.helpers.changeFavicon("/images/icheques/favicon.png");
    require("../../styles/icheques.js");

    $("#login-about").text("Para acessar sua conta faça o login com usuário ou email e senha cadastrados.");

    $(controller.confs.container).append(siteTemplate);
    $("#input-q").attr("placeholder",
        controller.confs.isPhone ? "Pesquise por um cheque." :
        "Pesquise por um CPF/CNPJ ou número de cheque cadastrado." );
    $(".actions .container").prepend($("<div />").addClass("content support-phone").text("(11) 3661-4657 (Suporte)").prepend($("<i />").addClass("fa fa-phone")));
    $("body > .icheques-site .call-to-action").css({
        "height": window.innerHeight
    });

    $("#action-show-modules").parent().parent().hide();

    $(".logo").click(() => {
        $("section.group-type,footer.load-more").remove();
    }).css("cursor", "pointer");

    /* única forma segura de sair do sistema e voltar a home */
    controller.registerTrigger("authentication::authenticated", "icheques::design::authentication::authenticated", function(args, cb) {
        cb();
        $("#action-logout").off().click(function(e) {
            e.preventDefault();
            window.location = "https://www.icheques.com.br/";
        });
    });

    $("body > .icheques-site .action-login").click(function() {
        controller.interface.helpers.activeWindow(".login");
    });

    controller.registerTrigger("authentication::authenticated", "welcomeScreen::authenticated", function(args, cb) {
        cb();
    });

    controller.registerCall("default::page", function() {
        controller.interface.helpers.activeWindow(controller.confs.isCordova ?
            ".login" : ".icheques-site");
    });

    var emailInput = $("body > .icheques-site .email");
    $("body > .icheques-site .form-trial").submit(function(e) {
        e.preventDefault();
        if (!emailRegex().test(emailInput.val())) {
            emailInput.addClass("error");
            return;
        }
        emailInput.removeClass("error");
        controller.call("icheques::newcheck");
    });

    $(".icheques-site .action-buy").click(function(e) {
        e.preventDefault();

        var element = $(this);

        controller.call("icheques::createAccount", function(data) {
            var modal = controller.call("modal");
            modal.title("Você completou sou cadastro no iCheques");
            modal.subtitle("Parabéns! Sua conta foi criada com sucesso.");
            modal.addParagraph("Esperamos que tenha uma ótima experiência com nosso produto, a partir de agora nunca mais se preocupe se seus cheques estão seguros em sua carteira.");
            var form = modal.createForm();
            form.element().submit(function(e) {
                e.preventDefault();
                modal.close();
            });
            form.addSubmit("exit", "Entrar");
        }, element.attr("data-contract"), {
            type: element.attr("data-type")
        });
    });

    controller.registerCall("loader::register", function() {
        if (!loaderUnregister && !loaderRegister) {
            loaderUnregister = $.bipbopLoader.register();
        }
        loaderRegister++;
    });

    controller.registerCall("loader::unregister", function() {
        if (loaderRegister - 1 > 0) {
            loaderRegister--;
            return;
        }
        loaderRegister = 0;

        if (loaderUnregister) {
            loaderUnregister();
            loaderUnregister = null;
        }
    });

    $.getScript("https://code.createjs.com/createjs-2015.11.26.min.js", function() {
        var lib = {};
        require("./animation.js")(lib, null, createjs, null);

        let canvas = $("<canvas />").attr({
                width: 225,
                height: 255
            }).css({
                'z-index': 11,
                height: '250px',
                left: '50%',
                'margin-left': '-125px',
                'margin-top': '-125px',
                position: 'relative',
                top: '50%',
                width: '250px'
            }),

            container = $("<div />").css({
                'background-color': 'rgba(30,50,58,.8)',
                'background-position': 'center center',
                'background-repeat': 'no-repeat',
                height: '100%',
                left: '0',
                'z-index': 99999999,
                overflow: 'hidden',
                position: 'fixed',
                top: '0',
                width: '100%',
            }).append(canvas),

            exportRoot = new lib.ichequesanimacao(),
            stage = new createjs.Stage(canvas.get(0));

        stage.addChild(exportRoot);
        stage.update();
        createjs.Ticker.setFPS(lib.properties.fps);
        createjs.Ticker.addEventListener("tick", stage);

        $.bipbopLoader.register = () => {
            $(controller.confs.container).append(container);
            return () => {
                container.remove();
            };
        };
    });

};
