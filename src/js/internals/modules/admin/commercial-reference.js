import {
    Harmonizer
} from "color-harmony";
import ChartJS from "chart.js";
import _ from 'underscore';
import Color from "color";


module.exports = (controller) => {

    let harmonizer = new Harmonizer();
    controller.registerCall("admin::commercialReference", () => {
        controller.server.call(controller.endpoint.commercialReferenceOverview, {
            dataType: 'json',
            success: (dataset) => {
                var report = controller.call("report",
                        "Referências Comerciais",
                        "Lista das referências comerciais.", null, true),
                    colors = harmonizer.harmonize("#cdfd9f", [...Array(dataset.length).keys()].map((i) => i * 3)),
                    colorsHightlight = harmonizer.harmonize("#c0fc86", [...Array(dataset.length).keys()].map((i) => i * 3));
                report.paragraph("Através do gráfico ao lado pode se ver quem são as maiores referências comerciais para sua aplicação. O usuário ou o administador podem editar a referência comercial através dos dados cadastrais.");
                $(".app-content").append(report.element());

                report.newContent();

                var groupData = _.values(_.groupBy(dataset, function(obj) {
                    return obj._id || null;
                }));

                var reduceData = _.sortBy(_.map(groupData, (group) => {
                    return _.reduce(group, (a, b) => {
                        return {
                            _id: a._id || "Sem Valor",
                            total: a.total + b.total,
                        };
                    });
                }), 'total');

                var charData = _.map(reduceData, (opt, i) => {
                    return {
                        commercialReference: opt._id,
                        label: opt._id || null,
                        value: opt.total,
                        color: colors[i],
                        highlight: colorsHightlight[i]
                    };
                });
                var canvas = report.canvas(250, 250),
                    interval = setInterval(() => {
                        if (document.contains(canvas) && $(canvas).is(":visible")) {
                            clearInterval(interval);
                            new ChartJS(canvas.getContext("2d")).Doughnut(reduceDataset(charData));
                        }
                    });
                charData.forEach((opt, i) => {
                    report.label(`${opt.label} : ${numeral(opt.value).format('0,0')}`).css({
                        "background-color": colors[i],
                        "color": new Color(colors[i]).light() ? "#000" : "#fff",
                        'text-transform': 'capitalize',
                        'cursor': 'pointer'
                    }).click((e) => {
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

        return _.map(_.values(_.groupBy(data, (item) => {
            if (item.value < sum * 0.05) {
                return 0;
            }
            return idx++;
        })), (value) => {
            return _.reduce(value, (a, b) => {
                a.value += b.value;
                a.color = "#93A7D8";
                a.highlight = new Color("#93A7D8").lighten(0.1).hslString();
                a.label = "Outros";
                return a;
            });
        });

    };
};
