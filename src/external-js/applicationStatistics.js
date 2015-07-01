/* global harlan, numeral */
(function () {
    var moreInformation = function (jnode, result) {
        return function (e) {
            e.preventDefault();

            var name = jnode.find("_id > name").text();

            result.addSeparator("Estatísticas para a Fonte " + name.toUpperCase(),
                    "Latência e disponibilidade",
                    "Informações do Teste de Integração");
            result.addItem("Latência", numeral(parseInt(jnode.find("averageResponseTime").text(), 10) / 1000).format("0")).addClass("center");
            result.addItem("Latência Máxima", numeral(parseInt(jnode.find("maxResponseTime").text(), 10) / 1000).format("0")).addClass("center");

        };
    };

    var parserConsultas = function (document) {
        var result = harlan.call("generateResult");
        var graph = [];

        var jdocument = $(document);
        jdocument.find("result > node").each(function (idx, node) {

            var jnode = $(node);
            var name = jnode.find("_id > name").text();
            var total = parseInt(jnode.find("count").text(), 10);
            var numSuccess = parseInt(jnode.find("numSuccess").text());
            var perc = Math.round(numSuccess / total) * 100;
            var radial = harlan.widgets.radialProject(result.addItem(name, "").addClass("center").find(".value"), perc);
            var datum = {
                key: name,
                values: []
            };

            jnode.find("results > node").each(function (idx, result) {
                var jresult = $(result);
                datum.values.push([
                    parseInt(jresult.find("date").text().match(/\d+$/)[0], 10),
                    parseInt(jresult.find("responseTime").text(), 10)]);
            });

            if (perc < 70) {
                radial.addClass("warning");
            } else if (perc < 95) {
                radial.addClass("attention");
            }

            radial.click(moreInformation(jnode, result));
            graph.push(datum);
        });

        console.log(graph);
        return result.generate();
    };

    harlan.importXMLDocument.register("STATISTICS", "APPLICATION", parserConsultas);

    applicationStatistics();
})();