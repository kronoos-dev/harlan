/* global module, numeral, require, moment */

var TIMEOUT = 5000;

var Harmonizer = require("color-harmony").Harmonizer,
        Color = require("color"),
        sprintf = require("sprintf"),
        _ = require("underscore"),
        hashObject = require('hash-object'),
        ChartJS = require("chart.js"),
        squel = require("squel"),
        changeCase = require('change-case');

var controller;
var updateRegister = [];
var async = require("async");
var harmonizer = new Harmonizer();
var colorMix = "neutral", colors = {
    error: harmonizer.harmonize("#ff1a53", colorMix),
    warning: harmonizer.harmonize("#ffe500", colorMix),
    success: harmonizer.harmonize("#00ff6b", colorMix)
};

var messages = {
    overall: require('../../../markdown/icheques/default.report.html.js'),
    noOcurrence: require('../../../markdown/icheques/no-ocurrence.report.html.js'),
    ocurrence: require('../../../markdown/icheques/ocurrence.report.html.js'),
    processing: require('../../../markdown/icheques/processing.report.html.js')
};

var parseDate = function (val, format) {
    if (/^\s*$/.test(val))
        return null;

    var d = moment(val, "DD/MM/YYYY").minute(0).second(0).hour(0);
    if (!format) {
        return d.isValid() ? d : null;
    }
    return d.isValid() ? d.format(format) : null;
};

var parseValue = function (val) {
    return /^\s*$/.test(val) ? null : numeral(val)._value;
};

