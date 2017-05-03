/* global toastr */

var MarkdownIt = require('markdown-it')({
    break: true,
    xhtmlOut: true,
});

module.exports = function(controller) {

    var alert = null;

    controller.registerCall("inbox::check", function() {
        controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'CountUnread'", {
            success: function(ret) {
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

    var checkbox = function(data, cb) {
        cb();
        controller.call("inbox::check");
    };

    controller.registerTrigger("authentication::authenticated", "inbox", checkbox);
    controller.registerTrigger("serverCommunication::websocket::sendMessage", "inbox", checkbox);

    controller.registerBootstrap("inbox", function(callback) {
        callback();

        controller.call("inbox::check");

        $("#action-mailbox").click((e) => {
            e.preventDefault();
            controller.call("inbox");
        });
    });

    controller.registerTrigger("bootstrap::end", "message", (opts, cb) => {
        cb();
        if (!controller.query.message) return;

        controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'GET'",
        controller.call("error::ajax", controller.call("loader::ajax", {
            data: {
                id: controller.query.message
            },
            success: function(message) {
                controller.call("inbox::open", message, controller.query.message);
            }
        })));
    });

    controller.registerCall("inbox::open", function(message, idMessage) {
        let modal = controller.call("modal");
        modal.title($("message > subject", message).text());
        let when = moment.unix(parseInt($("message > send", message).text()));
        modal.subtitle(`Enviado às ${when.format("h:mm:ss a DD/MM/YYYY")}, ${when.fromNow()}.`);
        let markdownData = MarkdownIt.render($("message > text", message).text());
        let el = $("<div />").html(markdownData).addClass("markdown");
        modal.element().append(el);
        el.find("a").click(function (e) => {
            controller.call("link", $(this).attr("href"), e);
            modal.close();
        });
        modal.createActions().cancel(null, "Fechar");
    });

    var parseMessage = (list, message) => {
        var item = list.item("fa-envelope", [
            moment.unix(parseInt($("send", message).text())).format("DD/MM/YYYY, HH:mm:ss"),
            $("subject", message).text()
        ]);

        if ($("unread", message).text() === "true") {
            item.addClass("unread");
        }

        item.click(function() {
            if (item.hasClass("unread")) {
                /* server-side read check */
                controller.call("inbox::check");
                item.removeClass("unread");
            }

            var idMessage = $("id", message).text();

            controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'GET'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                data: {
                    id: idMessage
                },
                success: function(message) {
                    controller.call("inbox::open", message, idMessage);
                }
            })));
        });
    };

    var parseMessages = (list, messages) => {
        list.empty();
        messages.each(function(idx, node) {
            parseMessage(list, node);
        });
    };

    var updateList = (modal, pageActions, results, pagination, list, limit = 5, skip = 0, text = null, callback = null, bipbopLoader = true) => {
        if (!text || /^\s*$/.test(text)) {
            text = undefined;
        }

        controller.serverCommunication.call("SELECT FROM 'HARLANMESSAGES'.'SEARCH'",
        controller.call("loader::ajax", {
            data: {
                text: text,
                skip: skip,
                limit: limit
            },
            success: (data) => {
                var queryResults = parseInt($("BPQL > body count", data).text()),
                currentPage = Math.floor(skip / limit) + 1,
                pages = Math.ceil(queryResults / limit);

                if (!queryResults) {
                    controller.call("alert", {
                        title: "Não foram encontradas mensagens.",
                        subtitle: "Aguarde até que mensagens sejam enviadas para poder usar esta funcionalidade."
                    });
                    modal.close();
                    return;
                }

                pageActions.next[currentPage >= pages ? "hide" : "show"]();
                pageActions.back[currentPage <= 1 ? "hide" : "show"]();

                results.text(`Página ${currentPage} de ${pages}`);
                pagination.text(`Resultados ${queryResults}`);

                parseMessages(list, $("BPQL > body > messages > node", data));
                if (callback) {
                    callback();
                }
            }
        }, bipbopLoader));
    };

    controller.registerCall("inbox", function() {
        var skip = 0, text = null;

        var modal = controller.call("modal");

        modal.title("Mensagens Privadas");
        modal.subtitle("Caixa de mensagens privadas.");
        modal.addParagraph("Aqui estão as mensagens importantes que o sistema tem para você, é importante que você leia todas. Mantendo sua caixa sempre zerada.");

        var form = modal.createForm(),
        search = form.addInput("text", "text", "Mensagem que procura"),
        list = form.createList(),
        actions = modal.createActions();

        actions.add("Sair").click(function(e) {
            e.preventDefault();
            modal.close();
        });

        var results = actions.observation(),
        pagination = actions.observation();

        var pageActions = {
            next: actions.add("Próxima Página").click(() => {
                skip += 5;
                updateList(modal, pageActions, results, pagination, list, 5, skip, text);
            }).hide(),

            back: actions.add("Página Anterior").click(() => {
                skip -= 5;
                updateList(modal, pageActions, results, pagination, list, 5, skip, text);
            }).hide()
        };

        updateList(modal, pageActions, results, pagination, list, 5, skip, text);
        controller.call("instantSearch", search, (query, autocomplete, callback) => {
            text = query;
            skip = 0;
            updateList(modal, pageActions, results, pagination, list, 5, skip, text, callback, false);
        });
    });
};
