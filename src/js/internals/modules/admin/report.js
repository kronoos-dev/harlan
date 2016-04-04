var _ = require("underscore"),
    Color = require("color"),
    randomColor = require("randomcolor"),
    ChartJS = require("chart.js");

module.exports = function(controller) {

    var colorPattern = {
        "querys": Color("#ff6a33"),
        "push": Color("#33ff6a"),
        "pushRemoved": Color("#ffd033"),
        "pushCreated": Color("#33c8ff"),
    };

    controller.registerCall("admin::report::dataset", function(responses) {
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
                        fillColor = color.clone().clearer(0.7);

                    datasets[id] = {
                        color: color,
                        fillColor: fillColor.rgbaString(),
                        strokeColor: color.rgbString(),
                        pointColor: color.rgbString(),
                        pointStrokeColor: color.light() ? "#fff" : "#000",
                        pointHighlightFill: color.light() ? "#fff" : "#000",
                        pointHighlightStroke: color.rgbString(),
                        label: reader.children("name").text(),
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

    controller.registerCall("admin::report::filter", (username, report, callback, closeable = false) => {
        var modal = controller.call("modal");
        modal.title("Filtros do Relatório");
        modal.subtitle("Modifique o Relatório");
        modal.paragraph("Defina abaixo as características que deseja que sejam usadas para a geração \
                         do relatório de consumo.");

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
            controller.call("admin::report", callback, report.element(),
                username,
                /^\d{2}\/\d{2}\/\d{4}$/.test(dateStart.val()) ? dateStart.val() : null,
                /^\d{2}\/\d{2}\/\d{4}$/.test(dateEnd.val()) ? dateEnd.val() : null,
                period.val(), "replaceWith", closeable);
        });
        form.addSubmit("submit", "Filtrar");
        modal.createActions().cancel();
    });

    controller.registerCall("admin::report", function(callback, element, username, start, end, interval = "P1W", method = "append", closeable = false) {
        controller.serverCommunication.call("SELECT FROM 'BIPBOPCOMPANYSREPORT'.'REPORT'",
            controller.call("loader::ajax", controller.call("error::ajax", {
                cache: true,
                data: {
                    username: username,
                    period: interval,
                    dateStart: start || moment().subtract(2, 'months').startOf('week').format("DD/MM/YYYY"),
                    dateEnd: end
                },
                success: function(response) {
                    var dataset = controller.call("admin::report::dataset", $("BPQL > body > node", response));
                    var report = controller.call("report",
                        "Relatório de Consumo",
                        "Visualize informações sobre o uso da API",
                        "Com o recurso de relatório você consegue identificar os padrões de consumo do usuário, \
                     identificando dias em que é mais ou menos intensivo. Pode ser utilizado também para geração \
                     de faturas para clientes que não possuem esse processo automatizado.",
                        closeable);
                    var canvas = report.canvas(800, 250);
                    element[method || "append"](report.element());
                    for (var i in dataset.datasets) {
                        report.label(dataset.datasets[i].label).css({
                            "background-color": dataset.datasets[i].strokeColor,
                            color: dataset.datasets[i].color.light() ? "#000" : "#fff"
                        })
                    }
                    report.action("fa-filter", () => {
                        controller.call("admin::report::filter", username, report, callback, closeable);
                    })
                    new ChartJS(canvas.getContext("2d")).Line(dataset);
                    callback(report);
                }
            })));
    });
};