var AccountOverview = function (closeable) {

    var report = controller.call("report",
            AccountOverview.prototype.about.title,
            AccountOverview.prototype.about.subtitle, null, closeable), timeout = null,
            labels = [], doughnut = null, lastDataset = null;

    report.element().addClass("ichequesAccountOverview");

    var status = report.paragraph().html(messages.overall),
//            mainLabel = report.label("Visão Geral"),
            i = this,
            expression = squel.expr();

    var modalFilter = function () {
        /* How deep is your love? */

        var modal = controller.call("modal");
        modal.title("Filtrar Resultados");
        modal.subtitle("Adicione filtros a sua consulta.");
        var form = modal.createForm();

        var multiFieldCreation = form.multiField(),
                multiFieldExpire = form.multiField(),
                multiFieldValue = form.multiField().addClass("double-margin"),
                initExpiration = form.addInput("init-expire", "text", "00/00/00", {
                    append: multiFieldExpire,
                    labelPosition: "before",
                    class: "labelShow"
                }, "Expiração").mask("00/00/0000"),
                endExpiration = form.addInput("end-expire", "text", "00/00/00", {
                    append: multiFieldExpire,
                    labelPosition: "before",
                    class: "labelShow"
                }, "Expiração até").mask("00/00/0000"),
                initCreation = form.addInput("init-creation", "text", "00/00/00", {
                    append: multiFieldCreation,
                    labelPosition: "before",
                    class: "labelShow"
                }, "Criação").mask("00/00/0000"),
                endCreation = form.addInput("end-creation", "text", "00/00/00", {
                    append: multiFieldCreation,
                    labelPosition: "before",
                    class: "labelShow"
                }, "Criação Até").mask("00/00/0000"),
                initAmmount = form.addInput("init-ammount", "text", "Valor", {
                    append: multiFieldValue,
                    class: "money",
                    labelPosition: "before"
                }, "R$").mask('000.000.000.000.000,00', {reverse: true}),
                endAmmount = form.addInput("end-ammount", "text", "Valor Até", {
                    append: multiFieldValue,
                    class: "money",
                    labelPosition: "before"
                }, "R$").mask('000.000.000.000.000,00', {reverse: true});

        _.each([initCreation, endCreation, initExpiration, endExpiration], function (e) {
            e.pikaday();
        });

        var filter = form.addSelect("filter-overview", "Cheques", [
            "Todos os tipos de cheque",
            "Cheques processados",
            "Cheques em processamento",
            "Cheques sem ocorrências",
            "Cheques com ocorrências"
        ]);

        form.element().submit(function (e) {
            e.preventDefault();
            reportFilter({
                initExpiration: parseDate(initExpiration.val(), "YYYYMMDD"),
                endExpiration: parseDate(endExpiration.val(), "YYYYMMDD"),
                initCreation: parseDate(initCreation.val()),
                endCreation: parseDate(endCreation.val()),
                initAmmount: parseValue(initAmmount.val()),
                endAmmount: parseValue(endAmmount.val()),
                filter: filter.val()
            });
            modal.close();
        });

        form.addSubmit("filter", "Filtrar");

        modal.createActions().add("Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

    };


    var filterLabels = [];
    var openDocuments = function () {
        var querystr = squel
                .select()
                .from('ICHEQUES_CHECKS')
                .where(expression)
                .toString();

        var query = controller.database.exec(querystr)[0];
        if (!query || !query.values) {
            return;
        }

        if (!$("section.icheque, footer.load-more").length) {
            controller.call("icheques::show::query", query, function () {
                $(window).scrollTop($("section.icheque, .footer.load-more").first().offset().top);
            });
        } else {
            $(window).scrollTop($("section.icheque, .footer.load-more").first().offset().top);
            controller.call("confirm", {
                title: "Encontramos alguns resultados já abertos.",
                subtitle: "Você tem certeza que deseja abrir mais estes?"
            }, function () {
                controller.call("icheques::show::query", query);
            });
        }
    };


    var reportFilter = function (f) {
        _.each(filterLabels, function (e) {
            e.remove();
        });

        filterLabels = [];

        /* convert modal data */
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        expression = squel.expr();


        if (f.filter === "1") {
            expression.and("(QUERY_STATUS NOT NULL AND QUERY_STATUS != 10)");
//            filterLabels.push(report.label("Cheques Processados"));
        }
        else if (f.filter === "2") {
            expression.and("(QUERY_STATUS IS NULL OR QUERY_STATUS == 10)");
//            filterLabels.push(report.label("Cheques em Processamento"));
        }
        else if (f.filter === "3") {
            expression.and("(QUERY_STATUS = 1)");
//            filterLabels.push(report.label("Cheques sem Ocorrência"));
        }
        else if (f.filter === "4") {
            expression.and("(QUERY_STATUS NOT NULL AND QUERY_STATUS != 10 AND QUERY_STATUS != 1)");
//            filterLabels.push(report.label("Cheques com Ocorrência"));
        }


        if (f.endExpiration) {
            expression.and("EXPIRE <= ?", f.endExpiration);
//            filterLabels.push(report.label("Expira até " + moment(f.endExpiration, "YYYYMMDD").format("DD/MM/YYYY")));
        }

        if (f.initExpiration && f.endExpiration) {
            expression.and("EXPIRE >= ?", f.initExpiration);
//            filterLabels.push((report.label("Expira de " + moment(f.initExpiration, "YYYYMMDD").format("DD/MM/YYYY"))));
        } else if (f.initExpiration) {
            expression.and("EXPIRE = ?", f.initExpiration);
//            filterLabels.push(report.push(report.label("Expira de " + moment(f.initExpiration, "YYYYMMDD").format("DD/MM/YYYY"))));
        }

        if (f.endCreation) {
            expression.and("CREATION <= ?", f.endCreation.second(59).minute(59).hour(23).unix());
//            filterLabels.push(report.label("Criado até " + f.endCreation.format("DD/MM/YYYY")));
        }

        if (f.initCreation && f.endCreation) {
            expression.and("CREATION >= ?", f.initCreation.second(0).minute(0).hour(0).unix());
//            filterLabels.push(report.label("Criado em " + f.initCreation.format("DD/MM/YYYY")));
        } else if (f.initCreation) {
            expression.and("CREATION >= ?", f.initCreation.second(0).minute(0).hour(0).unix());
            expression.and("CREATION <= ?", f.initCreation.second(59).minute(59).hour(23).unix());
//            filterLabels.push(report.label("Criado em " + f.initCreation.format("DD/MM/YYYY")));
        }

        if (f.endAmmount) {
            expression.and("AMMOUNT <= ?", f.endAmmount * 100);
//            filterLabels.push(report.label("Valor até " + numeral(f.initAmmount / 100).format("$0,0.00")));
        }

        if (f.initAmmount && f.endAmmount) {
            expression.and("AMMOUNT >= ?", f.initAmmount * 100);
//            filterLabels.push(report.label("Valor de " + numeral(f.initAmmount / 100).format("$0,0.00")));
        } else if (f.initAmmount) {
            expression.and("AMMOUNT = ?", f.initAmmount * 100);
//            filterLabels.push(report.label("Valor " + numeral(f.initAmmount / 100).format("$0,0.00")));
        }

        _.each(filterLabels, function (e) {
//            e.insertAfter(mainLabel);
        });

        i.draw();
    };

    report.newAction("fa-folder-open", openDocuments);

    report.newAction("fa-cloud-download", () => {
        controller.call("icheques::ban::nominate");
    });

    var openButton = report.button("Filtrar Cheques", modalFilter);

    report.newContent();

    controller.registerCall("icheques::ban::nominate", () => {
        var modal = controller.call("modal");

        modal.title("Identificação do Cliente");
        modal.subtitle("Preencha o campo abaixo com sua identificação de cliente");

        var form = modal.createForm();

        var inputClientId = form.addInput("client-id", "text", "00000", {}, "ID de Cliente");

        form.element().submit(function (e) {
            e.preventDefault();

            var clientId = inputClientId.val().trim();

            controller.call("icheques::ban::generate",
                clientId,
                controller.call("icheques::resultDatabase", controller.database.exec(squel
                    .select()
                    .from('ICHEQUES_CHECKS')
                    .where(expression)
                    .toString())[0]
                )
            );

            modal.close();
        });
        form.addSubmit("ban-generate", "Gerar .ban");

        modal.createActions().add("Sair").click(function(e) {
            e.preventDefault();
            modal.close();
        });
    });

    var canvas = report.canvas(250, 250);

    /**
     * Agrupa resultados com menos de 5% evitando problemas no gráfico
     * @param {array} data
     * @returns {array}
     */
    var reduceDataset = function (data) {

        var sum = _.reduce(data, function (a, b) {
            return {value: a.value + b.value};
        });

        sum = sum && sum.value ? sum.value : 0;

        var idx = 1;

        return _.map(_.values(_.groupBy(data, function (item) {
            if (item.value < sum * 0.05) {
                return 0;
            }
            return idx++;
        })), function (value) {
            return _.reduce(value, function (a, b) {
                a.value += b.value;
                a.color = "#93A7D8";
                a.highlight = new Color("#93A7D8").lighten(0.1).hslString();
                a.ammount = (a.ammount || 0) + (b.ammount || 0);
                a.label = "Outros" + (a.ammount ? " " + numeral(a.ammount / 100.0).format("$0,0.00") : "");
                return a;
            });
        });

    };

    /**
     * Generate Dataset
     * @returns {Array|AccountOverview.generateDataset.data}
     */
    var generateDataset = function () {

        var query = squel
                .select()
                .from('ICHEQUES_CHECKS')
                .field('SITUATION, QUERY_STATUS, SUM(AMMOUNT), COUNT(1)')
                .group('SITUATION, QUERY_STATUS')
                .order('4', false)
                .where(expression)
                .toString();

        var queryResult = controller.database.exec(query)[0];

        if (!queryResult || !queryResult.values) {
            return [];
        }

        queryResult = queryResult.values;

        var data = [],
                iteratorColors = {error: 0, warning: 0, success: 0};

        for (var i in queryResult) {

            queryResult[i][0] = queryResult[i][0] || "Em processamento";
            var iterateColor = "error";
            if (queryResult[i][1] === 1) {
                iterateColor = "success";
            } else if (queryResult[i][1] === null || queryResult[i][1] === 10) {
                iterateColor = "warning";
            }

            var color = new Color(colors[iterateColor][iteratorColors[iterateColor]]);

            data.push({
                value: queryResult[i][3],
                color: color.hslString(),
                highlight: color.lighten(0.1).hslString(),
                label: queryResult[i][2] ? numeral(queryResult[i][2] / 100.0).format("$0,0.00") : "",
                ammount: queryResult[i][2],
                situation: queryResult[i][0],
                queryStatus: queryResult[i][1]
            });

            iteratorColors[iterateColor] += 1;
        }

        return data;
    };

    var manipulationItens = [];

    var manipulateDataset = function (dataset) {

        _.each(manipulationItens, function (e) {
            e.remove(); /* remove elements */
        });

        var datasetQueryStatus = _.map(dataset, function (obj) {
            return obj.queryStatus;
        });

        if (!_.without(datasetQueryStatus, 1).length) {
            status.html(messages.noOcurrence);
        } else if (!_.without(datasetQueryStatus, 10, null).length) {
            status.html(messages.processing);
        } else if (!_.intersection(datasetQueryStatus, [null, 10, 1]).length) {
            manipulationItens.push(report.button("Abrir Documentos", function () {
                openDocuments();
            }).insertBefore(openButton));
            status.html(messages.ocurrence);
        } else {
            status.html(messages.overall);
        }
    };


    var drawDoughnut = function (dataset) {

        if (doughnut) {
            doughnut.clear();
            doughnut = null;
        }

        _.each(labels, function (i) {
            i.remove();
        });

        labels = _.map(dataset, function (element) {
            var color = new Color(element.color);
            return report.label(sprintf("%s: %d", element.situation, element.value)).css({
                "background-color": color.hslString(),
                "color": color.light() ? "#000" : "#fff"
            });
        });

        doughnut = new ChartJS(canvas.getContext("2d")).Doughnut(reduceDataset(dataset));
    };

    this.draw = function () {

        var dataset = generateDataset();

        if (!this.showable(true, dataset)) {
            return;
        }

        var hashDataset = hashObject(dataset);

        manipulateDataset(dataset);

        if (hashDataset === lastDataset) {
            return; /* nothing changed */
        }

        lastDataset = hashDataset;

        if (timeout) {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                drawDoughnut(dataset);
            });
        } else {
            drawDoughnut(dataset);
        }
    };

    this.showable = function (showAlert, dataset, title, subtitle, paragraph) {
        if ((dataset || generateDataset()).length) {
            return true;
        }

        if (showAlert) {
            controller.call("alert", {
                title: title || "Sem cheques para montagem de relatório.",
                subtitle: subtitle || "Você precisa de alguns cheques para poder poder continuar.",
                paragraph: paragraph || "Você não possui cheques cadastrados para continuar, insira alguns e tente novamente."
            });
        }

        return false;
    };

    this.element = function () {
        return report.element();
    };

    var selfie = this;
    var draw = function () {
        selfie.draw();
    };

    updateRegister.push(draw);
    report.onClose = function () {
        var idx = updateRegister.indexOf(draw);
        if (idx !== -1)
            delete updateRegister[idx];

    };

    return this;
};

AccountOverview.prototype.about = {
    title: "Relatório da Conta",
    subtitle: "Situação dos Cheques Cadastrados",
    description: "Verifique os principais motivos dos cheques estarem ruins na sua carteira, sejam por sustação, cadastro incorreto e demais."
};



module.exports = function (c) {
    controller = c;

    controller.registerTrigger("serverCommunication::websocket::ichequeUpdate", "ichequeUpdate::draw::serverCommunication::websocket", function (obj, cb) {
        async.parallel(updateRegister, cb);
    });

    return AccountOverview;
};
