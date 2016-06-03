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
                "Como você encontrou a iCheques?",
                "Conte como ouviu falar de nós, ou digite a referência que você recebeu por e-mail de sua Parceira Financeira.",
                "Caso sua referência comercial seja de uma antecipadora, você recebe R$ 150,00 em créditos iniciais para poder começar a antecipar de imediato. Aproveite para procurar uma!",
                true);

        var form = report.form(controller),
                samaritano = form.addInput("samaritano", "text", "Referência");

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
                    $("BPQL body references node", doc).each(function (idx, vl) {
                        ac.item("Antecipadora de Cheques", $("nome", vl).text(), "A antecipadora me apresentou o iCheques para operarmos on-line.").click(fill($("username", vl).text(), true));
                    });
                },
                complete: function () {
                    cb();
                }
            });
        }, autocomplete);

        form.addSubmit("send", "Enviar");

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
