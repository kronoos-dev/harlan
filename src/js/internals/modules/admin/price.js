import _ from 'underscore';
import sprintf from 'sprintf';
import {
    CPF,
    CNPJ
} from 'cpf_cnpj';
import Promise from 'bluebird';

const LIMIT_RESULTS = 10;

module.exports = controller => {

    function drawList(list, d, skip, {next, back}, text, pagination, observation) {
        let data = d;

        if (text) {
            data = data.filter(x => (x.name, text) > 0.85);
        }

        observation.text(`Foram localizados ${numeral(data.length).format('000.000.000.000.000,00')} resultados.`);
        pagination.text(`Página ${(skip / LIMIT_RESULTS) + 1} de  ${(data.length / LIMIT_RESULTS) + 1}.`);

        const b = data.slice(skip, skip + LIMIT_RESULTS).click();

        list.empty();
        for (const item of b) {
            list.add('fa-item', [item.name, numeral(item.price/1000.).format('$ 0,0.000'), item.key]).click(controller.call('price::update'));
        }

        back[skip <= 0 ? 'hide' :  'show']();
        next[skip + LIMIT_RESULTS >= data.length ? 'hide' :  'show']();

        return data;
    }

    const formDescription = {
        title: 'Configuração de Preços',
        subtitle: 'Preencha os campos abaixo para configurar um preço no sistema.',
        paragraph: 'Os preços configurados entram em operação imediatamente.',
        gamification: 'star',
        screens: [{
            magicLabel: true,

            fields: [
                [{
                    name: 'name',
                    type: 'text',
                    placeholder: 'Nome da Bilhetagem',
                    labelText: 'Nome da Bilhetagem',
                    optional: false
                }, {
                    name: 'key',
                    type: 'text',
                    placeholder: 'chave.de.bilhetagem',
                    labelText: 'Chave de Bilhetagem',
                    optional: false
                }],
                {
                    name: 'description',
                    type: 'textarea',
                    placeholder: 'Descrição da Consulta (Markdown)',
                    optional: false,
                    labelText: 'Descrição'
                },
                [{
                    name: 'persist',
                    optional: false,
                    type: 'select',
                    placeholder: 'Estado',
                    list: {
                        '': 'Sem intervalo',
                        d: 'Diária',
                        m: 'Semanal',
                        w: 'Mensal',
                        y: 'Anual',
                    }
                }, {
                    name: 'price',
                    type: 'text',
                    placeholder: 'Valor (R$)',
                    labelText: 'Valor (R$)',
                    mask: '000.000.000.000.000,000',
                    maskOptions: {
                        reverse: true
                    },
                    numeral: true
                }],
                [{
                    name: 'username',
                    type: 'text',
                    placeholder: 'Usuário (opcional)',
                    optional: true,
                    labelText: 'Usuário'
                }, {
                    name: 'priceTable',
                    type: 'text',
                    placeholder: 'Grupo de Preço (opcional)',
                    labelText: 'Grupo de Preço (opcional)',
                    optional: true
                }],
            ]
        }]
    };

    const register = data => controller.server.call('INSERT INTO \'PRICETABLE\'.\'PRODUCT\'', controller.call('error::ajax', {
        dataType: 'json',
        data
    }));

    controller.registerCall('price::create', () => controller.promise('form::callback', formDescription).then(register).then(data => controller.call('alert', {
        icon: 'moneyBag',
        title: `Cobrança adicionada com sucesso para ${data.name} - <small>${data.key}</small>.`,
        subtitle: 'O preço foi configurado e passar a surtir efeito desde já.',
    })));

    controller.registerCall('price::update', (c) => {
        Promise.resolve(controller.call('form', d => d))
            .tap(form => form.setValues(c))
            .tap(form => form.configure(formDescription));
    });

    controller.registerCall('price::list', () => controller.serverCommunication.call('SELECT FROM \'PRICETABLE\'.\'PRODUCTS\'',
        controller.call('error::ajax', { dataType: 'json' })).then(data => {
        const modal = controller.call('modal');
        modal.title('Gestão de Preços');
        modal.subtitle('Crie e Modifique Preços');
        modal.addParagraph('A gestão de preços permite você administrar todos os preços registrados no sistema.');

        const form = modal.createForm();

        const search = form.addInput('price', 'text', 'Preço que você procura');
        const list = form.createList();

        let skip = 0;
        let text = null;

        const actions = modal.createActions();
        actions.cancel();
        actions.add('Criar Preço').click(controller.click('price::create'));

        const results = actions.observation();
        const observation = actions.observation();

        const pageActions = {
            next: actions.add('Próxima Página').click(() => {
                skip += LIMIT_RESULTS;
                drawList(modal, list, data, skip, pageActions, text);
            }).hide(),

            back: actions.add('Página Anterior').click(() => {
                skip -= LIMIT_RESULTS;
                drawList(modal, list, data, skip, pageActions, text);
            }).hide()
        };

        controller.call('instantSearch', search, (query, autocomplete, callback) => {
            text = query;
            skip = 0;
            drawList(modal, list, data, skip, pageActions, text);
        });

        drawList(modal, list, data, skip, pageActions, text);
    }));

};
