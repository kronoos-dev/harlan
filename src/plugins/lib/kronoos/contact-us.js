module.exports = (controller) => {

    $(".kronoos-site .action-message").click((e) => {
        e.preventDefault();
        controller.call("kronoos::site::contact");
    });

    controller.registerCall("kronoos::site::contact", (email, subject, message) => {
        var form = controller.call("form", (opts) => {
            controller.serverCommunication.call("SELECT FROM 'KRONOOS'.'CONTACT'", {
                data: opts,
                success: function () {
                    controller.call("alert", {
                        icon: pass,
                        title: "Mensagem enviada com sucesso",
                        subtitle: "Em breve entraremos em contato",
                        text: "Nossas mensagens costumam ser respondidas em menos de um dia útil."
                    });
                }
            });
        });
        form.configure({
            "title": "Fale Conosco",
            "subtitle": "Entre em contato através do formulário abaixo.",
            "gamification": "magicWand",
            "paragraph": "Preencha todos os campos abaixo para que possamos entrar em contato o maix breve possível.",
            "screens": [{
                "nextButton": "Entrar em Contato",
                "magicLabel": true,
                "fields": [
                    [{
                        "name": "name",
                        "type": "text",
                        "placeholder": "Nome",
                        "optional": false,
                        "labelText": "Nome"
                    }, {
                        "name": "email",
                        "type": "text",
                        "placeholder": "Email",
                        "labelText": "E-mail",
                        "optional": false,
                        "value": email
                    }],
                    [{
                        "name": "telephone",
                        "type": "text",
                        "placeholder": "Telefone",
                        "optional": false,
                        "labelText": "Telefone",
                        "mask": "(00) 00009-0000"
                    }, {
                        "name": "company",
                        "type": "text",
                        "placeholder": "Empresa",
                        "optional": false,
                        "labelText": "Empresa",
                    }],
                    [{
                        "name": "subject",
                        "type": "text",
                        "placeholder": "Assunto",
                        "labelText": "Assunto",
                        "optional": false,
                        "value": subject
                    }, {
                        "name": "position",
                        "type": "text",
                        "placeholder": "Cargo",
                        "labelText": "Cargo",
                        "optional": true,
                    }], {
                        "name": "message",
                        "type": "textarea",
                        "placeholder": "Mensagem",
                        "labelText": "Mensagem",
                        "optional": false,
                        "value": "message"
                    }
                ]
            }]
        });
    });

};
