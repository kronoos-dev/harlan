/* global controller. numeral */
import _ from 'underscore';

(function(controller) {

    var moreInformation = function(node, result) {
        return function(e) {
            e.preventDefault();

            var name = $("_id > name", node).text();

            result.addSeparator("Estatísticas para a Fonte " + name.toUpperCase(),
                "Latência e disponibilidade",
                "Informações do Teste de Integração");
            result.addItem("Latência", numeral(parseInt($("averageResponseTime", node).text(), 10) / 1000).format("0") + " segs").addClass("center");
            result.addItem("Latência Máxima", numeral(parseInt($("maxResponseTime", node).text(), 10) / 1000).format("0") + " segs").addClass("center");

        };
    };

    var parserConsultas = function(document) {
        let result = controller.call("result"),
            graph = [];

        _.each(_.sortBy(_.sortBy($("result > node", document).map((idx, node) => {
            let numSuccess = parseInt($("numSuccess", node).text()),
                total = parseInt($("count", node).text(), 10);

            return {
                name: $("_id > name", node).text(),
                total: total,
                numSuccess: numSuccess,
                perc: Math.round((numSuccess / total) * 10000) / 100,
                node: node
            };
        }), 'name'), 'perc'), (a) => {

            var item = result.addItem(a.name, ""),
                radial = controller.interface.widgets.radialProject(item.addClass("center").find(".value"), a.perc);

            item.find(".name").css({
                'max-width': '128px',
                'max-height': '20px',
                'overflow': 'hidden'
            });

            var datum = {
                key: a.name,
                values: []
            };

            $("results > node", a.node).each(function(idx, result) {
                datum.values.push([
                    parseInt($("date", result).text().match(/\d+$/)[0], 10),
                    parseInt($("responseTime", result).text(), 10)
                ]);
            });

            if (a.perc < 70) {
                radial.element.addClass("warning");
            } else if (a.perc < 95) {
                radial.element.addClass("attention");
            }

            radial.element.click(moreInformation(a.node, result));
            graph.push(datum);
        });

        return result.element();
    };

    controller.importXMLDocument.register("STATISTICS", "APPLICATION", parserConsultas);

    applicationStatistics();

})(harlan);
