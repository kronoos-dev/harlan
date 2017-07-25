import each from 'async/each';

module.exports = (controller) => {

    controller.registerCall("admin::message", (apiKeys) => {
        if (!apiKeys.length) {
            controller.alert({
                title: "A mensagem não pode ser enviada.",
                subtitle: "É necessário ao menos uma empresa para poder ser desenvolvida uma mensagem.",
                paragraph: "Experimente alterar os filtros de sua pesquisa para que você possa escrever uma mensagem.",
            });
            return;
        }
        controller.call("form", data => {
            let modal = controller.call("modal");
            modal.title("Progresso de Envio da Mensagem");
            modal.subtitle("Sua mensagem está sendo enviada, por favor aguarde.");
            modal.paragraph("Experimente tomar um café enquanto nossos servidores encaminham as mensagens.");

            let progress = modal.addProgress();

            let sended = 0;
            each(apiKeys, (apiKey, callback) => $.bipbop("INSERT INTO 'TRIGGER'.'TRIGGER'", apiKey, controller.call("error::ajax", {
                method: 'POST',
                data: JSON.stringify(['inbound', Object.assign({
                    filename: 'email-marketing.md' /* formato markdown */
                }, data), moment().unix() + 10]),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                complete: () => {
                    progress(++sended / apiKeys.length);
                    callback();
                }
            })), (err) => {
                toastr.success("A mensagem foi enviada com sucesso, dentro de instantes você estará respostas.",
                "Mensagem enviada com sucesso");
                modal.close();
            });
        }).configure({
            "title": "E-mail ao Cliente",
            "subtitle": "Preencha os campos abaixo para enviar um e-mail ao cliente.",
            "paragraph": "O formato do e-mail é markdown, certifique-se de ter preenchido corretamente o campo assunto e mensagem.",
            "gamification": "checkPoint",
            "magicLabel": true,
            "screens": [{
                "nextButton": "Enviar",
                "actions": [
                    ["Editor Markdown", () => window.open("http://dillinger.io/", '_blank').focus()]
                ],
                "observations": [
                    `${apiKeys.length} destinarários`
                ],
                "fields": [{
                    "name": 'subject',
                    "optional": false,
                    "type": "text",
                    "placeholder": "Assunto"
                }, {
                    "name": "content",
                    "optional": false,
                    "type": "textarea",
                    "placeholder": "Mensagem (Markdown)"
                }]
            }]
        });
    });

};
