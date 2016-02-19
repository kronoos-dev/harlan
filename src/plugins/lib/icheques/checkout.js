/* global moment, module, toastr */

var squel = require("squel"),
        changeCase = require('change-case'),
        async = require("async"),
        _ = require("underscore"),
        validCheck = require("./data/valid-check");

module.exports = function (controller) {

    var databaseObject = function (obj, type) {
        type = type || "constantCase";
        var n = {};
        for (var i in obj) {
            n[changeCase[type](i)] = obj[i];
        }
        return n;
    };

    controller.registerCall("icheques::databaseObject", databaseObject);

    var insertDatabase = function (check) {
        var fields = null,
                sql = null;
        try {
            if (Array.isArray(check)) {
                if (check.length <= 0)
                    return;
                fields = _.map(databaseObject(check), function (check) {
                    return databaseObject(check);
                });
                sql = squel.insert().into("ICHEQUES_CHECKS").setFieldsRows(fields).toString();
                controller.database.exec(sql);
            } else {
                fields = databaseObject(check);
                sql = squel.insert().into("ICHEQUES_CHECKS").setFields(fields).toString();
                controller.database.exec(sql);
            }
        } catch (e) {
            console.error(e, [fields, sql ? sql.toString() : null]);
        }
    };

    controller.registerCall("icheques::insertDatabase", insertDatabase);

    var calculateCheck = function (check) {
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

    var newCheck = function (check, callback) {
        if (!validCheck(check.cmc)) {
            callback();
            return false;
        }

        controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CHECK'", {
            data: check,
            success: function (ret) {
                $.extend(check, controller.call("icheques::parse::element", $(ret).find("check").get(0)));
                insertDatabase(check);
            },
            complete: function () {
                callback();
            }
        });
        return true;
    };

    controller.registerCall("icheques::newCheck", newCheck);
    controller.registerCall("icheques::calculateCheckValue", calculateCheck);

    controller.registerCall("icheques::checkout", function (storage) {
        if (!storage.length) {
            return;
        }

        for (var i in storage) {
            if (!validCheck(storage[i].cmc)) {
                toastr.warning("Alguns cheques não poderão ser processados.",
                        "Instituição bancária não interegrada ao iCheques.");
                break;
            }
        }

        controller.call("icheques::calculateBill", storage, function () {
            var q = async.queue(newCheck);
            var loaderUnregister = $.bipbopLoader.register();
            q.drain = function () {
                loaderUnregister();
                controller.call("icheques::show", storage);
            };

            for (var i in storage) {
                q.push(storage[i]);
            }
        });
    });

    controller.registerCall("icheques::calculateBill", function (checks, callback) {
        var total = 0;
        for (var i in checks) {
            if (!validCheck(checks[i].cmc)) {
                continue;
            }
            total += calculateCheck(checks[i]);
        }

        controller.call("credits::has", total, callback);
    });

};