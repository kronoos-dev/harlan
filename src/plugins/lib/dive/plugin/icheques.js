/* global toastr, require, module, numeral, moment */

const async = require("async"),
    StringMask = require("string-mask"),
    URL = require('url-parse'),
    queryString = require('query-string'),
    escapeStringRegexp = require('escape-string-regexp');

import _ from 'underscore';
import { CPF, CNPJ } from "cpf_cnpj";
import { CMC7Parser } from "../../../lib/icheques/cmc7-parser.js";

const CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

module.exports = function (controller) {

    let format = (check, url, data) => {
        let result = controller.call("result"),
            separatorData = {},
            separator = result.addSeparator("Verificação de Cheque",
                "Verificação de Dados do Cheque",
                "Cheque CMC7 " + CMC7_MASK.apply(check.cmc.replace(/[^\d]/g, "")),
                separatorData);

        let actions = separator.find(".actions");
        controller.call("tooltip", actions, "Dados para Depósito").append($("<i />").addClass("fa fa-bank")).click(e => {
            e.preventDefault();

            let [bank, ag, acc] = check.companyData.bankAccount;
            let name = check.companyData.nome || check.companyData.responsavel,
                document = check.companyData.cnpj ? CNPJ.format(check.companyData.cnpj) : CPF.format(check.companyData.cpf);

            let form = controller.call("form", i => {

                let item = {
                    check: check._id,
                    hyperlink: url,
                    paid: true,
                    label: data.data.label,
                };
                i.ammount = Math.floor(i.ammount * 100);
                /* Remove o Listener da Cobrança */
                var validate = new RegExp(`(\\?|\\&)id\=${escapeStringRegexp(check._id)}`, 'gi'),
                    historyCallback = _.filter(data.data.historyCallback, c => validate.test(c));
                if (historyCallback.length) {
                    item.historyCallback = historyCallback[0];
                }

                controller.server.call("DELETE FROM 'DIVE'.'ENTITY'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    dataType: "json",
                    data: Object.assign(item, i),
                    success: ret => {
                        result.element().remove();
                        if (ret.deleted) {
                            $(`*[data-entity='${data.data._id}']`).remove();
                            data.section[0].remove();
                        }

                        toastr.success("Ótimas notícias, já mandamos uma mensagem para nosso usuário contando das boas novas.",
                            "Removemos o registro do banco de dados para não continuarmos a cobrança.");
                    }
                })));
            });
            form.configure({
                "title": "Dados para Depósito",
                "subtitle": "Dados bancários para depósito dos valores do cheque.",
                "gamification": "magicWand",
                "paragraph": "Confirme o valor a ser depositado.",
                "screens": [{
                    "magicLabel": true,
                    "fields": [[{
                        "name": "name",
                        "optional": false,
                        "type": "text",
                        "value": name,
                        "disabled": true,
                        "placeholder": "Nome",
                    }, {
                        "name": "document",
                        "optional": false,
                        "type": "text",
                        "value": document,
                        "disabled": true,
                        "placeholder": "Documento",
                    }], [{
                        "name": "bank",
                        "optional": false,
                        "type": "text",
                        "value": bank,
                        "magicLabel": true,
                        "label": false,
                        "placeholder": "Banco",
                        "disabled" : true,
                    }, {
                        "name": "ag",
                        "optional": false,
                        "type": "text",
                        "numeral": true,
                        "value": ag,
                        "placeholder": "Agência",
                        "mask": "0000",
                        "disabled" : true
                    }, {
                        "name": "acc",
                        "value": acc,
                        "type": "text",
                        "optional": false,
                        "mask": "99999999990-0",
                        "placeholder": "Conta Corrente",
                        "disabled" : true,
                        "maskOptions": {
                            "reverse": true
                        }
                    }],{
                        "required": true,
                        "name": "ammount",
                        "type": "text",
                        "placeholder": "Valor Depositado (R$)",
                        "labelText": "Valor Depositado (R$)",
                        "mask": "000.000.000.000.000,00",
                        "maskOptions": {
                            "reverse": true
                        },
                        "numeral": true
                    }]}
            ]});
        });

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
            success: c => {
                if (!c.count) return;
                let result = format(c.list[qs._id], url, data);
                data.section[1].append(result.element());
            }
        });
    });
};
