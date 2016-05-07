/* global controller. numeral */

(function(controller) {

    var moreInformation = function(node, result) {
        return function(e) {
            e.preventDefault();

            var name = $(node).find("_id > name").text();

            result.addSeparator("Estatísticas para a Fonte " + name.toUpperCase(),
                "Latência e disponibilidade",
                "Informações do Teste de Integração");
            result.addItem("Latência", numeral(parseInt($(node).find("averageResponseTime").text(), 10) / 1000).format("0") + " segs").addClass("center");
            result.addItem("Latência Máxima", numeral(parseInt($(node).find("maxResponseTime").text(), 10) / 1000).format("0") + " segs").addClass("center");

        };
    };

    var parserConsultas = function(document) {
        var result = controller.call("result");
        var graph = [];

        var jdocument = $(document);
        jdocument.find("result > node").each(function(idx, node) {

            var name = $(node).find("_id > name").text(),
                total = parseInt($(node).find("count").text(), 10),
                numSuccess = parseInt($(node).find("numSuccess").text()),
                perc = Math.round(numSuccess / total) * 100,
                item = result.addItem(name, ""),
                radial = controller.interface.widgets.radialProject(item.addClass("center").find(".value"), perc);

            item.find(".name").css({
                'max-width': '128px',
                'max-height': '20px',
                'overflow': 'hidden'
            });

            var datum = {
                key: name,
                values: []
            };

            $(node).find("results > node").each(function(idx, result) {
                var jresult = $(result);
                datum.values.push([
                    parseInt(jresult.find("date").text().match(/\d+$/)[0], 10),
                    parseInt(jresult.find("responseTime").text(), 10)
                ]);
            });

            if (perc < 70) {
                radial.element.addClass("warning");
            } else if (perc < 95) {
                radial.element.addClass("attention");
            }

            radial.element.click(moreInformation(node, result));
            graph.push(datum);
        });

        return result.element();
    };

    controller.importXMLDocument.register("STATISTICS", "APPLICATION", parserConsultas);

    applicationStatistics();

})(harlan);
