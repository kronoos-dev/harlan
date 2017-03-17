module.exports = (controller) => {
    controller.registerTrigger("call::icheques::welcome", "enjoyhint", (data, cb) => {
        cb();
        var ei = new EnjoyHint();
            ei.set([ {
        		event: "next",
        		selector: "button:contains('Solicitar Antecipação')",
        		description : "Clique aqui para adicionar um cheque",
        		nextButton: {text: "Próximo"},
    	        skipButton: {text: "Sair"},
        		showNext: true,
        		showSkip: false,
        	}, {
        		event: "next",
        		selector: "button:contains('Adicionar Cheque')",
        		description : "Clique aqui para antecipar cheques, preencha seu cadastro e envie para um ou mais Parceiros Financeiros!",
        		nextButton: {text: "Próximo"},
    	        skipButton: {text: "Sair"},
        		showNext: true,
        		showSkip: false,
        	}, {
        		event: "next",
        		selector: "#action-credits",
        		description : "Inserimos crédito de cortesia.  Quando acabar, clique aqui para adicionar mais",
        		nextButton: {text: "Próximo"},
    	        skipButton: {text: "Sair"},
        		showNext: true,
        		showSkip: false,
        	}, {
        		event: "next",
        		selector: ".support-phone",
        		description: "Precisa de ajuda? Ligue para nosso Suporte (9am - 5pm)",
        		nextButton: {text: "Próximo"},
    	        skipButton: {text: "Sair"},
        		showNext: true,
        		showSkip: false,
        	}, {
        		event:"next",
        		selector: "#chat-application",
        		description: "Ou fale conosco no chat online (ao vivo, 24/7)",
        		nextButton: {text: "Próximo"},
    	        skipButton: {text: "Sair"},
        		showNext: true,
        		showSkip: false,
        	}
        ]);

        ei.run();
    });
};
