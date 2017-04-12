import _ from 'underscore';

module.exports = function (controller) {

    controller.registerCall("accuracy::field", (question, reasons = {}) => {
        if (question.question_type === "multichoice") {
            return {
                labelPosition: "before",
                name: `id_${question.id}`,
                type: "select",
                placeholder: question.question,
                labelText: question.question,
                optional: false,
                list: {
                    "" : "Selecione uma resposta",
                    "Y": "Sim",
                    "N": "Não"
                },
                validate: (item, screen, configuration) => {
                    let key = `id_${question.id}`;
                    if (item.element.val() != question.interaction_answer) return true;
                    if (reasons[key]) return true;
                    let modal = controller.call("modal");
                    modal.title("Qual o motivo de sua resposta?");
                    modal.subtitle("Descreva o motivo de sua resposta.");
                    modal.paragraph("Informe da forma mais completa possível antes de prosseguir.");
                    let form = modal.createForm();
                    let textarea = form.addTextarea("description", "Descrição da resposta");
                    form.addSubmit("continuar", "Continuar");
                    form.element().submit((e) => {
                        e.preventDefault();
                        let value = textarea.val();
                        if (/^\s*$/.test(value)) {
                            textarea.addClass("error");
                            return;
                        }
                        reasons[key] = value;
                        modal.close();
                    });
                    return true;
                }
            };
        }

        return {
            name: `id_${question.id}`,
            type: "textarea",
            placeholder: question.question,
            labelText: question.question,
            optional: false,
            labelPosition: "before",
        };
    });

    controller.registerCall("accuracy::fields", (questions, reasons = {}) => {
        let q = [];
        for (let question of questions) {
            q.push(controller.call("accuracy::field", question, reasons));
        }
        return q;
    });

    controller.registerCall("accuracy::question", (questions, callback, onCancel, opts = {}) => {
        var reasons = {};
        let form = controller.call("form", (ret) => {
            let questionResponse = [];
            for (let key in ret) {
                let questionId = parseInt(key.replace(/^id\_/, ''));
                let val;
                if (_.find(questions, x => x.id == questionId).question_type === "multichoice") {
                    val = reasons[key] ? reasons[key] : null;
                } else {
                    val = ret[key];
                }
                questionResponse.push({
                    id: questionId,
                    reason: val
                });
            }
            callback(questionResponse);
        }, onCancel);
        form.configure(Object.assign({
            "title": opts.title || "Perguntas do check-in" ,
            "subtitle": "Para prosseguir com seu check-in por favor responda as perguntas abaixo.",
            "paragraph": "É importante para o gestor que as perguntas sejam bem respondidas.",
            "screens": [{
                "fields": controller.call("accuracy::fields", questions, reasons)
            }]
        }, opts));
    });

};
