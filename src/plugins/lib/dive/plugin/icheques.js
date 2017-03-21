/* global toastr, require, module, numeral, moment */

const async = require("async"),
    StringMask = require("string-mask"),
    URL = require('url-parse'),
    queryString = require('query-string');

import { CPF, CNPJ } from "cpf_cnpj";
import { CMC7Parser } from "../../../lib/icheques/cmc7-parser.js";
const CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

module.exports = function (controller) {

    let format = (check) => {
        let result = controller.call("result"),
            separatorData = {},
            separator = result.addSeparator("Verificação de Cheque",
                "Verificação de Dados do Cheque",
                "Cheque CMC7 " + CMC7_MASK.apply(check.cmc.replace(/[^\d]/g, "")),
                separatorData);

        separator.addClass("external-source");
        let checkResult = controller.call("result");
        checkResult.element().insertAfter(separator);
        if (check.ammount) {
            checkResult.addItem("Valor", numeral(check.ammount / 100).format("$0,0.00"));
        }

        checkResult.addItem("Número do Cheque", new CMC7Parser(check.cmc).number);

        let expiration;
        if (check.expire) {
            expiration = checkResult.addItem("Expiração", moment(check.expire, "YYYYMMDD").format("DD/MM/YYYY"));
        }

        if (check.observation) {
            checkResult.addItem("Observação", check.observation);
        }

        if (check.exceptionMessage) {
            if (check.exceptionPushable) {
                separator.addClass("warning");
                checkResult.addItem("Erro", check.exceptionMessage);
            }
            return;
        }

        if (check.debtCollector) {
            checkResult.addItem("Cobrança", "Ativa");
        }

        let elementClass = "success",
            situation = check.situation,
            display = check.display,
            ocurrence = check.ocurrence;

        if (check.queryStatus !== 1) {
            elementClass = "error";
            separator.find("h4").text(check.situation);
        }

        separator.addClass(elementClass);
        checkResult.addItem(`Situação (${check.queryStatus})`, situation);
        checkResult.addItem("Exibição", display);

        if (check.ocurrenceCode) {
            checkResult.addItem(`Ocorrência (${check.ocurrenceCode})`, ocurrence);
        }

        checkResult.addItem("Alínea", check.alinea);
        separator.addClass(elementClass);
        return result;
    };

    controller.call("dive::plugin::register", /plugin:\/\/icheques($|\/|\?)/, (url, data) => {
        let urlParse = new URL(url);

        if (!urlParse.query) return;
        let qs = queryString.parse(urlParse.query);
        if (!qs._id) return;

        controller.server.call("SELECT FROM 'DIVE'.'ICHEQUES'", {
            dataType: "json",
            data : {id : qs._id},
            success: (c) => {
                if (!c.count) return;
                let result = format(c.list[qs._id]);
                data.section[1].append(result.element());
            }
        });
    });
};
