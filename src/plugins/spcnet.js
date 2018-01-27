var APP_TITLE = 'Consulta de Protestos',
    SCPC_PATH = 'BPQL > body > scpc',
    _ = require('underscore');

var reduce = function (array) {
    var i = 0;
    for (var idx in array) {
        i += array[idx];
    }
    return i;
};

harlan.addPlugin(controller => {

    controller.registerCall('spcnet::proshield::generate', function (state, scpcNode) {
        var value = state.result.addSeparator('Consulta de Protestos',
            'Verificação de Processos em Bureaus de Crédito').addClass('external-source waiting');

        var protests = reduce(Array.from(scpcNode.find('quantidade-total').map(function (idx, v) {
            return parseInt($(v).text());
        }))) || 0;

        var debt = reduce(Array.from(scpcNode.find('valor').map(function (idx, v) {
            return parseFloat($(v).text().replace(/,/, '.'));
        }))) || 0;

        var creditors = _.uniq(scpcNode.find('nome-associado').map(function (idx, v) {
            return $(v).text();
        }));

        var score = Math.max(creditors.length * 0.2, protests * 0.3, debt / 500);

        score = 1 - (score > 1 ? 1 : score);

        value.removeClass('waiting');
        var resultsDisplay = value.find('.results-display');

        if (score > 0.8) {
            resultsDisplay.text('Sem pendências significativas.');
            value.addClass('success');
        } else if (score > 0.6) {
            resultsDisplay.text('Foram encontradas pendências.');
            value.addClass('warning');
        } else {
            resultsDisplay.text('Foram encontradas muitas pendências.');
            value.addClass('error');
        }

        if (protests) {
            state.result.addItem('Quantidade', protests).addClass('center');
        }

        if (debt) {
            state.result.addItem('Dívida', numeral(debt).format('R$0,0.00')).addClass('center');
        }

        if (creditors.length) {
            state.result.addItem('Devedores', creditors.join(', ')).addClass('center');
        }

        if (protests && debt) {
            state.result.addItem('Média', numeral(debt / protests).format('$0,0.00')).addClass('center');
        }

        state.observer.valuate.juridic.push(score, 0.2);
        state.observer.valuate.finance.push(score, 0.9);
        state.observer.valuate.security.push(score, 0.35);
    });

    controller.registerTrigger('proshield::search', 'spcnet::proshield::search', function (state, callback) {
        controller.serverCommunication.call('SELECT FROM \'SPCNET\'.\'CONSULTA\'', {
            /* Consulta o SPC, veja como é simples seu ignorante. ;) */
            data: {
                documento: state.data.documento
            },
            success: function (ret) {
                state.irql.spcnet = ret;
                state.sync(function () {
                    controller.call('spcnet::proshield::generate', state, $(ret).find(SCPC_PATH));
                });
            }, completed: function () {
                callback();
            }
        });
    });

});
