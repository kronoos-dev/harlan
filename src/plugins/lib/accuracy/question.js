module.exports = function (controller) {

    controller.registerCall("accuracy::field", (question, reasons = {}) => {
        if (question.question_type === "multichoice") {
            return {
                name: `id-${question.name}`,
                type: "select",
                placeholder: question.question,
                labelText: question.question,
                optional: false,
                list: {"" : "Selecione uma resposta", "S": "Sim", "N": "Não"},
                validate: (item, screen, configuration) => {
                    if (item.element.val() != question.interaction_answer) return;
                    let modal = controller.call("modal");
                    modal.title("Qual o motivo de sua resposta?");
                    modal.subtitle("Descreva o motivo de sua resposta.");
                    modal.paragraph("Informe da forma mais completa possível antes de prosseguir.");
                    let form = modal.createForm(),
                        textarea = form.addTextarea("description", "Descrição da resposta");
                    form.addSubmit("continuar", "Continuar");
                    form.element().submit((e) => {
                        e.preventDefault();
                        let value = textarea.val();
                        if (/^.*$/.test(value)) {
                            textarea.addClass("error");
                            return;
                        }
                        reasons[`id-${question.name}`] = value;
                        modal.close();
                    });
                }
            };
        }

        return {
            name: `id-${question.name}`,
            type: "textarea",
            placeholder: question.question,
            labelText: question.question,
            optional: false,
        };
    });

    controller.registerCall("accuracy::fields", (questions, reasons = {}) => {
        let q = [];
        for (let question of questions) {
            q.push(controller.call("accuracy::field", question, reasons));
        }
        return q;
    });

    controller.registerCall("accuracy::question", (questions, callback, opts = {}) => {
        let form = controller.call("form", callback);
        form.configure(Object.assign({
            "title": "Perguntas do check-in" ,
            "subtitle": "Para prosseguir com seu check-in por favor responda as perguntas abaixo.",
            "paragraph": "É importante para o gestor que as perguntas sejam bem respondidas.",
            "screens": [{
                "fields": controller.call("accuracy::fields", questions)
            }]
        }, opts));
    });

};
