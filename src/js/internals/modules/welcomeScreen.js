var emailRegex = require('email-regex');

module.exports = function (controller) {

    controller.registerCall("buyit", function () {
        var modal = controller.call("modal");
        modal.title("Adquira-já!");
        modal.subtitle("Você ainda não comprou o Harlan?");
        modal.addParagraph("A funcionalidade que você esta tentando acessar é exclusiva para usuários, caso você ainda não seja basta assinar na página da BIPBOP.");
        var form = modal.createForm();
        form.element().submit(function (e) {
            e.preventDefault();
            document.location.href = controller.confs.checkoutUrl;
        });

        form.addSubmit("buy", "Adquirir");
        form.addSubmit("cancel", "Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerTrigger("authentication::authenticated", function (args, runsAtEnd) {
        if (!localStorage.welcome) {
            controller.call(controller.serverCommunication.apiKey === BIPBOP_FREE ?
                    "welcomescreen::email" : "welcomescreen::wizard");
            localStorage.welcome = true;
        }
        runsAtEnd();
    });

    var createModal = function (modal) {
        if (!modal) {
            modal = controller.call("modal");
            modal.title("Conheça o Harlan");
        }
        return modal;
    };

    var deleteElements = function (elements) {
        for (var i in elements)
            elements[i].remove();
    };

    var nextBack = function (modal, nextFnc, backFnc, elements) {
        var form = modal.createForm();
        form.element().submit(function (e) {
            e.preventDefault();
            nextFnc();
        });
        form.addSubmit("next", "Próximo");
        form.addSubmit("back", "Voltar").click(function (e) {
            e.preventDefault();
            backFnc();
        });
        elements.push(form.element());
    };

    controller.registerCall("welcomescreen::wizard", function (modal) {
        modal = createModal(modal);
        var elements = [];
        elements.push(modal.subtitle("Segurança para sua governança cadastral."));
        elements.push(modal.imageParagraph("/images/wizard_1.svg", "Conectar seus cadastros na nuvem permite você que fique sempre atento quando uma informação mudar, saiba sempre a situação de seus clientes e fornecedores para realizar seus negócios com segurança.", null, null));
        nextBack(modal, function () {
            deleteElements(elements);
            controller.call("welcomescreen::wizard::1", modal);
        }, function () {
            deleteElements(elements);
            controller.call("welcomescreen::email", modal);
        }, elements);
    });

    controller.registerCall("welcomescreen::wizard::1", function (modal) {
        modal = createModal(modal);
        var elements = [];
        elements.push(modal.subtitle("Acompanhe a evolução e o risco."));
        elements.push(modal.imageParagraph("/images/wizard_2.svg", "Acompanhe em tempo real e evolução e o risco de seus cadastros, se mantenha informado de eventuais problemas com nosso PUSH que permite receber atualizações onde quer quer você esteja.", null, null));
        nextBack(modal, function () {
            deleteElements(elements);
            controller.call("welcomescreen::wizard::2", modal);
        }, function () {
            deleteElements(elements);
            controller.call("welcomescreen::wizard", modal);
        }, elements);
    });

    controller.registerCall("welcomescreen::wizard::2", function (modal) {
        modal = createModal(modal);
        var elements = [];
        elements.push(modal.subtitle("Sistema open-source e modular."));
        elements.push(modal.imageParagraph("/images/wizard_3.svg", "Nosso sistema é aberto, permite ajustes e informações de terceiros, para se integrar basta adicionar sua fonte no Marketplace BIPBOP ou se desejar criar um módulo para nossa ferramenta basta adicionar um JavaScript, simples e fácil.", null, null));
        nextBack(modal, function () {
            modal.close();
        }, function () {
            deleteElements(elements);
            controller.call("welcomescreen::wizard::1", modal);
        }, elements);
    });

    controller.registerCall("welcomescreen::putemail", function (modal) {
        modal = createModal(modal);
        
        var elements = [];
        
        elements.push(modal.subtitle("Uma nova experiência em busca cadastral."));
        elements.push(modal.addParagraph("Harlan é a ferramenta que conecta seus cadastros e relatórios na nuvem e te avisa se algum acoisa mudar, como o endereço de todos os seus clientes. Fique sabendo o que aconteceu na hora que aconteceu, não permita que cadastros desatualizados atrapalhem para seu negócio, conheça o Harlan preenchendo seu e-mail agora."));

        var form = modal.createForm();
        elements.push(form.element());

        var inputEmailAddress = form.addInput("email-address", "text", "Qual seu endereço de e-mail?");
        
        form.addSubmit("submit", "Próximo");

        form.element().submit(function (e) {
            e.preventDefault();
            var email = inputEmailAddress.val();
            if (!emailRegex().test(email)) {
                inputEmailAddress.addClass("error");
                toastr.warning("Seu endereço de email não parece ser válido.", "Endereço de email inválido.");
                return;
            }

            controller.serverCommunication.call("INSERT INTO 'HARLANMAILLIST'.'Addresses'", {
                data: {
                    address: email
                }
            });

            deleteElements(elements);
            controller.call("welcomescreen::wizard", modal);
        });
        
    });

    controller.registerCall("welcomescreen::email", function (modal) {
        modal = createModal(modal);

        var elements = [];
        elements.push(modal.subtitle("Uma nova experiência em busca cadastral."));
        elements.push(modal.addParagraph("Harlan é a ferramenta que conecta seus cadastros e relatórios na nuvem e te avisa se algum acoisa mudar, como o endereço de todos os seus clientes. Fique sabendo o que aconteceu na hora que aconteceu, não permita que cadastros desatualizados atrapalhem para seu negócio, conheça o Harlan preenchendo seu e-mail agora."));

        var form = modal.createForm();
        elements.push(form.element());
        
        var submitForm = function (name) {
            return function (e) {
                e.preventDefault();
                controller.call("oauth::call", [name, null, function () {
                    toastr.warning("Não foi possível autenticar, tente novamente.");
                }, function () {
                    deleteElements(elements);
                    controller.call("welcomescreen::wizard", modal);
                }]);
            };
        };
        
        form.addSubmit("submit", "Usar a conta Google").click(submitForm("google_plus"));
        form.addSubmit("submit", "Usar a conta LinkedIn").click(submitForm("linkedin2"));
        
        form.addSubmit("submit", "Usar minha conta de e-mail.").removeClass("button").addClass("link").click(function (e) {
            e.preventDefault();
            deleteElements(elements);
            controller.call("welcomescreen::putemail", modal);
        });
    });

};