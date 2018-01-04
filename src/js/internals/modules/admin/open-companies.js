const MAX_RESULTS = 10;
import _ from 'underscore';

module.exports = controller => {
    controller.registerCall('admin::openCompanys', (report, data = {}) => {
        var skip = 0;
        var results = controller.call('moreResults', MAX_RESULTS).callback(callback => {
            controller.serverCommunication.call('SELECT FROM \'BIPBOPCOMPANYS\'.\'LIST\'',
                controller.call('loader::ajax', controller.call('error::ajax', {
                    data: $.extend({
                        limit: MAX_RESULTS,
                        skip: skip
                    }, data),
                    success: response => {
                        callback(_.map($('BPQL > body > company', response), company => {
                            return controller.call('admin::viewCompany', company, false, null, true);
                        }));
                    }
                })));
            skip += MAX_RESULTS;
        }).appendTo(report.element()).show((i, items) => {
            if (!i)
                controller.call('alert', {
                    title: 'Infelizmente não há nenhuma empresa para exibir. ;(',
                    subtitle: 'Experimente adicionar alguma empresa pois não há nenhuma cadastrada para exibição.',
                    paragraph: 'Você precisa cadastrar uma empresa para utilizar este recurso, verifique na sua página de usuário,' +
                        ' pelo botão de <a href="javascript:harlan.call(\'admin::createCompany\');\'>Criar Conta</strong>'
                });
        });
    });
};
