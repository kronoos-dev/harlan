module.exports = (controller) => {

    controller.registerTrigger("authentication::authenticated", "dive::authenticated", function(arg, cb) {
        cb();
        var report = controller.call("report",
                "Recuperação de Ativos Dive",
                "Mergulhe sua cobrança em dados no streaming.",
                "Através deste módulo fique sabendo em tempo real o que acontece na sua carteira de devedores, são informações que te ajudarão a descobrir quem e quando cobrar alguém.",
                false),
            timeline = report.timeline(controller);

        var generateActions = (data) => {
            var update = (useful) => {
                return (obj) => {
                    obj.item.remove();
                    controller.server.call("UPDATE 'DIVE'.'EVENT'", {
                        data: {
                            useful: useful,
                            id: data._id
                        },
                        complete: () => {
                            getActions({
                                limit: 1,
                                skip: timeline.length()
                            });
                        }
                    });
                };
            };

            return [
                ["fa-folder-open", "Abrir", (obj) => {
                    var sectionDocumentGroup = controller.call("section", "Informações Cadastrais",
                        `Informações cadastrais para o documento ${data.entity.label}`,
                        "Telefone, endereço e e-mails.");

                    $(".app-content").prepend(sectionDocumentGroup[0]);

                    for (let push of data.entity.push) {
                        controller.server.call("SELECT FROM 'PUSH'.'DOCUMENT'",
                            controller.call("loader::ajax", {
                                data: {
                                    id: push.id
                                },
                                success: (ret) => {
                                    sectionDocumentGroup[1].append(controller.call("xmlDocument", ret));
                                }
                            }, true));
                    }
                }],
                ["fa-check", "Relevante", update("true")],
                ["fa-times", "Irrelevante", update("false")],
            ];
        };

        var getActions = (data) => {
            controller.server.call("SELECT FROM 'DIVE'.'EVENTS'", {
                dataType: "json",
                data: data || {},
                success: function(ret) {
                    for (let data of ret.events) {
                        timeline.add(data.created, data.title, data.description, generateActions(data));
                    }
                }
            });
        };

        getActions();

        controller.registerTrigger("serverCommunication::websocket::diveEvent", "diveEvent", (data, cb) => {
            cb();
            timeline.add(data.created, data.title, data.description, generateActions(data));
        });

        report.button("Adicionar Documentos", function() {
            controller.call("dive::new");
        });

        report.gamification("dive");

        $(".app-content").append(report.element());
    });

};
