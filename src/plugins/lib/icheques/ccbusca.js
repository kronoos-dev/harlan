import {CPF} from 'cpf_cnpj';
import {CNPJ} from 'cpf_cnpj';

module.exports = controller => {

    controller.registerTrigger('mainSearch::submit', 'ccbusca', (val, cb) => {
        cb();
        if (!CNPJ.isValid(val) && !CPF.isValid(val)) {
            return;
        }

        controller.server.call('SELECT FROM \'ICHEQUES\'.\'IPAYTHEBILL\'', controller.call('loader::ajax', {
            dataType: 'json',
            success: data => {
                if (data) {
                    controller.call('credits::has', 1500, () => {
                        controller.call('ccbusca', val);
                    });
                } else {
                    controller.call('ccbusca', val);
                }
            }
        }));
    });

};
