/* global toastr, require, module, numeral, moment */

var async = require("async"),
        StringMask = require("string-mask"),
        _ = require("underscore"),
        squel = require("squel");
var SEARCH_REGEX = /cheq?u?e?/i, FIDC = /fid?c?/i, LIMIT = 3;
var CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

module.exports = function (controller) {

    var getPushDocument = function (item, cb) {
        var parse = function (ret) {
            if (ret)
                controller.call("icheques::parse::push", item, ret);
        };

        controller.serverCommunication.call("SELECT FROM 'PUSH'.'DOCUMENT'", controller.call("error::ajax", {
            data: {id: item.pushId},
            success: parse,
            error: parse,
            complete: function () {
                cb(null, item);
            }
        }));
    };

    controller.registerCall("icheques::sync", function (storage, callback) {
        async.mapLimit(storage, 2, function (item, cb) {
            getPushDocument(item, function (err, item) {
                controller.database.exec(squel
                        .update()
                        .table("ICHEQUES_CHECKS")
                        .where("PUSH_ID = ?", item.pushId)
                        .setFields(controller.call("icheques::databaseObject", item)).toString());
                controller.call("icheques::item::upgrade", item);
                cb(err, item);
            });
        }, callback);
    });

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
                "Cheque CMC7 " + CMC7_MASK.apply(check.cmc.replace(/[^\d]/, "")));
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
        var documentUpdate = function (item) {
            var rescan = function () {
                for (var i in nodes) {
                    nodes[i].remove();
                } /* rescan */
                nodes = [];
                separator.removeClass("loading success error warning");
            }

            if (item.exceptionMessage) {
                if (item.exceptionPushable) {
                    rescan();
                    separator.addClass("warning");
                    nodes.push(checkResult.addItem("Erro", item.exceptionMessage));
                }
                return;
            }

            if (item.queryStatus) {
                console.error(item.queryStatus);
                
                rescan();
                var elementClass = "success";
                
                if (item.queryStatus !== 1) {
                    elementClass = "error";
                }

                separator.addClass(elementClass);

                nodes.push(checkResult.addItem("Situação", item.situation));
                nodes.push(checkResult.addItem("Exibição", item.display));

                if (item.occurence) {
                    nodes.push(checkResult.addItem("Ocorrência", item.occurence));
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

    controller.registerCall("icheques::show", function (storage, callback) {
        var documents = {};
        for (var i in storage) {
            var document = storage[i].cpf || storage[i].cnpj;
            if (!documents[document]) {
                documents[document] = [];
            }
            documents[document].push(storage[i]);
        }

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
                .where("PUSH_ID = ?", data.pushObject._id));

        if (!dbResponse[0]['values'][0]) {
            controller.call("icheques::insertDatabase", data);
            return;
        }


        controller.call("icheques::parse::push", $.parseXML(data.pushMemory.document.data));

        controller.database.exec(squel
                .update()
                .table("ICHEQUES_CHECKS")
                .where("PUSH_ID = ?", data.pushId)
                .setFields(controller.call("icheques::databaseObject", data)).toString());

        controller.call("icheques::item::upgrade", data);
    });

};