/* global toastr, require, module, numeral, moment */

var async = require("async"),
        StringMask = require("string-mask"),
        _ = require("underscore"),
        squel = require("squel");
var SEARCH_REGEX = /cheq?u?e?/i, FIDC = /fid?c?/i, LIMIT = 3;
var CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

module.exports = function (controller) {

    controller.registerTrigger("authentication::authenticated", "icheques::sync::authentication::authenticated", function (data, callback) {
        if (controller.serverCommunication.freeKey()) {
            callback();
            return;
        }

        controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CHECKS'", controller.call("error::ajax", {
            success: function (ret) {
                var storage = [];
                $(ret).find("check").each(function () {
                    storage.push(controller.call("icheques::parse::element", this));
                });

                controller.call("icheques::insertDatabase", storage);
                callback();
            },
            complete: function () {
                callback();
            }
        }));
    });

    var showCheck = function (check, result) {
        var separator = result.addSeparator("Verificação de Cheque",
                "Verificação de Dados do Cheque",
                "Cheque CMC7 " + CMC7_MASK.apply(check.cmc.replace(/[^\d]/g, "")));
        separator.addClass("external-source loading");
        var checkResult = controller.call("result");
        checkResult.element().insertAfter(separator);
        if (check.ammount) {
            checkResult.addItem("Valor", numeral(check.ammount / 100).format("$0,0.00"));
        }

        if (check.expire) {
            checkResult.addItem("Expiração", moment(check.expire, "YYYYMMDD").format("DD/MM/YYYY"));
        }

        if (check.observation) {
            checkResult.addItem("Observação", check.observation);
        }

        var nodes = [];
        var documentUpdate = function (check) {
            separator.data("item", check);

            var rescan = function () {
                for (var i in nodes) {
                    nodes[i].remove();
                } /* rescan */
                nodes = [];
                separator.removeClass("loading success error warning");
            }

            if (check.exceptionMessage) {
                if (check.exceptionPushable) {
                    rescan();
                    separator.addClass("warning");
                    nodes.push(checkResult.addItem("Erro", check.exceptionMessage));
                }
                return;
            }

            if (check.queryStatus) {
                rescan();
                var elementClass = "success";

                if (check.queryStatus !== 1) {
                    elementClass = "error";
                }

                separator.addClass(elementClass);

                nodes.push(checkResult.addItem("Situação (" + check.queryStatus + ")", check.situation));
                nodes.push(checkResult.addItem("Exibição", check.display));

                if (check.ocurrenceCode) {
                    nodes.push(checkResult.addItem("Ocorrência (" + check.ocurrenceCode + ")", check.ocurrence));
                }

                separator.addClass(elementClass);
            }
        };

        documentUpdate(check);
        separator.attr("id", "pushid-" + check.pushId);
        separator.data("upgrade", documentUpdate);
        return documentUpdate;
    };

    var showChecks = function (checks, result) {
        for (var i in checks) {
            showCheck(checks[i], result);
        }
    };

    var showDocument = function (task, callback) {
        var section = controller.call("section",
                "iCheque",
                "Prevenção a fraudes na sua carteira de cheques.",
                "Documento " + task[0]),
                result = controller.call("result");
        section[1].append(result.element());
        section[0].addClass("icheque loading");
        showChecks(task[1], result);
        callback(null, section);
        controller.serverCommunication.call("SELECT FROM 'CBUSCA'.'CONSULTA'", {
            cache: true,
            data: {
                documento: task[0]
            },
            success: function (ret) {
                result.element().prepend(controller.call("xmlDocument", ret));
            },
            error: function () {
                result.element().prepend(result.addItem("Documento", task[0]));
            },
            complete: function () {
                section[0].removeClass("loading");
            }
        });
    };

    controller.registerCall("icheques::show::document", showDocument);

    controller.registerCall("icheques::show::query", function (query) {
        _.each(query.columns, function (item, i, list) {
            list[i] = changeCase.camelCase(item);
        });

        _.each(query.values, function (item, i, list) {
            list[i] = _.object(query.columns, item);
        });

        controller.call("icheques::show", query.values);
    });

    controller.registerCall("icheques::show", function (storage, callback) {
        var documents = _.groupBy(storage, function (a) {
            return a.cpf || a.cnpj;
        });

        async.map(_.pairs(documents), showDocument, function (err, results) {
            
            /** @TODO Trocar para novo modelo */
            for (var i in results) {
                $(".app-content").append(results[i][0]);
            }
            
            if (callback) {
                callback();
            }
        });
    });

    controller.registerCall("icheques::item::upgrade", function (item) {
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

    controller.registerTrigger("serverCommunication::websocket::ichequeUpdate", "icheques::pushUpdate", function (data, callback) {
        callback();

        var dbResponse = controller.database.exec(squel
                .select()
                .from("ICHEQUES_CHECKS")
                .where("PUSH_ID = ?", data.pushId).toString());

        if (!dbResponse[0]['values'][0]) {
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