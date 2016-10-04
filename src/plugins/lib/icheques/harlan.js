/* global toastr, require, module, numeral, moment */

var async = require("async"),
    StringMask = require("string-mask"),
    _ = require("underscore"),
    squel = require("squel"),
    changeCase = require('change-case'),
    CNPJ = require("cpf_cnpj").CNPJ;

import {
    CMC7Parser
} from "./cmc7-parser.js";

var SEARCH_REGEX = /cheq?u?e?/i,
    FIDC = /fid?c?/i,
    LIMIT = 3;
var CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

module.exports = function(controller) {

    var registerSocket = () => {
        controller.registerTrigger("serverCommunication::websocket::ichequeUpdate", "icheques::pushUpdate", function(data, callback) {
            callback();

            var dbResponse = controller.database.exec(squel
                .select()
                .from("ICHEQUES_CHECKS")
                .where("PUSH_ID = ?", data.pushId).toString());

            if (!dbResponse.length) {
                controller.call("icheques::insertDatabase", data);
                return;
            }

            controller.database.exec(squel
                .update()
                .table("ICHEQUES_CHECKS")
                .where("PUSH_ID = ?", data.pushId)
                .setFields(controller.call("icheques::databaseObject", data)).toString());

            controller.call("icheques::item::upgrade", data);
        });
    };

    controller.registerTrigger("authentication::authenticated", "icheques::sync::authentication::authenticated", function(data, callback) {
        if (controller.serverCommunication.freeKey()) {
            callback();
            return;
        }

        var unregister = null,
            loaderTimeout = setTimeout(function() {
                unregister = $.bipbopLoader.register();
            }, 1000);

        controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CHECKS'", controller.call("error::ajax", {
            data: {
                'q[0]': "SELECT FROM 'ICHEQUES'.'CHECKS'",
                'q[1]': "SELECT FROM 'ICHEQUESFIDC'.'OPERATION'",
                'approved': 'true'
            },
            error: function() {
                callback(Array.from(arguments));
            },
            success: function(ret) {
                var storage = [];
                $(ret).find("check").each(function() {
                    storage.push(controller.call("icheques::parse::element", this));
                });

                controller.call("icheques::insertDatabase", storage);
                registerSocket();
                callback();
            },
            complete: function() {
                callback();
                clearTimeout(loaderTimeout);
                if (unregister)
                    unregister();
            }
        }));
    });

    var showCheck = function(check, result, section) {
        var separatorData = {},
            separator = result.addSeparator("Verificação de Cheque",
                "Verificação de Dados do Cheque",
                "Cheque CMC7 " + CMC7_MASK.apply(check.cmc.replace(/[^\d]/g, "")),
                separatorData);

        controller.call("tooltip", separatorData.menu, "Editar Cheque").append($("<i />").addClass("fa fa-edit")).click((e) => {
            e.preventDefault();
            controller.call("icheques::item::edit", check);
        });

        if (check.operation) {
            controller.call("tooltip", separatorData.menu, "Devolver").append($("<i />").addClass("fa fa-reply")).click((e) => {
                e.preventDefault();
                controller.confirm({
                    title: "Você deseja realmente devolver o cheque?",
                    subtitle: "Esta operação não pode ser desfeita.",
                    paragraph: "Atenção! Caso devolver o cheque, ele sumirá de sua carteira, e esta operação não poderá ser desfeita!"
                }, () => {
                    controller.server.call("DELETE FROM 'ICHEQUESFIDC'.'OPERATION'",
                        controller.call("error::ajax", controller.call("loader::ajax", {
                            data: {
                                cmc: check.cmc
                            }
                        })));
                });
            });
        } else {
            controller.call("tooltip", separatorData.menu, "Remover Cheque").append($("<i />").addClass("fa fa-trash")).click((e) => {
                e.preventDefault();
                controller.confirm({
                    title: "Remover Cheque da Carteira"
                }, () => {
                    controller.server.call("DELETE FROM 'ICHEQUES'.'CHECK'", {
                        data: {
                            cmc: check.cmc
                        },
                        success: () => {
                            toastr.warning("O cheque foi removido com sucesso.", "Esse cheque não existe mais em nossa base de dados.");
                        }
                    });
                });
            });
        }

        controller.call("tooltip", separatorData.menu, "+30 dias").append($("<i />").addClass("fa fa-hourglass-half")).click((e) => {
            e.preventDefault();
            controller.call("icheques::item::add::time", check);
        });

        separator.addClass("external-source loading");
        var checkResult = controller.call("result");
        checkResult.element().insertAfter(separator);
        if (check.ammount) {
            checkResult.addItem("Valor", numeral(check.ammount / 100).format("$0,0.00"));
        }

        checkResult.addItem("Número do Cheque", new CMC7Parser(check.cmc).number);

        var expiration;
        if (check.expire) {
            expiration = checkResult.addItem("Expiração", moment(check.expire, "YYYYMMDD").format("DD/MM/YYYY"));
        }

        if (check.observation) {
            checkResult.addItem("Observação", check.observation);
        }

        var nodes = [];
        var documentDelete = function() {
                separator.remove();
                checkResult.element().remove();
            },
            documentUpdate = function(check) {
                section[0].removeClass("loadingCheck");
                separator.data("item", check);

                var rescan = function() {
                    for (var i in nodes) {
                        nodes[i].remove();
                    } /* rescan */
                    nodes = [];
                    separator.removeClass("loading success error warning");
                };

                if (check.exceptionMessage) {
                    if (check.exceptionPushable) {
                        rescan();
                        separator.addClass("warning");
                        nodes.push(checkResult.addItem("Erro", check.exceptionMessage));
                    }
                    return;
                }

                if (check.expire && expiration) {
                    expiration.find(".value").text(moment(check.expire, "YYYYMMDD").format("DD/MM/YYYY"));
                }

                if (check.queryStatus && check.queryStatus !== 10) {
                    rescan();
                    section[0].removeClass("loading");

                    var elementClass = "success",
                        situation = check.situation,
                        display = check.display,
                        ocurrence = check.ocurrence;

                    if (check.queryStatus !== 1) {
                        elementClass = "error";
                        section[0].addClass("warning");
                        separator.find("h4").text(check.situation);
                    }

                    separator.addClass(elementClass);

                    nodes.push(checkResult.addItem("Situação (" + check.queryStatus + ")", situation));
                    nodes.push(checkResult.addItem("Exibição", display));

                    if (check.ocurrenceCode) {
                        nodes.push(checkResult.addItem("Ocorrência (" + check.ocurrenceCode + ")", ocurrence));
                    }

                    separator.addClass(elementClass);
                } else {
                    section[0].addClass("loadingCheck");
                }
            };

        documentUpdate(check);
        separator.addClass("pushid-" + check.pushId);
        separator.addClass("cmc-" + check.cmc);
        separator.data("upgrade", documentUpdate);
        separator.data("delete", documentDelete);
        return documentUpdate;
    };

    var showChecks = function(checks, result, section) {
        for (var i in checks) {
            showCheck(checks[i], result, section);
        }
    };

    var showDocument = function(task) {
        var section = controller.call("section",
                "iCheques",
                "Monitoramento de cheques.",
                "CPF/CNPJ " + task[0], false, true),
            result = controller.call("result");
        section[1].append(result.element());
        section[0].addClass("icheque loading");

        if (!$(".ichequesAccountOverview").length) {
            controller.call("icheques::report::overview", false, false);
        }

        showChecks(task[1], result, section);
        if (controller.confs.ccf) {
            controller.serverCommunication.call("SELECT FROM 'SEEKLOC'.'ConsultaAssertiva'", {
                data: {
                    documento: task[0]
                },
                success: (ret) => {
                    let totalRegistro = $(ret).find("BPQL > body > data > resposta > totalRegistro").text();
                    let currentMessage = section[0].find("h3").text();

                    let qteOcorrencias = $(ret).find("BPQL > body > data > resposta > list > item0 > qteOcorrencias").text();
                    let dataUltOcorrencia = $(ret).find("BPQL > body > data > resposta > list > item0 > dataUltOcorrencia").text();

                    totalRegistro = parseInt(totalRegistro);
                    if (totalRegistro > 0) {
                        section[0].find("h3").text(`${currentMessage} Total de registros CCF: ${qteOcorrencias} com total de ocorrências de ${dataUltOcorrencia}`);
                        section[0].addClass("warning");
                    }
                }
            });
        }


        let ccbuscaQuery = {
            documento: task[0]
        };

        if (CNPJ.isValid(task[0])) {
            ccbuscaQuery['q[0]'] = "SELECT FROM 'CCBUSCA'.'CONSULTA'";
            ccbuscaQuery['q[1]'] = "SELECT FROM 'RFBCNPJANDROID'.'CERTIDAO'";
        }

        controller.serverCommunication.call("SELECT FROM 'CCBUSCA'.'CONSULTA'", {
            cache: true,
            data: ccbuscaQuery,
            success: function(ret) {
                let xmlDocument = null,
                    icon  = $("<i />").addClass("fa fa-user-plus"),
                    showing = false;

                section[2].prepend($("<li />").append(icon)
                    .attr("title", "Informações do Sacado"));

                section[2].find(".action-resize i").click(function () {
                    if (!$(this).hasClass("fa-plus-square-o")) {
                        icon.removeClass("fa-user-times");
                        icon.addClass("fa-user-plus");
                        xmlDocument.remove();
                        showing = false;
                    }
                });

                icon.click((e) => {
                    e.preventDefault();
                    if (!showing) {
                        xmlDocument = controller.call("xmlDocument", ret);
                        section[2].find(".fa-plus-square-o").click();
                        icon.addClass("fa-user-times");
                        icon.removeClass("fa-user-plus");
                        result.element().prepend(xmlDocument);
                    } else {
                        icon.removeClass("fa-user-times");
                        icon.addClass("fa-user-plus");
                        xmlDocument.remove();
                    }
                    showing = !showing;
                });
            },
            error: function() {
                result.content().prepend(result.addItem("Documento", task[0]));
            },
            complete: function() {
                section[0].removeClass("loading");
            }
        });

        return section[0];
    };

    controller.registerCall("icheques::resultDatabase", function(databaseResult) {
        if (!databaseResult) {
            return [{
                columns: [],
                values: []
            }];
        }

        _.each(databaseResult.columns, function(item, i, list) {
            list[i] = changeCase.camelCase(item);
        });

        _.each(databaseResult.values, function(item, i, list) {
            list[i] = _.object(databaseResult.columns, item);
        });

        return databaseResult;
    });

    controller.registerCall("icheques::show::query", function(query, callback, element) {
        if (!query) {
            return;
        }
        controller.call("icheques::resultDatabase", query);
        controller.call("icheques::show", query.values, callback, element);
    });

    controller.registerCall("icheques::show", function(storage, callback, element) {
        var documents = _.pairs(_.groupBy(storage, function(a) {
            return a.cpf || a.cnpj;
        }));

        var moreResults = controller.call("moreResults", 5);
        moreResults.callback((cb) => {
            cb(_.map(documents.splice(0, documents.length > 5 ? 5 : documents.length), showDocument));
        });

        $(element || ".app-content").append(moreResults.element());
        moreResults.show();

        if (callback) {
            callback();
        }
    });

    controller.registerCall("icheques::item::delete", function(cmc) {
        var node = $(".cmc-" + cmc);
        if (!node.length) {
            return;
        }

        var removeItem = node.data("delete");
        if (typeof removeItem !== "function") {
            return;
        }

        removeItem();
    });

    controller.registerCall("icheques::item::upgrade", function(item) {
        var node = $(".pushid-" + item.pushId);
        if (!node.length) {
            return;
        }

        var upgrade = node.data("upgrade");
        if (typeof upgrade !== "function") {
            return;
        }

        upgrade(item);
    });

    controller.registerTrigger("serverCommunication::websocket::ichequeUnset", "icheques::pushDelete", function(data, callback) {
        callback();

        controller.database.exec(squel
            .delete()
            .from("ICHEQUES_CHECKS")
            .where("CMC = ?", data).toString());

        controller.call("icheques::item::delete", data);
        controller.trigger("icheques::deleted", data);
    });
};
