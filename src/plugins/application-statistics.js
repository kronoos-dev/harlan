import _ from 'underscore';

harlan.addPlugin(controller => {

    const moreInformation = (node, result) => e => {
        e.preventDefault();

        const name = $('_id > name', node).text();

        result.addSeparator(`Estatísticas para a Fonte ${name.toUpperCase()}`,
            'Latência e disponibilidade',
            'Informações do Teste de Integração');
        result.addItem('Latência', `${numeral(parseInt($('averageResponseTime', node).text(), 10) / 1000).format('0')} segs`).addClass('center');
        result.addItem('Latência Máxima', `${numeral(parseInt($('maxResponseTime', node).text(), 10) / 1000).format('0')} segs`).addClass('center');

    };

    const parserConsultas = document => {
        let result = controller.call('result');
        let graph = [];

        _.each(_.sortBy(_.sortBy($('result > node', document).map((idx, node) => {
            let numSuccess = parseInt($('numSuccess', node).text());
            let total = parseInt($('count', node).text(), 10);

            return {
                name: $('_id > name', node).text(),
                total,
                numSuccess,
                perc: Math.round((numSuccess / total) * 10000) / 100,
                node
            };
        }), 'name'), 'perc'), ({name, perc, node}) => {
            const item = result.addItem(name, '');
            const radial = controller.interface.widgets.radialProject(item.addClass('center').find('.value'), perc);

            item.find('.name').css({
                'max-width': '128px',
                'max-height': '20px',
                overflow: 'hidden'
            });

            const datum = {
                key: name,
                values: []
            };

            $('results > node', node).each((idx, result) => {
                datum.values.push([
                    parseInt($('date', result).text().match(/\d+$/)[0], 10),
                    parseInt($('responseTime', result).text(), 10)
                ]);
            });

            if (perc < 70) {
                radial.element.addClass('warning');
            } else if (perc < 95) {
                radial.element.addClass('attention');
            }

            radial.element.click(moreInformation(node, result));
            graph.push(datum);
        });

        return result.element();
    };

    controller.importXMLDocument.register('STATISTICS', 'APPLICATION', parserConsultas);
});
