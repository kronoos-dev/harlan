import {
    Harmonizer
} from "color-harmony";
import ChartJS from "chart.js";
import _ from 'underscore';

module.exports = (controller) => {

    let harmonizer = new Harmonizer();
    controller.registerCall("admin::commercialReference", () => {
        controller.server.call(controller.endpoint.commercialReferenceOverview, {
            dataType: 'json',
            success: (dataset) => {
                var report = controller.call("report",
                        "Referências Comerciais",
                        "Lista das referências comerciais.", null, false),
                    colors = harmonizer.harmonize("#cdfd9f", [...Array(dataset.length).keys()].map((i) => i * 3)),
                    colorsHightlight = harmonizer.harmonize("#c0fc86", [...Array(dataset.length).keys()].map((i) => i * 3));
                report.paragraph("Através do gráfico ao lado pode se ver quem são as maiores referências comerciais para sua aplicação. O usuário ou o administador podem editar a referência comercial através dos dados cadastrais.");
                report.button("Ok! Entendi.", () => {
                    report.close();
                });
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
                        }
                    });
                }), 'total');

                var charData = _.map(reduceData, (opt, i) => {
                    return {
                        label: opt._id || null,
                        value: opt.total,
                        color: colors[i],
                        highlight: colorsHightlight[i]
                    };
                });

                new ChartJS(report.canvas(250, 250).getContext("2d")).Doughnut(charData);
            }
        });
    });
};
