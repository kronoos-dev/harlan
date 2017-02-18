import _ from 'underscore';
import ChartJS from 'chart.js';
import harmony from 'color-harmony';
import Color from 'color';
import queue from 'async/queue';
import qs from 'qs';
import randomMC from 'random-material-color';

const MAX_RESULTS = 5;

(function(controller) {
    let harmonizer = new harmony.Harmonizer(),
        colorMix = "neutral",
        colors = {
            error: harmonizer.harmonize("#ff1a53", colorMix),
            warning: harmonizer.harmonize("#ffe500", colorMix),
            success: harmonizer.harmonize("#00ff6b", colorMix)
        };

    /**
     * Agrupa resultados com menos de 5% evitando problemas no gráfico
     * @param {array} data
     * @returns {array}
     */
    var reduceDataset = (dataArgument, reduceDatasetPerc = 0.5, method = 'average') => {
        let data = jQuery.extend(true, {}, dataArgument);
        var sum = _.reduce(data, (a, b) => {
            return {
                value: a.value + b.value
            };
        });

        sum = sum && sum.value ? sum.value : 0;

        var idx = 1,
            qtd = 1;

        return _.map(_.values(_.groupBy(data, (item) => {
            if (item.value < sum * reduceDatasetPerc) {
                qtd++;
                return 0;
            }
            return idx++;
        })), (value) => {
            return _.reduce(value, (a, b) => {
                if (method == 'sum') {
                    a.value += b.value;
                } else {
                    a.value += (b.value / qtd);
                }
                a.color = "#93A7D8";
                a.highlight = new Color("#93A7D8").lighten(0.1).hslString();
                a.label = "Outros";
                return a;
            });
        });

    };

    let generateReport = (data, subtitle, title, paragraph, variable = 'averageSuccessResourceUse', reduceDatasetPerc = 0.05, method = "average") => {

        var report = controller.call("report", title, subtitle, paragraph);
        report.newContent();

        let dataset = _.sortBy(_.map(data, (element, key) => {
            let trys = Math.round(element.value[variable]);
            let color = new Color(randomMC.getColor({text: `${element._id.database}.${element._id.table}`})),
                label = `${element._id.database}.${element._id.table}`;

            return {
                value: Math.floor(element.value[variable] * 100) / 100,
                color: color.hslString(),
                trys: trys,
                label: label,
                highlight: color.lighten(0.1).hslString(),
                colorInstance: color,
                element: element
            };
        }), 'trys');
        dataset = reduceDataset(dataset, reduceDatasetPerc, method);
        let canvas = report.canvas(250, 250);
        new ChartJS(canvas.getContext("2d")).Doughnut(dataset);

        for (let item of dataset) {
            report.label(`${item.label}: ${item.value}`).css({
                'background-color': item.color,
                'color': item.colorInstance.light() ? '#000' : '#fff',
            });
        }

        $('.app-content').append(report.element());
    };

    /* @TODO Ajustar os nomes de parágrafos */

    controller.serverCommunication.call("SELECT FROM 'PUSH'.'RESOURCEUSEQA'", {
        dataType: "json",
        success: (data) => {
            generateReport(data, "Consumo por Consulta de Sucesso", "Uso de Recursos Especiais",
                "O relatório de Push fornece uma estatística de qualidade e detalhada para que as " +
                "manutenções possam ser orientadas com maior precisão em relação aos problemas. Para " +
                "obter maiores informações clique sobre a etiqueta logo abaixo do gráfico.");
            generateReport(data, "Consumo por Consulta", "Uso de Recursos Especiais",
                "O relatório de Push fornece uma estatística de qualidade e detalhada para que as " +
                "manutenções possam ser orientadas com maior precisão em relação aos problemas. Para " +
                "obter maiores informações clique sobre a etiqueta logo abaixo do gráfico.", "averageResourceUse", 0.01);
            generateReport(data, "Consumo por Consulta na Última Execução", "Uso de Recursos Especiais",
                "O relatório de Push fornece uma estatística de qualidade e detalhada para que as " +
                "manutenções possam ser orientadas com maior precisão em relação aos problemas. Para " +
                "obter maiores informações clique sobre a etiqueta logo abaixo do gráfico.", "lastAverageResourceUse", 0.01);
            generateReport(data, "Consumo da Última Execução", "Uso de Recursos Especiais",
                "O relatório de Push fornece uma estatística de qualidade e detalhada para que as " +
                "manutenções possam ser orientadas com maior precisão em relação aos problemas. Para " +
                "obter maiores informações clique sobre a etiqueta logo abaixo do gráfico.", "lastResourceUse", 0.05, "sum");
        }
    });


})(harlan);
