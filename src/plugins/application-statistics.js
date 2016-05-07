/* global harlan, numeral */

(function (controller) {

    var moreInformation = function (node, result) {
        return function (e) {
            e.preventDefault();

            var name = $(node).find("_id > name").text();

            result.addSeparator("Estatísticas para a Fonte " + name.toUpperCase(),
                    "Latência e disponibilidade",
                    "Informações do Teste de Integração");
            result.addItem("Latência", numeral(parseInt($(node).find("averageResponseTime").text(), 10) / 1000).format("0") + " segs").addClass("center");
            result.addItem("Latência Máxima", numeral(parseInt($(node).find("maxResponseTime").text(), 10) / 1000).format("0") + " segs").addClass("center");

        };
    };

    var parserConsultas = function (document) {
        var result = harlan.call("result");
        var graph = [];

        var jdocument = $(document);
        jdocument.find("result > node").each(function (idx, node) {

            var name = $(node).find("_id > name").text();
            var total = parseInt($(node).find("count").text(), 10);
            var numSuccess = parseInt($(node).find("numSuccess").text());
            var perc = Math.round(numSuccess / total) * 100;
            var radial = harlan.widgets.radialProject(result.addItem(name, "").addClass("center").find(".value"), perc);
            var datum = {
                key: name,
                values: []
            };

            $(node).find("results > node").each(function (idx, result) {
                var jresult = $(result);
                datum.values.push([
                    parseInt(jresult.find("date").text().match(/\d+$/)[0], 10),
                    parseInt(jresult.find("responseTime").text(), 10)]);
            });

            if (perc < 70) {
                radial.element.addClass("warning");
            } else if (perc < 95) {
                radial.element.addClass("attention");
            }

            radial.element.click(moreInformation(node, result));
            graph.push(datum);
        });

        return result.generate();
    };

    harlan.importXMLDocument.register("STATISTICS", "APPLICATION", parserConsultas);

    applicationStatistics();

})(harlan);
