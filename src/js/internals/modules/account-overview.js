var _ = require("underscore"),
    Color = require("color"),
    randomColor = require("randomcolor"),
    ChartJS = require("chart.js"),
    buildURL = require("build-url");

module.exports = function(controller) {

    controller.endpoint.accountOverview = "SELECT FROM 'BIPBOPCOMPANYSREPORT'.'REPORT'";

    var colorPattern = {
        "querys": Color("#ff6a33"),
        "push": Color("#33ff6a"),
        "pushRemoved": Color("#ffd033"),
        "pushCreated": Color("#33c8ff"),
    };

    controller.registerCall("accountOverview::dataset", function(responses) {
        var datasets = {};
        var labels = _.map(responses, (item) => {
            $(item).children("report").each((idx, value) => {
                var reader = $(value),
                    id = reader.children("id").text();

                if (!datasets[id]) {
                    var color = colorPattern[id] || new Color(randomColor({
                            luminosity: 'bright',
                            format: 'rgb' // e.g. 'rgb(225,200,20)'
                        })),
                    fillColor = new Color(color.object());

                    fillColor.fade(0.7);

                    datasets[id] = {
                        color: color,
                        fillColor: fillColor.string(),
                        strokeColor: color.string(),
                        pointColor: color.string(),
                        pointStrokeColor: color.light() ? "#fff" : "#000",
                        pointHighlightFill: color.light() ? "#fff" : "#000",
                        pointHighlightStroke: color.string(),
                        id: reader.children("id").text(),
                        label: reader.children("name").text(),
                        description: reader.children("description").text(),
                        data: []
                    };
                }
                datasets[id].data.push(parseInt(reader.children("value").text()));
            });
            return $("begin", item).text();
        });
        return {
            labels: labels,
            datasets: _.values(datasets)
        };
    });

    controller.registerCall("accountOverview::filter", (username, report, callback, closeable = false) => {
        var modal = controller.call("modal");
        modal.title("Filtros do Relatório");
        modal.subtitle("Modifique o Relatório");
        modal.paragraph("Defina abaixo as características que deseja que sejam usadas para a geração do relatório de consumo.");

        var form = modal.createForm(),
            dateStart = form.addInput("dateStart", "text", "dd/mm/yyyy", null, "De", moment().subtract(2, 'months').format("DD/MM/YYYY")).pikaday(),
            dateEnd = form.addInput("dateEnd", "text", "dd/mm/yyyy", null, "Até", moment().format("DD/MM/YYYY")).pikaday(),
            period = form.addSelect("dd", "period", {
                "P1W": "Semanal",
                "P1D": "Diário",
                "P1M": "Mensal"
            }, null, "Intervalo");

        form.element().submit((e) => {
            e.preventDefault();
            modal.close();
            controller.call("accountOverview", callback, report.element(),
                username,
                /^\d{2}\/\d{2}\/\d{4}$/.test(dateStart.val()) ? dateStart.val() : null,
                /^\d{2}\/\d{2}\/\d{4}$/.test(dateEnd.val()) ? dateEnd.val() : null,
                period.val(), "replaceWith", closeable);
        });
        form.addSubmit("submit", "Filtrar");
        modal.createActions().cancel();
    });

    controller.registerCall("accountOverview::download", function(ajaxQuery, labels) {

        let download = (report) => {
                return (e) => {
                    e.preventDefault();
                    window.location.assign(buildURL(bipbop.webserviceAddress, {
                        queryParams: $.extend({}, ajaxQuery, {
                            q: controller.endpoint.accountOverview,
                            download: "true",
                            apiKey: controller.server.apiKey(),
                            report: report
                        })
                    }));
                };
            },
            modal = controller.call("modal");

        modal.title("Selecione o relatório que gostaria de baixar.");
        modal.subtitle("Faça o download do relatório que deseja.");
        modal.paragraph("Selecione o relatório que deseja para começar o download em CSV.");

        let list = modal.createForm().createList();
        for (let item of labels) {
            list.add("fa-cloud-download", `${item.label} - ${item.description}`).click(download(item.id));
        }

        modal.createActions().cancel();

    });

    controller.registerCall("accountOverview", function(callback, element, username, start, end, interval = "P1W", method = "append", closeable = false, contractType = null) {
        let ajaxQuery = {
            username: username,
            period: interval,
            dateStart: start || moment().subtract(2, 'months').startOf('week').format("DD/MM/YYYY"),
            dateEnd: end,
            contractType: contractType
        };
        controller.serverCommunication.call(controller.endpoint.accountOverview,
            controller.call("loader::ajax", controller.call("error::ajax", {
                cache: true,
                data: ajaxQuery,
                success: function(response) {
                    var dataset = controller.call("accountOverview::dataset", $("BPQL > body > node", response));
                    var report = controller.call("report",
                        "Relatório de Consumo",
                        "Visualize informações sobre o uso da API",
                        "Com o recurso de relatório você consegue identificar os padrões de consumo do usuário, " +
                        "identificando dias em que é mais ou menos intensivo. Pode ser utilizado também para geração " +
                        "de faturas para clientes que não possuem esse processo automatizado.",
                        closeable);
                    var canvas = report.canvas(800, 250);
                    (element || $(".app-content"))[method || "append"](report.element());
                    for (var i in dataset.datasets) {
                        report.label(dataset.datasets[i].label).css({
                            "background-color": dataset.datasets[i].strokeColor,
                            color: dataset.datasets[i].color.light() ? "#000" : "#fff"
                        });
                    }

                    report.action("fa-cloud-download", () => {
                        controller.call("accountOverview::download", ajaxQuery, dataset.datasets);
                    });

                    report.action("fa-filter", () => {
                        controller.call("accountOverview::filter", username, report, callback, closeable);
                    });
                    callback(report);

                    var showInterval = setInterval(() => {
                        if (!document.contains(canvas) || !$(canvas).is(':visible')) {
                            return;
                        }
                        clearInterval(showInterval);
                        new ChartJS(canvas.getContext("2d")).Line(dataset);
                    }, 200);
                }
            })));
    });

    controller.registerTrigger("serverCommunication::websocket::authentication", "accountOverview", function(data, cb) {
        cb();
        if ((data.adminOf && data.adminOf.length) || data.contrato[4] === 'free') {
            return;
        }

        controller.unregisterTrigger("serverCommunication::websocket::authentication", "accountOverview");
        controller.call("accountOverview", (graph) => {
            graph.gamification("levelUp");
        });
    });

};
