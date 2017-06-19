module.exports = (controller) => {

    var config = [{
        'event': "next",
        selector: "#kronoos-q",
        description : "Digite aqui um CPF/CNPJ para começar sua pesquisa Kronoos.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event':"next",
        selector: "#kronoos-action > button",
        description: "Clique neste botão para realizar sua consulta.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event': "next",
        selector: "#kronoos-q-container > i.fa.fa-search.icon",
        description : "Deseja realizar uma pesquisa por nome?<br />Clique na lupa para buscar.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event': "next",
        selector: "#kronoos-q-container > i.fa.fa-thermometer-2.depth",
        description : "Controle a profundidade e tempo das buscar com o termômetro.<br />Você no controle do tempo e qualidade das consultas.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event': "next",
        selector: "body > div.kronoos-application > div.search-bar.full > div > div > div > nav > i",
        description: "Encontre mais opções acessando o menu de nossa aplicação.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event':"next",
        selector: "#chat-application",
        description: "Precisa de ajuda?<br />Fale conosco no chat online.<br /> (Ao vivo, 24/7)",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }, {
        'event': "next",
        selector: "#kronoos-q-container > img",
        description: "Quer limpar a tela de resultados?<br/>Clique na logomarca.",
        nextButton: {text: "Próximo"},
        skipButton: {text: "Sair"},
        showNext: true,
        showSkip: false,
    }];

    controller.registerTrigger("authentication::authenticated::end", "enjoyhint", (data, cb) => {
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
