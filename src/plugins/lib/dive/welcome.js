import _ from 'underscore';
import { CPF, CNPJ } from 'cpf_cnpj';
import sprintf from 'sprintf';

module.exports = (controller) => {

    controller.registerTrigger("findDatabase::instantSearch", "icheques::search::document", function(args, callback) {
        controller.server.call("SELECT FROM 'DIVE'.'ENTITYS'", {
            dataType: "json",
            data: {text: args[0], limit: 3},
            success: (data) => {
                let document;
                if (!data.count) return;
                for (let row of _.values(data.items)) {
                    document = CPF.isValid(row.label) ? CPF.format(row.label) : CNPJ.format(row.label);
                    args[1].item("Dive", "Abertura de Registro", sprintf("Nome: %s, Documento: %s", row.reduce.name, document))
                        .addClass("dive")
                        .click((e) => {
                            e.preventDefault();
                            controller.call("dive::open", row);
                        });
                }
            },
            complete: () => callback()
        });
    });

    controller.registerCall("dive::open", (entity) => {
        var sectionDocumentGroup = controller.call("section", "Informações Cadastrais",
            `Informações cadastrais para o documento ${entity.label}`,
            "Dívida, telefone, endereço, e-mails e outras informações.");
        var [section, results, actions] = sectionDocumentGroup;
        $("html, body").scrollTop(section.offset().top);

        $(".app-content").prepend(section);

        controller.call("tooltip", actions, "Pesquisar").append($("<i />").addClass("fa fa-search"))
            .click((e) => controller.click(e, "socialprofile", entity.label, undefined, undefined, (report) => {
            report.element().append(section);
        }));


        for (let hyperlink of _.values(entity.hyperlink)) {
            controller.call("dive::plugin", hyperlink, {
                data: entity,
                section : sectionDocumentGroup
            });
        }

        controller.call("tooltip", actions, "Apagar").append($("<i />").addClass("fa fa-trash"))
            .click((e) => {
            controller.call("dive::delete", entity, () => {
                section.remove();
            });
        });

        controller.call("tooltip", actions, "Histórico").append($("<i />").addClass("fa fa-archive"))
            .click((e) => {
            controller.call("dive::history", entity);
        });

        controller.call("tooltip", actions, "Informações Globais").append($("<i />").addClass("fa fa-database"))
            .click((e) => {
            e.preventDefault();
            for (let push of entity.push) {
                controller.server.call("SELECT FROM 'PUSHDIVE'.'DOCUMENT'",
                    controller.call("loader::ajax", {
                        data: {
                            id: push.id
                        },
                        success: (ret) => {
                            results.prepend(controller.call("xmlDocument", ret));
                        }
                    }, true));
            }
        });


    });

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
                        contentType: "application/json",
                        type: "POST",
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
                ["fa-search", "Pesquisar", () => controller.call("socialprofile", data.entity.label)],
                ["fa-archive", "Histórico", () => controller.call("dive::history", data.entity)],
                ["fa-folder-open", "Abrir", () => controller.call("dive::open", data.entity)],
                ["fa-check", "Relevante", update(true)],
                ["fa-times", "Irrelevante", update(false)],
            ];
        };

        var getActions = (data) => {
            controller.server.call("SELECT FROM 'DIVE'.'EVENTS'", {
                dataType: "json",
                data: data || {},
                success: function(ret) {
                    for (let data of ret.events) {
                        timeline.add(data.created, data.title, data.description, generateActions(data)).attr("data-entity", data.entity._id);
                    }
                }
            });
        };

        getActions();

        controller.registerTrigger("serverCommunication::websocket::diveEvent", "diveEvent", (data, cb) => {
            cb();
            timeline.add(data.created, data.title, data.description, generateActions(data)).attr("data-entity", data.entity._id);
        });

        report.button("Adicionar Documentos", function() {
            controller.call("dive::new");
        });

        report.gamification("dive");
        $(".app-content").append(report.element());
    });

};
