/* global moment, module */

var squel = require("squel"),
        changeCase = require('change-case'),
        async = require("async"),
        _ = require("underscore");

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
        var months = moment(check.expire, "YYYYMMDD").diff(moment(), "month") - controller.confs.icheques.monthsIncluded;
        if (months <= controller.confs.icheques.monthsIncluded) {
            return controller.confs.icheques.price;
        }

        return controller.confs.icheques.price + ((months - 5) * controller.confs.icheques.moreMonths);
    };

    var newCheck = function (check, callback) {
        controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CHECK'",
                controller.call("loader::ajax", {
                    data: check,
                    success: function (ret) {
                        $.extend(check, controller.call("icheques::parse::element", $(ret).find("check").get(0)));
                        insertDatabase(check);
                        callback();
                    },
                    error: function (err) {
                        callback(err);
                    }
                }));
    };

    controller.registerCall("icheques::newCheck", newCheck);
    controller.registerCall("icheques::calculateCheckValue", calculateCheck);

    controller.registerCall("icheques::checkout", function (storage) {
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
            total += calculateCheck(checks[i]);
        }

        controller.call("credits::has", total, callback);
    });

};