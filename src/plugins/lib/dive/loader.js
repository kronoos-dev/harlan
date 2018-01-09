import VMasker from 'vanilla-masker';
import {CPF, CNPJ} from 'cpf_cnpj';
import sprintf from 'sprintf';

/* global module, moment, require, toastr */
const TEST_EXTENSION = /\.csv$/;
const masks = ['999.999.999-99', '99.999.999/9999-99'];

module.exports = (controller, config) => {

    const getFile = inputFile => {
        const files = inputFile.get(0).files;
        if (!files.length) {
            throw 'Selecione um arquivo!';
        }

        const file = files.item(0);
        if (!TEST_EXTENSION.test(file.name)) {
            throw 'A extensão do arquivo deve ser CSV (comma-separated values)';
        }
        return file;
    };

    controller.registerCall('dive::load', inputFile => {
        const file = getFile(inputFile);
        const modal = controller.call('modal');

        modal.title('Carregando Arquivo');
        modal.subtitle('Os resultados estão sendo processados');
        modal.addParagraph('Os registros estão sendo carregados na API, esta operação pode levar alguns minutos. Para arquivos muito grandes pode levar até algumas horas, deixe esta página aberta até o fim do carregamento.');

        const progress = modal.addProgress();

        /* can't call it directly, CORS and WebWorkers */
        $.get('/js/dive-worker.js', data => {
            const worker = new Worker(window.URL.createObjectURL(new Blob([data], {
                type: 'text/javascript'
            })));
            worker.onmessage = message => {
                if (!message.data) {
                    worker.terminate();
                    modal.close();
                    return;
                }

                if (message.data.method === 'error') {
                    toastr.warning('Um dos seus registros não pode ser processado, verifique o CPF e data de nascimento antes de carregar novamente.',
                        sprintf('O documento %s não pode ser carregado.', message.data.data.record[0]));
                } else if (message.data.method === 'progress') {
                    progress(message.data.data);
                }
            };
            worker.postMessage({
                file,
                apiKey: controller.serverCommunication.apiKey()
            });
        });
    });

    controller.registerCall('dive::new', () => {
        const modal = controller.call('modal');
        modal.gamification('harlan');
        modal.title('Acompanhamento Cadastral e Análise de Crédito');
        modal.subtitle('Monitore de perto, e em tempo real, as ações de pessoas físicas e jurídicas.');
        modal.addParagraph('Este recurso é um poderoso módulo que integra soluções em acompanhamento cadastral e análise de crédito em uma só ferramenta, de maneira simples e eficaz. Com ele, você pode monitorar de perto, e em tempo real, as ações de pessoas físicas e jurídicas de seu interesse. Acompanhe cada passo de pessoas e empresas e esteja sempre à frente.');
        const form = modal.createForm();
        const inputDocument = form.addInput('text', 'text', 'CPF/CNPJ de Acompanhamento').magicLabel();

        const // acceptTerms = form.addCheckbox("terms", "Eu concordo com os <a href='#'>termos de uso</a> e <a href='#'>confidencialidade</a>."),
            mask = () => {
                let v = inputDocument.val();
                inputDocument.val(VMasker.toPattern(v, masks[v.length > 14 ? 1 : 0]));
            };

        inputDocument.on('paste', () => {
            inputDocument.val('');
        });

        inputDocument.on('focus', () => {
            inputDocument.val('');
        });

        inputDocument.on('keydown', mask);

        form.addSubmit('submit', 'Acompanhar').click(e => {
            e.preventDefault();
            // if (!acceptTerms[1].is(':checked')) {
            //     toastr.warning("Você precisa aceitar os termos de uso e confidencialidade para poder continuar.",
            //         "Você não aceitou os termos para continuar.");
            //     return;
            // }
            let document = inputDocument.val();

            if (!(CPF.isValid(document) || CNPJ.isValid(document))) {
                toastr.warning('Você precisa inserir um documento CPF/CNPJ válido.',
                    'O CPF/CNPJ informado não é válido para continuar.');
                return;
            }

            document = (CPF.isValid(document) ? CPF : CNPJ).format(document);

            controller.serverCommunication.call('INSERT INTO \'DIVE\'.\'ENTITY\'', controller.call('error::ajax', {
                dataType: 'json',
                data: {documento: document},
                success: data => toastr.success(`O cadastro de ${document} foi enviado com sucesso.`, 'O sistema já acompanha o documento e análisa o crédito neste instante.')
            }));
            modal.close();
        });

        const actions = modal.createActions();
        actions.cancel();

        actions.add('Importar').click(e => {
            e.preventDefault();
            controller.call('dive::new::file');
            modal.close();
        });
    });

    controller.registerCall('dive::new::file', () => {
        const modal = controller.call('modal');
        modal.gamification('harlan');
        modal.title('Acompanhamento Cadastral e Análise de Crédito');
        modal.subtitle('Monitore de perto, e em tempo real, as ações de pessoas físicas e jurídicas.');
        modal.addParagraph('Este recurso é um poderoso módulo que integra soluções em acompanhamento cadastral e análise de crédito em uma só ferramenta, de maneira simples e eficaz. Com ele, você pode monitorar de perto, e em tempo real, as ações de pessoas físicas e jurídicas de seu interesse. Acompanhe cada passo de pessoas e empresas e esteja sempre à frente.');

        const form = modal.createForm();
        // acceptTerms = form.addCheckbox("terms", "Eu concordo com os <a href='#'>termos de uso</a> e <a href='#'>confidencialidade</a>.");

        const inputFile = form.addInput('file', 'file', 'Carteira de Acompanhamento').magicLabel();

        form.addSubmit('submit', 'Acompanhar').click(e => {
            e.preventDefault();
            // if (!acceptTerms[1].is(':checked')) {
            //     toastr.warning("Você precisa aceitar os termos de uso e confidencialidade para poder continuar.",
            //         "Você não aceitou os termos para continuar.");
            //     return;
            // }

            try {
                controller.call('dive::load', inputFile);
                modal.close();
            } catch (exception) {
                toastr.warning(exception);
            }
        });

        const actions = modal.createActions();
        actions.cancel();

        actions.add('Avulso').click(e => {
            e.preventDefault();
            controller.call('dive::new');
            modal.close();
        });
    });

};
