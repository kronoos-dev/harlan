import each from 'async/each';

module.exports = (controller) => {

    controller.registerCall("admin::message", (apiKeys, section) => controller.call("form", data =>
        each(apiKeys, (apiKey, callback) => $.bipbop("INSERT INTO 'TRIGGER'.'TRIGGER'", apiKey, controller.call("error::ajax", {
            method: 'POST',
            data: JSON.stringify(['inbound', Object.assign({
                filename: 'email-marketing.md' /* formato markdown */
            }, data), moment().unix() + 10]),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            complete: () => callback()
        })), (err) => toastr.success("A mensagem foi enviada com sucesso, dentro de instantes você estará respostas.",
            "Mensagem enviada com sucesso"))).configure({
        "title": "Envio de Email",
        "subtitle": "Preencha os campos abaixo para enviar o email ao destinatário.",
        "paragraph": "",
        "gamification": "checkPoint",
        "magicLabel": true,
        "screens": [{
            "nextButton" : "Enviar",
            "actions" : [
                ["Editor Markdown", () => window.open("http://dillinger.io/", '_blank').focus()]
            ],
            "fields": [{
                "name": 'subject',
                "optional": false,
                "type": "text",
                "placeholder": "Assunto da Mensagem"
            }, {
                "name": "content",
                "optional": false,
                "type": "textarea",
                "placeholder": "Conteúdo (Markdown)"
            }]
        }]
    }));

};
