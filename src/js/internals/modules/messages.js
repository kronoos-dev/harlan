/* global toastr */

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

    var checkbox = function (data, cb) {
        cb();
        controller.call("inbox::check");
    };

    controller.registerTrigger("authentication::authenticated", "inbox::authentication::authenticated", checkbox);
    controller.registerTrigger("serverCommunication::websocket::sendMessage", "inbox::serverCommunication::websocket::sendMessage", checkbox);

    controller.registerBootstrap("inbox", function (callback) {
        callback();

        controller.call("inbox::check");

        $("#action-mailbox").click(function (e) {
            e.preventDefault();
            controller.call("inbox");
        });
    });

    controller.registerCall("inbox::open", function (message, idMessage, item, skip, mainModal) {
        var modal = controller.call("modal");
        modal.title(message.find("message > subject").text());
        modal.subtitle("Enviado em " +
                new Date(parseInt(message.find("message > send").text())).toLocaleString());


        modal.element().append($("<div />")
                .html(markdown.toHTML(message.find("message > text").text())).addClass("markdown"));

        var form = modal.createForm();
        form.addSubmit("remove", "Apagar").click(function (e) {
            e.preventDefault();
            controller.serverCommunication.call("DELETE FROM 'HARLANMESSAGES'.'ID'", controller.call("error::ajax", controller.call("loader::ajax", {
                data: {id: idMessage},
                success: function (ret) {
                    modal.close();
                    controller.call("inbox", skip, mainModal);
                    toastr.success("A mensagem foi removida com sucesso.",
                            "A mensagem que você solicitou foi removida com sucesso.");
                    item.remove();
                }
            })));
        });
        form.addSubmit("cancel", "Fechar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

    });

    controller.registerCall("inbox", function (skip, modal) {
        skip = skip || 0;
        controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'SEARCH'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    data: {
                        skip: skip
                    },
                    success: function (ret) {
                        controller.call("inbox::complete", $(ret), skip, modal);
                    }
                })));
    });


    controller.registerCall("inbox::complete", function (jMessages, skip, modal) {
        if (!modal) {
            modal = controller.call("modal");
        } else {
            modal.element().empty();
        }

        modal.title("Mensagens Privadas");
        modal.subtitle("Caixa de mensagens privadas.");
        modal.addParagraph("Aqui estão as mensagens importantes que o Harlan tem para você, \n\
                é importante que você leia todas. Mantendo sua caixa sempre zerada.");
        
        var form = modal.createForm();

        var list = form.createList(),
                messages = jMessages.find("BPQL > body > messages > node");
                
        messages.each(function (idx, node) {
            var jnode = $(node);
            var item = list.item("fa-envelope", [
                new Date(parseInt(jnode.find("send").text()) * 1000).toLocaleString(),
                jnode.find("subject").text()
            ]);

            if (jnode.find("unread").text() === "true") {
                item.addClass("unread");
            }

            item.click(function () {
                if (item.hasClass("unread")) {
                    /* server-side read check */
                    controller.call("inbox::check");
                    item.removeClass("unread");
                }

                var idMessage = jnode.find("id").text();

                controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'GET'",
                        controller.call("error::ajax", controller.call("loader::ajax", {
                            data: {
                                id: idMessage
                            },
                            success: function (message) {
                                controller.call("inbox::open", $(message), idMessage, item, skip, modal);
                            }
                        })));
            });
        });

        if (messages.length) {
            form.element().submit(function (e) {
                e.preventDefault();
                controller.call("inbox", skip + 1, modal);
            });

            form.addSubmit("cancel", "Mensagens Anteriores");
        }

        form.addSubmit("cancel", "Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });
};