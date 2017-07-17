/* global module */

var squel = require("squel"),
    sprintf = require("sprintf"),
    changeCase = require("change-case"),
    _ = require("underscore"),
    CPF = require("cpf_cnpj").CPF,
    CNPJ = require("cpf_cnpj").CNPJ,
    StringMask = require("string-mask");

var CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

module.exports = function(controller) {

    controller.registerTrigger("findDatabase::instantSearch", "icheques::search::document", function(args, callback) {
        var expr = squel.expr(),
            format;

        if (CPF.isValid(args[0])) {
            expr.or("CPF = ?", CPF.strip(args[0]));
            expr.or("CPF = ?", format = CPF.format(args[0]));
        } else if (CNPJ.isValid(args[0])) {
            expr.or("CNPJ = ?", CNPJ.strip(args[0]));
            expr.or("CNPJ = ?", format = CNPJ.format(args[0]));
        } else {
            callback();
            return;
        }

        var query = squel.select().from("ICHEQUES_CHECKS").where(expr).toString(),
            databaseResult = controller.call("icheques::resultDatabase", controller.database.exec(query)[0]);

        if (!databaseResult.values.length) {
            callback();
            return;
        }

        args[1].item("iCheques", "Relatório Geral de Cheques", sprintf("Documento: %s", format))
            .addClass("icheque")
            .click(function(e) {
                e.preventDefault();
                controller.call("icheques::show", databaseResult.values, null, null, true);
            });

        callback();
    });

    controller.registerCall("icheques::resultClick", (result) => {
        return (e) => {
            e.preventDefault();
            controller.call("icheques::show", [result], null, null, true);
        };
    });

    controller.registerTrigger("findDatabase::instantSearch", "icheques::search", function(args, callback) {

        var searchString = sprintf("%s%%", args[0]),
            query = squel.select()
            .from("ICHEQUES_CHECKS")
            .order("EXPIRE", false)
            .limit(3)
            .where(squel.expr()
                .or("CPF LIKE ?", searchString)
                .or("CMC LIKE ?", sprintf("%%%s%%", searchString))
                .or("CNPJ LIKE ?", searchString)
                .or(squel.expr()
                    .and("OBSERVATION IS NOT NULL")
                    .and("OBSERVATION != ''")
                    .and("OBSERVATION LIKE ?", sprintf("%%%s%%", args[0]))
                )).toString();

        var databaseResult = controller.call("icheques::resultDatabase", controller.database.exec(query)[0]);

        for (var i in databaseResult.values) {
            args[1].item("iCheques", "Relatório Geral de Cheques",
                    sprintf("Documento: %s Cheque: %s", databaseResult.values[i].cpf || databaseResult.values[i].cnpj,
                        CMC7_MASK.apply(databaseResult.values[i].cmc)))
                .addClass("icheque")
                .click(controller.call("icheques::resultClick", databaseResult.values[i]));
        }

        callback();
    });

};
