/* global toastr, moment, ammount */
import fileReaderStream from 'filereader-stream';

import {CPF} from 'cpf_cnpj';
import {CNPJ} from 'cpf_cnpj';
const TEST_BAN_EXTENSION = /\.(rem|ban)$/i;
import concat from 'concat-stream';

import { CMC7Validator } from './cmc7-validator';

module.exports = controller => {

    const getFile = inputFile => {
        const files = inputFile.get(0).files;
        if (!files.length) {
            throw 'Selecione um arquivo!';
        }

        const file = files.item(0);
        if (!TEST_BAN_EXTENSION.test(file.name)) {
            throw 'A extensão recebida do arquivo não confere!';
        }
        return file;
    };

    controller.registerCall('icheques::fidc', () => {

        const modal = controller.call('modal');

        modal.title('iCheques');
        modal.subtitle('Safekeeping para Carteiras de Cheque');
        modal.addParagraph('Para realizar a verificação de cheques em tempo real será necessário que você selecione o arquivo abaixo.');

        const form = modal.createForm();
        const inputFile = form.addInput('fidc-file', 'file', 'Selecionar arquivo.', {}, 'Arquivo de Fundo FIDC');

        form.addSubmit('submit', 'Enviar').click(e => {
            e.preventDefault();
            try {
                controller.call('icheques::fidc::enter', getFile(inputFile));
                modal.close();
            } catch (exception) {
                toastr.warning(exception);
                inputFile.addClass('error');
            }
        });

        form.cancelButton();

    });

    controller.registerCall('icheques::fidc::enter', file => {
        fileReaderStream(file).pipe(concat(buffer => {
            const lines = buffer.toString().split('\r\n');
            readExtension[TEST_BAN_EXTENSION.exec(file.name)[1].toLowerCase()](lines, file.name);
        }));
    });

    const readBan = (lines, fileName) => {
        const storage = [];
        let runCount = 0;
        for (let key = 1; key < lines.length - 2; key++) {
            if (lines[key][0] == 'E') {
                continue;
            }
            if (++runCount % 2 !== 0) {
                continue;
            }

            const expire = moment(lines[key - 1].substring(249, 249 + 6), 'DDMMYY');

            const data = {
                expire: (expire.isValid() ? expire : moment().add(5, 'months')).format('YYYYMMDD'),
                cmc: lines[key].substring(34, 34 + 32).trim().replace(/[^\d]/g, ''),
                observation: fileName
            };

            const document = lines[key - 1].substring(17, 17 + 14).trim();

            if (!data.cmc || !new CMC7Validator(data.cmc).isValid()) {
                runCount--;
                continue;
            }
            data[CPF.isValid(document) ? 'cpf' : 'cnpj'] = document;
            storage.push(data);
        }
        controller.call('icheques::checkout', storage);
    };

    const alertRem = (lines, fileName) => {
        controller.confirm({
            title: 'A extensão é TXT mas será tratada como REM.',
            subtitle: 'Se o arquivo não for REM esta ação pode ocasionar problemas na inserção.',
            paragraph: 'Se não tiver certeza do que está fazendo verifique o arquivo e tente novamente mais tarde.'
        }, () => {
            readRem(lines, fileName);
        });
    };

    var readRem = (lines, fileName) => {
        const storage = [];
        for (let key = 1; key < lines.length - 2; key++) {
            const expire = moment(lines[key].substring(120, 120 + 6), 'DDMMYY');
            const data = {
                cmc: lines[key].substring(351, 351 + 30),
                expire: (expire.isValid() ? expire : moment().add(5, 'months')).format('YYYYMMDD'),
                ammount: parseInt(lines[key].substring(180, 192).replace(/^0+/, ''), 10),
                observation: fileName
            };

            const document = lines[key].substring(220, 220 + 14);

            if (CPF.isValid(document.substring(3))) {
                data.cpf = document.substring(3);
            } else {
                data.cnpj = document;
            }

            storage.push(data);
        }

        controller.call('icheques::checkout', storage);
    };

    var readExtension = {
        ban: readBan,
        rem: readRem,
        txt: alertRem
    };

};
