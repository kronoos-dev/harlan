module.exports = (controller) => {

    var config = [{
        'event': "next",
        selector: "button:contains('Adicionar Cheque')",
        description : "Clique aqui para adicionar um cheque.<br />Fique seguro, monitore seus cheques conosco.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event': "next",
        selector: "button:contains('Solicitar Antecipação'), button:contains('Quero Antecipar Cheques!')",
        description : "Clique aqui para antecipá-los.<br />Envie hoje mesmo para um de nossos Parceiros Financeiros.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event': "next",
        selector: ".action-credits",
        description : "Inserimos crédito de cortesia.<br />Quando acabar, clique aqui para adicionar mais.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event': "next",
        selector: ".support-phone",
        description: "Precisa de ajuda?<br />Ligue para nosso Suporte (9am - 5pm).",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event':"next",
        selector: "#chat-application",
        description: "Ou fale conosco no chat online.<br /> (Ao vivo, 24/7)",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }];

    controller.registerTrigger("call::icheques::welcome", "enjoyhint", (data, cb) => {
        cb();
        if (!EnjoyHint || localStorage.seeEnjoyhint) return;
        let clockElements;
        clockElements = setInterval(() => {
            for (let element of config) {
                if (!$(element.selector).length) return;
            }
            clearInterval(clockElements);
            var ei = new EnjoyHint();
            ei.set(config);
            ei.run();
        }, 5000);
        localStorage.seeEnjoyhint = true;
    });
};
