module.exports = controller => {

    const parserPlacas = document => {
        const jdocument = $(document);

        const result = controller.call('result');

        const init = 'BPQL > body > ';
        const nodes = {
            Modelo: 'modelo',
            Marca: 'marca',
            Cor: 'cor',
            Ano: 'ano',
            'Ano Modelo': 'anoModelo',
            Placa: 'placa',
            Data: 'data',
            Estado: 'uf',
            Cidade: 'municipio',
            Situação: 'situacao'
        };

        for (const idx in nodes) {
            result.addItem(idx, jdocument.find(init + nodes[idx]).text(), nodes[idx]);
        }

        return result.element();
    };

    controller.registerBootstrap('parserPlacas', callback => {
        callback();
        controller.importXMLDocument.register('PLACA', 'CONSULTA', parserPlacas);
    });
};