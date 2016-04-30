/* global toastr, require, module, numeral, moment */

var async = require("async"),
    StringMask = require("string-mask"),
    _ = require("underscore"),
    squel = require("squel"),
    changeCase = require('change-case');

var SEARCH_REGEX = /cheq?u?e?/i,
    FIDC = /fid?c?/i,
    LIMIT = 3;
var CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

module.exports = function(controller) {

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
            error: function() {
                callback(Array.from(arguments));
            },
            success: function(ret) {
                var storage = [];
                $(ret).find("check").each(function() {
                    storage.push(controller.call("icheques::parse::element", this));
                });

                controller.call("icheques::insertDatabase", storage);
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

        var expiration;
        if (check.expire) {
            expiration = checkResult.addItem("Expiração", moment(check.expire, "YYYYMMDD").format("DD/MM/YYYY"));
        }

        if (check.observation) {
            checkResult.addItem("Observação", check.observation);
        }

        var nodes = [];
        var documentDelete = function () {
            separator.remove();
            checkResult.element().remove();
        }, documentUpdate = function(check) {
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

                var elementClass = "success",
                    situation = check.situation,
                    display = check.display,
                    ocurrence = check.ocurrence;

                if (check.queryStatus === 2) {
                    situation = "Uh-oh! Esse talão parece estar bloqueado.";
                    display = "Uh-oh! Esse talão parece estar bloqueado.  Recomendamos entrar em contato com o emissor (através de nossas informações ou do seu cadastro) e pedir o desbloqueio ou troca dos cheques.";
                    ocurrence = "Talão bloqueado (" + check.ocurrence + ")";
                }

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
            }
        };

        documentUpdate(check);
        separator.attr("id", "pushid-" + check.pushId);
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

    var showDocument = function(task, callback) {
        var section = controller.call("section",
                "iCheque",
                "Prevenção a fraudes na sua carteira de cheques.",
                "Documento " + task[0], false, true),
            result = controller.call("result");
        section[1].append(result.element());
        section[0].addClass("icheque loading");
        showChecks(task[1], result, section);
        callback(null, section);
        controller.serverCommunication.call("SELECT FROM 'CBUSCA'.'CONSULTA'", {
            cache: true,
            data: {
                documento: task[0]
            },
            success: function(ret) {
                result.element().prepend(controller.call("xmlDocument", ret));
            },
            error: function() {
                result.content().prepend(result.addItem("Documento", task[0]));
            },
            complete: function() {
                section[0].removeClass("loading");
            }
        });

        if (!$(".ichequesAccountOverview").length) {
            controller.call("icheques::report::overview", false, false);
        }

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


    controller.registerCall("icheques::show::document", showDocument);

    controller.registerCall("icheques::show::query", function(query, callback) {
        if (!query) {
            return;
        }
        controller.call("icheques::resultDatabase", query);
        controller.call("icheques::show", query.values, callback);
    });

    controller.registerCall("icheques::show", function(storage, callback, element) {
        var documents = _.groupBy(storage, function(a) {
            return a.cpf || a.cnpj;
        });

        async.map(_.pairs(documents), showDocument, function(err, results) {

            var moreResults = controller.call("moreResults", 5);
            /** @TODO Trocar para novo modelo */
            for (var i in results) {
                moreResults.append(results[i][0]);
            }


            $(element || ".app-content").append(moreResults.element());
            moreResults.show();

            if (callback) {
                callback();
            }
        });
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
        var node = $("#pushid-" + item.pushId);
        if (!node.length) {
            return;
        }

        var upgrade = node.data("upgrade");
        if (typeof upgrade !== "function") {
            return;
        }

        upgrade(item);
    });

    controller.registerTrigger("serverCommunication::websocket::ichequeUnset", "icheques::pushDelete", function (data, callback) {
        callback();

        controller.database.exec(squel
            .delete()
            .from("ICHEQUES_CHECKS")
            .where("CMC = ?", data));

        controller.call("icheques::item::delete", data);
    });

    controller.registerTrigger("serverCommunication::websocket::ichequeUpdate", "icheques::pushUpdate", function(data, callback) {
        callback();

        var dbResponse = controller.database.exec(squel
            .select()
            .from("ICHEQUES_CHECKS")
            .where("PUSH_ID = ?", data.pushId).toString());

        if (!dbResponse[0].values[0]) {
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
