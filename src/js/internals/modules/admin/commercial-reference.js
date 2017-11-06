import {
    Harmonizer
} from "color-harmony";
import ChartJS from "chart.js";
import _ from 'underscore';
import Color from "color";


module.exports = controller => {

    let harmonizer = new Harmonizer();

    controller.registerCall("admin::tagsViewer", (data = {}) => {
        controller.server.call("SELECT FROM 'BIPBOPCOMPANYSREPORT'.'TAGS'", {
            dataType: 'json',
            data: data,
            success: dataset => {
                if (!dataset.length) return;
                var report = controller.call("report",
                        "Cadastro de Tags em Usuários",
                        "Lista das tags cadastradas nos usuários.", null, true),
                    colors = harmonizer.harmonize("#cdfd9f", [...Array(dataset.length).keys()].map(i => i * 10)),
                    colorsHightlight = harmonizer.harmonize("#c0fc86", [...Array(dataset.length).keys()].map(i => i * 10));

                controller.trigger("admin::tagsViewer", report);
                report.paragraph("Através do gráfico ao lado pode se ver as tags comerciais mais utilizadas em sua aplicação. O usuário ou o administador podem editar as tags através dos dados cadastrais.");
                $(".app-content").append(report.element());

                report.newContent();

                var groupData = _.values(_.groupBy(dataset, function(obj) {
                    return obj._id || null;
                }));

                var reduceData = _.sortBy(_.map(groupData, group => {
                    return _.reduce(group, (a, b) => {
                        return {
                            _id: a._id,
                            total: a.total + b.total,
                        };
                    });
                }), 'total');

                var charData = _.map(reduceData, (opt, i) => {
                    return {
                        tag: opt._id,
                        label: opt._id || "Não preenchido",
                        value: opt.total,
                        color: colors[i],
                        highlight: colorsHightlight[i]
                    };
                });
                var reducedDataset = reduceDataset(charData),
                    canvas = report.canvas(250, 250),
                    interval = setInterval(() => {
                        if (document.contains(canvas) && $(canvas).is(":visible")) {
                            clearInterval(interval);
                            new ChartJS(canvas.getContext("2d")).Doughnut(reducedDataset);
                        }
                    }, 1000);
                charData.forEach((opt, i) => {
                    if (!opt.tag) {
                        return;
                    }
                    report.label(`${opt.label} : ${numeral(opt.value).format('0,0')}`).css({
                        "background-color": colors[i],
                        "color": new Color(colors[i]).light() ? "#000" : "#fff",
                        'cursor': 'pointer'
                    }).click(e => {
                        e.preventDefault();
                        controller.call("admin::openCompanys", report, {
                            tag: opt.tag
                        });
                    });
                });
            }
        });
    });


    controller.registerCall("admin::commercialReference", (data = {}) => {
        controller.server.call(controller.endpoint.commercialReferenceOverview, {
            dataType: 'json',
            data: data,
            success: dataset => {
                var report = controller.call("report",
                        "Referências Comerciais",
                        "Lista das referências comerciais.", null, true),
                    colors = harmonizer.harmonize("#cdfd9f", [...Array(dataset.length).keys()].map(i => i * 10)),
                    colorsHightlight = harmonizer.harmonize("#c0fc86", [...Array(dataset.length).keys()].map(i => i * 10));

                controller.trigger("admin::commercialReference", report);
                report.paragraph("Através do gráfico ao lado pode se ver quem são as maiores referências comerciais para sua aplicação. O usuário ou o administador podem editar a referência comercial através dos dados cadastrais.");
                $(".app-content").append(report.element());

                report.newContent();

                var groupData = _.values(_.groupBy(dataset, function(obj) {
                    return obj._id || null;
                }));

                var reduceData = _.sortBy(_.map(groupData, group => {
                    return _.reduce(group, (a, b) => {
                        return {
                            _id: a._id,
                            total: a.total + b.total,
                        };
                    });
                }), 'total');

                var charData = _.map(reduceData, (opt, i) => {
                    return {
                        commercialReference: opt._id,
                        label: opt._id || "Não preenchido",
                        value: opt.total,
                        color: colors[i],
                        highlight: colorsHightlight[i]
                    };
                });
                var reducedDataset = reduceDataset(charData),
                    canvas = report.canvas(250, 250),
                    interval = setInterval(() => {
                        if (document.contains(canvas) && $(canvas).is(":visible")) {
                            clearInterval(interval);
                            new ChartJS(canvas.getContext("2d")).Doughnut(reducedDataset);
                        }
                    }, 1000);
                charData.forEach((opt, i) => {
                    if (!opt.commercialReference) {
                        return;
                    }
                    report.label(`${opt.label} : ${numeral(opt.value).format('0,0')}`).css({
                        "background-color": colors[i],
                        "color": new Color(colors[i]).light() ? "#000" : "#fff",
                        'cursor': 'pointer'
                    }).click(e => {
                        e.preventDefault();
                        controller.call("admin::openCompanys", report, {
                            commercialReference: opt.commercialReference
                        });
                    });
                });
            }
        });
    });

    /**
     * Agrupa resultados com menos de 5% evitando problemas no gráfico
     * @param {array} data
     * @returns {array}
     */
    var reduceDataset = (dataArgument) => {
        let data = jQuery.extend(true, {}, dataArgument);
        var sum = _.reduce(data, (a, b) => {
            return {
                value: a.value + b.value
            };
        });

        sum = sum && sum.value ? sum.value : 0;

        var idx = 1;

        return _.map(_.values(_.groupBy(data, item => {
            if (item.value < sum * 0.05) {
                return 0;
            }
            return idx++;
        })), value => {
            return _.reduce(value, (a, b) => {
                a.value += b.value;
                a.color = "#93A7D8";
                a.highlight = new Color("#93A7D8").lighten(0.1).hsl().string();
                a.label = "Outros";
                return a;
            });
        });

    };
};
