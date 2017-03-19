/* global toastr, require, module, numeral, moment */

var async = require("async"),
    StringMask = require("string-mask"),
    _ = require("underscore"),
    squel = require("squel"),
    changeCase = require('change-case'),
    CNPJ = require("cpf_cnpj").CNPJ;

import { CMC7Parser } from "./cmc7-parser.js";

var SEARCH_REGEX = /cheq?u?e?/i,
    FIDC = /fid?c?/i,
    LIMIT = 3,
    CMC7_MASK = new StringMask("00000000 0000000000 000000000000"),
    QUERY_LIMIT = 2000;

module.exports = function(controller) {

    controller.registerCall("icheques::debtCollector", (check) => {
        var inputExpire;
        let dispachEvent = (formData) => {
            check.expire = moment(inputExpire.val(), "DD/MM/YYYY").format("YYYYMMDD");
            controller.serverCommunication.call("UPDATE 'ICHEQUES'.'DebtCollector'", controller.call("error::ajax", {
                method: "post",
                type: "json",
                data: Object.assign({}, check, formData, {debtCollector: controller.confs.debtCollector}),
                success: () => {
                    check.debtCollector = true;
                    controller.call("alert", {
                        icon: "pass",
                        title: "Parabéns, cheque enviado para cobrança!",
                        subtitle: "Seu cheque foi enviado para cobrança.",
                        paragraph: "A cobrança tentará recuperar os valores e em breve entrará em contato.",
                        confirmText: "Compreendi"
                    });
                }
            }));
        };

        let collectBill = () => controller.call("form", dispachEvent).configure({
            "title": "Envie o cheque para cobrança",
            "subtitle": "Para enviar o cheque ao nosso módulo de cobrança você deve informar a alínea carimbada no verso do cheque.",
            "gamification": "star",
            "screens": [{
                "fields" : [{
                    "name": "alinea",
                    "type": "select",
                    "labelText": "Alínea de Retorno",
                    "optional": false,
                    "list": {
                        "": "Selecionar alínea de retorno.",
                        11: "Alínea 11: Insuficiência de fundos – 1ª apresentação",
                        12: "Alínea 12: Insuficiência de fundos – 2ª apresentação",
                        13: "Alínea 13: Conta encerrada",
                        14: "Alínea 14: Prática espúria",
                        20: "Alínea 20: Folha de cheque cancelada por solicitação do correntista",
                        21: "Alínea 21: Contra-ordem (ou revogação) ou oposição (ou sustação) do pagamento pelo emitente ou portador do cheque",
                        22: "Alínea 22: Divergência ou insuficiência de assinatura (só válida se houver saldo)",
                        31: "Alínea 31: Erro formal",
                        44: "Alínea 44: Cheque prescrito",
                        48: "Alínea 48: Cheque acima de R$ 100,00 sem a indicação do favorecido",
                        51: "Alínea 51: Divergência no valor recebido"
        }}]}]});

        let sendBill = () => controller.call("bankAccount::need", collectBill);
        let createList = (modal, form) => {
            inputExpire = form.addInput("Vencimento", "text", "Vencimento do Cheque").mask("00/00/0000").val(moment(check.expire, "YYYYMMDD").format("DD/MM/YYYY"));
            inputExpire.pikaday();
            var list;
            let renderList = (inputMoment) => {
                if (list) {
                    let newList = form.createList();
                    list.element().replaceWith(newList.element());
                    list = newList;
                } else {
                    list = form.createList();
                }
                let days = moment().diff(inputMoment || moment(check.expire, "YYYYMMDD"), 'days');
                list.item(days <= 180 ? "fa-check-square" : "fa-square", ["De 1 até 180 dias de atraso", "10% - do Principal", numeral((check.ammount / 100) * 0.9).format("$0,0.00")]);
                list.item(days >= 181 && days <= 364 ? "fa-check-square" : "fa-square", ["De 181 Até 364 dias de atraso", "15% - do Principal", numeral((check.ammount / 100) * 0.85).format("$0,0.00")]);
                list.item(days >= 365 && days <= 729 ? "fa-check-square" : "fa-square", ["De 365 Até 729 dias de atraso", "20% - do Principal", numeral((check.ammount / 100) * 0.8).format("$0,0.00")]);
                list.item(days >= 730 && days <= 1094 ? "fa-check-square" : "fa-square", ["De 730 Até 1094 dias de atraso", "30% - do Principal", numeral((check.ammount / 100) * 0.7).format("$0,0.00")]);
                list.item(days >= 1095 && days <= 1459 ? "fa-check-square" : "fa-square", ["De 1095 Até 1459 dias de atraso", "40% - do Principal", numeral((check.ammount / 100) * 0.6).format("$0,0.00")]);
                list.item(days >= 1460 && days <= 1824 ? "fa-check-square" : "fa-square", ["De 1460 Até 1824 dias de atraso", "50% - do Principal", numeral((check.ammount / 100) * 0.5).format("$0,0.00")]);
                list.item(days >= 1825 ? "fa-check-square" : "fa-square", ["Mais de 1825 dias de atraso", "60% - do Principal", numeral((check.ammount / 100) * 0.4).format("$0,0.00")]);
            };
            renderList();
            inputExpire.change(() => renderList(moment(inputExpire.val(), "DD/MM/YYYY")));
            modal.paragraph("Os valores podem mudar pelo pagamento de taxas e afins.").addClass("observation");
        };

        let confirm = (err) => {
            if (err) return;
            controller.confirm({
                title: "Enviar seu cheque para cobrança?",
                subtitle: "Não há custos na cobrança; é retido a comissão (%) somente se há sucesso na recuperação de seu cheque.",
                paragraph: "Veja abaixo a tabela de comissionamento, e caso aceite nossos termos de serviço, pode enviar seu cheque para cobrança.  Caso seja recuperado o valor cobrado, será creditado na conta bancária cadastrada. O contrato de serviço está disponível <a target='_blank' href='legal/icheques/TERMOS COBRANCA.pdf' title='contrato de serviço'>neste link</a>, após a leitura clique em confirmar para aceitar os termos.",
            }, sendBill, null, createList, true, () => {
                if (moment(inputExpire.val(), "DD/MM/YYYY").isAfter(moment())) {
                    inputExpire.addClass("error");
                    return false;
                }
                return true;
            });
        };
        if (!check.ammount) controller.call("icheques::item::edit", check, confirm, false, null, false);
        else confirm();
    });

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
            }, 1000),
            hasResult = false,
            skip = 0;

        async.doUntil((cb) => {
            controller.serverCommunication.call("SELECT FROM 'ICHEQUES'.'CHECKS'", controller.call("error::ajax", {
                data: {
                    'q[0]': "SELECT FROM 'ICHEQUES'.'CHECKS'",
                    'q[1]': "SELECT FROM 'ICHEQUESFIDC'.'OPERATION'",
                    'limit' : QUERY_LIMIT,
                    'skip' : skip,
                    'approved': 'true'
                },
                error: () => cb(Array.from(arguments)),
                success: function(ret) {
                    var storage = [];
                    skip += QUERY_LIMIT;
                    hasResult = false;
                    $(ret).find("check").each(function() {
                        hasResult = true;
                        storage.push(controller.call("icheques::parse::element", this));
                    });

                    controller.call("icheques::insertDatabase", storage);
                    cb();
                },
            }));
        }, () => !hasResult, () => {
            registerSocket();
            clearTimeout(loaderTimeout);
            if (unregister)
                unregister();
            callback();
        });
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

        if (controller.confs.ccf && moment().isAfter(moment(check.expire, "YYYYMMDD"))) {
            controller.call("tooltip", separatorData.menu, "Cobrar Cheque")
                .append($("<i />").addClass("fa fa-life-buoy")).click((e) => {
                    e.preventDefault();
                    if (!check.debtCollector) {
                        controller.call("icheques::debtCollector", check);
                    } else {
                        controller.confirm({
                            title: "Você deseja REMOVER o cheque da cobrança?",
                            subtitle: "Não há custo para cancelar ou enviar para cobrança.",
                            paragraph: "Todas e quaisquer cobranças ao sacado serão interrompidas se clicar em CONFIRMAR."
                        }, () => {
                            controller.serverCommunication.call("DELETE FROM 'ICHEQUES'.'DebtCollector'", {
                                data: check,
                                success: () => {
                                    delete check.debtCollector;
                                    controller.alert({
                                        icon: "pass",
                                        title: "Uoh! Cheque recuperado da cobrança!",
                                        subtitle: "Seu cheque foi recuperado da cobrança.",
                                        paragraph: "A cobrança não mais tentará recuperar os valores. Entramos em contato para informá-los.",
                                        confirmText: "Compreendi"
                                    });
                                }
                            });
                        });
                    }
                });
        }

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

                    if (check.debtCollector) {
                        nodes.push(checkResult.addItem("Cobrança", "Ativa"));
                    }

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

            let mensagem = section[0].find("h3").text();

            controller.serverCommunication.call("SELECT FROM 'SEEKLOC'.'CCF'", {
                data: {
                    documento: task[0]
                },
                success: (ret) => {
                    let totalRegistro =  parseInt($(ret).find("BPQL > body > data > resposta > totalRegistro").text());

                    if (!totalRegistro) {
                        section[0].find("h3").text(mensagem += ` Não há cheques sem fundo.`);
                        return;
                    }

                    let qteOcorrencias = $(ret).find("BPQL > body > data > sumQteOcorrencias").text();

                    let v1 = moment($("dataUltOcorrencia", ret).text(), "DD/MM/YYYY"),
        				v2 = moment($("ultimo", ret).text(), "DD/MM/YYYY");

                    mensagem += ` Total de registros CCF: ${qteOcorrencias} com data da última ocorrência: ${(v1.isAfter(v2) ? v1 : v2).format("DD/MM/YYYY")}`;
                    section[0].find("h3").text(mensagem);
                    section[0].addClass("warning");

                    $(ret).find("BPQL > body list > *").each((k, v) => {

                        for (let check of task[1]) {
                            let cmc = new CMC7Parser(check.cmc),
                                agency = $("agencia", v).text().replace(/^[0]+/, ''),
                                bank = $("banco", v).text().replace(/^[0]+/, '');

                            if (agency == cmc.agency.replace(/^[0]+/, '') &&
                                bank == cmc.bank.replace(/^[0]+/, '')) {
                                section[0].removeClass("warning").addClass("critical");
                            }
                        }

                    });

                    section[1].append(controller.call("xmlDocument", ret));
                }
            });

            controller.serverCommunication.call("SELECT FROM 'IEPTB'.'WS'", {
                data: {
                    documento: task[0]
                },
                success: (ret) => {
                    if ($(ret).find("BPQL > body > consulta > situacao").text() != "CONSTA") {
                        section[0].find("h3").text(mensagem += ` Não há protestos.`);
                        return;
                    }
                    let totalProtestos = $("protestos", ret)
                        .get()
                        .map((p) => parseInt($(p).text()))
                        .reduce((a, b) => a + b, 0);
                    section[0].find("h3").text(mensagem += ` Total de Protestos: ${totalProtestos}`);
                    section[0].addClass("warning");
                    section[1].append(controller.call("xmlDocument", ret));
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
                    icon = $("<i />").addClass("fa fa-user-plus"),
                    showing = false;

                section[2].prepend($("<li />").append(icon)
                    .attr("title", "Informações do Sacado"));

                section[2].find(".action-resize i").click(function() {
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
