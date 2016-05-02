/* global module */

module.exports = function (controller) {

    var report = null;

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::reference::websocket::authentication", function (data, callback) {
        callback();

        if (report) {
            report.close();
        }

        if (data.commercialReference) {
            return;
        }


        report = controller.call("report",
                "Quem indicou a você o iCheques?",
                "Nos diga quem foi bom samaritano que indicou a você o iCheques.",
                "Nossa pergunta é porque nós pretendemos dar um saco cheio de moedas de ouro para quem te apresentou nossa maravilhosa ferramenta.",
                true);

        var form = report.form(controller),
                samaritano = form.addInput("samaritano", "text", "Nome do bom samaritano");

        var autocomplete = controller.call("autocomplete", samaritano);
        var fill = function (val, submit) {
            return function (e) {
                e.preventDefault();
                samaritano.val(val);
                if (submit)
                    form.element().submit();

            };
        };

        autocomplete.item("Sites de Busca (aka. Google)", null, "Eu encontrei o iCheques através de um site de buscas.").click(fill("Buscador do Google"));
        autocomplete.item("E-mail Marketing (não SPAM)", null, "Eu recebi um e-mail marketing muito banaca de vocês.").click(fill("E-mail Marketing"));
        autocomplete.item("Um Amigo Apresentou", null, "Um camarada meu apresentou o iCheques e agora virei fã.").click(fill("Referência de um Amigo"));

        controller.call("instantSearch", samaritano, function (search, ac, cb) {
            controller.serverCommunication.call("SELECT FROM 'ICHEQUESAUTHENTICATION'.'ReferenceAutocomplete'", {
                data: {input: search},
                success: function (doc) {
                    $("username", doc).each(function (idx, vl) {
                        ac.item("Representante Comercial", $(vl).text().replace(/@icheques$/, ''), "Recebi uma maravilhosa visita do representante para fechar com vocês.").click(fill($(vl).text(), true));
                    });
                },
                complete: function () {
                    cb();
                }
            });
        }, autocomplete);

        form.addSubmit("send", "Boa Ação");

        form.element().submit(function (e) {
            e.preventDefault();
            if (!samaritano.val()) {
                samaritano.addClass("error");
                return;
            }
            controller.call("alert", {
                icon: "badges",
                title: "Muito obrigado! Nós agradecemos a informação.",
                subtitle: "Além do saco de moedas vamos entregar esta medalha para quem te protegeu dos cheques ruins."
            });
            controller.serverCommunication.call("UPDATE 'ICHEQUES'.'COMMERCIALREFERENCE'", {
                data: {input: samaritano.val()}
            });
            localStorage.hasCommercialReference = true;
            report.close();
        });

        report.gamification("crown");

        $(".app-content").prepend(report.element());
    });

};
