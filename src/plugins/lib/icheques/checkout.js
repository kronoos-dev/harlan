/* global moment, module, toastr */

const DATABASE_KEYS = [
    'id',
    'creation',
    'cmc',
    'cpf',
    'cnpj',
    'expire',
    'ammount',
    'status',
    'pushId',
    'observation',
    'company',
    'document',
    'queryStatus',
    'ocurrenceCode',
    'situation',
    'display',
    'ocurrence',
    'debtCollector',
    'alinea',
    'lastUpdate',
    'operation',
    'ccf',
    'protesto',
    'lastDebtCollectorMessage',
    'image'
];

var squel = require("squel"),
    changeCase = require('change-case'),
    async = require("async"),
    _ = require("underscore"),
    validCheck = require("./data/valid-check");

module.exports = function(controller) {

    var databaseObject = (obj, type) => {

        type = type || "constantCase";
        var n = {};
        for (var i in obj) {
            if (DATABASE_KEYS.indexOf(changeCase.camelCase(i)) < 0) {
                continue;
            }
            n[changeCase[type](i)] = obj[i];
        }
        return n;
    };

    controller.registerCall("icheques::databaseObject", databaseObject);

    var insertDatabase = function(check) {
        if (Array.isArray(check)) {
            if (check.length <= 0)
                return;
            _.map(check, function(check) {
                return insertDatabase(check);
            });
            return;
        }

        if (!validCheck(check.cmc)) {
            check.situation = "Instituição bancária não monitorada";
            check.display = "Instituição bancária não monitorada";
            check.queryStatus = "Instituição bancária não monitorada";
            check.ocurrenceCode = 99999;
            check.ocurrence = "Instituição bancária não monitorada";
            check.pushId = null;
        }

        controller.database.exec(squel.insert().into("ICHEQUES_CHECKS").setFields(databaseObject(check)).toString());
    };

    controller.registerCall("icheques::insertDatabase", insertDatabase);

    var calculateCheck = function(check) {
        if (!validCheck(check.cmc)) {
            return 0;
        }

        if (controller.call("icheques::check::alreadyExists", check)) {
            return 0;
        }

        var months = moment(check.expire, "YYYYMMDD").diff(moment(), "month") - controller.confs.icheques.monthsIncluded;
        if (months <= controller.confs.icheques.monthsIncluded) {
            return controller.confs.icheques.price;
        }

        return controller.confs.icheques.price + ((months - 5) * controller.confs.icheques.moreMonths);
    };

    var newCheck = function(check, callback) {
        controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CHECK'", {
            data: check,
            success: function(ret) {
                if (!$("new", ret).length) {
                    toastr.warning(`O cheque ${check.cmc} informado já foi cadastrado.`, "Efetue uma busca no sistema e tente novamente.");
                }
                $.extend(check, controller.call("icheques::parse::element", $(ret).find("check").get(0)));
                insertDatabase(check);
            },
            complete: function() {
                callback();
            }
        });
        return true;
    };

    controller.registerCall("icheques::newCheck", newCheck);
    controller.registerCall("icheques::calculateCheckValue", calculateCheck);

    controller.registerCall("icheques::checkout", function(storage) {
        if (!storage.length) {
            return;
        }

        controller.call("icheques::calculateBill", storage, function() {
            var q = async.queue(newCheck);
            var loaderUnregister = $.bipbopLoader.register();
            q.drain = function() {
                loaderUnregister();
                controller.call("icheques::show", storage);
            };

            for (var i in storage) {
                q.push(storage[i]);
            }
        });
    });

    controller.registerCall("icheques::calculateBill", function(checks, callback) {
        controller.server.call("SELECT FROM 'ICHEQUES'.'IPAYTHEBILL'", controller.call("loader::ajax", {
            dataType: "json",
            success: (data) => {
                if (data) {
                    controller.call("icheques::calculateBill::pay", checks, callback);
                } else {
                    callback();
                }
            }
        }));
    });

    controller.registerCall("icheques::calculateBill::pay", function(checks, callback) {
        var total = 0;
        for (var i in checks) {
            total += calculateCheck(checks[i]);
        }

        controller.call("credits::has", total, callback);
    });

};
