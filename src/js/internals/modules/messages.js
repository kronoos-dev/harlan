var markdown = require("markdown").markdown;

module.exports = function (controller) {

    var alert = null;

    controller.registerCall("inbox::check", function () {
        controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'CountUnread'", {
            success: function (ret) {
                var count = parseInt($(ret).find("BPQL > body > count").text());
                if (count > 0) {
                    if (!alert) {
                        alert = $("<span />").addClass("alert");
                        $("#action-mailbox").append(alert);
                    }
                    alert.text(count.toString());

                } else if (alert) {
                    alert.remove();
                    alert = null;
                }
            }
        });
    });

    controller.registerBootstrap("inbox", function () {

        controller.call("inbox::check");

        setInterval(function () {
            controller.call("inbox::check");
        }, controller.confs.inboxTime);

        $("#action-mailbox").click(function (e) {
            e.preventDefault();
            controller.call("inbox");
        });
    });

    controller.registerCall("inbox::open", function (message) {
        var modal = controller.call("modal");
        modal.title(message.find("message > subject").text());
        modal.subtitle("Enviado em " +
                new Date(parseInt(message.find("message > send").text())).toLocaleString());


        modal.element().append($("<div />")
                .html(markdown.toHTML(message.find("message > text").text())).addClass("markdown"));

        var form = modal.createForm();
        form.addSubmit("cancel", "Fechar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

    });

    controller.registerCall("inbox", function (args) {
        var skip = (args ? args[0] : 0),
                modal = (args ? args[1] : null);
        controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'SEARCH'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    success: function (ret) {
                        controller.call("inbox::complete", [$(ret), skip + 3, modal]);
                    }
                })));
    });


    controller.registerCall("inbox::complete", function (args) {

        /**
         * @TODO reescrever para não regerar o BOX a cada NEXT
         */

        var jMessages = args[0],
                skip = args[1],
                modal = args[2];

        if (!modal) {
            modal = controller.call("modal");
        } else {
            modal.element().empty();
        }

        modal.title("Mensagens Privadas");
        modal.subtitle("Caixa de mensagens privadas.");
        modal.addParagraph("É fácil verificar suas mensagens e acessar o histórico.");
        var form = modal.createForm();
        var autocomplete = controller.call("autocomplete", form.addInput("filter", "text", "Pesquisar uma mensagem"));
        autocomplete.setIcon("fa-search");

        var list = form.createList();
        jMessages.find("BPQL > body > messages > node").each(function (idx, node) {
            var jnode = $(node);
            var item = list.item("fa-envelope", [
                new Date(parseInt(jnode.find("send").text()) * 1000).toLocaleString(),
                jnode.find("subject").text()
            ]);

            if (jnode.find("unread").text() === "true") {
                item.addClass("unread");
            }

            item.click(function () {
                item.removeClass("unread");
                controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'GET'",
                        controller.call("error::ajax", controller.call("loader::ajax", {
                            data: {
                                id: jnode.find("id").text()
                            },
                            success: function (message) {
                                controller.call("inbox::open", $(message));
                            }
                        })));
            });
        });
        
        form.element().submit(function (e) {
            e.preventDefault();
            controller.call("inbox", [skip, modal]);
        });

        form.addSubmit("cancel", "Mensagens Anteriores");
        form.addSubmit("cancel", "Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });
};