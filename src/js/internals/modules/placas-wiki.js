module.exports = controller => {

    controller.registerTrigger('findDatabase::instantSearch', 'placasWiki::instantSearch', (args, callback) => {
        callback();

        const placa = args[0];
        const autocomplete = args[1];

        if (/^[A-Z]{3}\-?[0-9]{4}$/i.test(placa)) {

            autocomplete.item('Placas.Wiki',
                'Consulta a Placa de Veículo',
                'Para encontrar, comentar e avaliar motoristas', null, null, true).addClass('database').click(() => {
                controller.call('iframeEmbed::open', [`https://placas.wiki.br?p=${placa}`]);
            });

        }
    });
};