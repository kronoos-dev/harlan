/* global module, require, numeral */

import {Harmonizer} from 'color-harmony';

import Color from 'color';
import hashObject from 'hash-object';
import sprintf from 'sprintf';
import _ from 'underscore';
import ChartJS from 'chart.js';
import changeCase from 'change-case';

const harmonizer = new Harmonizer();
const colorMix = 'neutral';

const colors = {
    error: harmonizer.harmonize('#ff1a53', colorMix),
    warning: harmonizer.harmonize('#ffe500', colorMix),
    success: harmonizer.harmonize('#00ff6b', colorMix)
};

const harmonyColors = harmonizer.harmonize('#27c891', 'sixToneCCW')
    .concat(harmonizer.harmonize('#ff9400', 'sixToneCCW'))
    .concat(harmonizer.harmonize('#c48bc8', 'sixToneCCW'));

const rfbStatus = {
    regular: 'success',
    ativa: 'success',
    pendente: 'warning',
    suspensa: 'warning',
    baixada: 'warning',
    cancelada: 'error',
    nula: 'error'
};

module.exports = controller => {

    const items = [];

    const closeItems = () => {
        let item;
        while ((item = items.shift())) {
            item.close();
        }
    };

    /**
     * Agrupa resultados com menos de 5% evitando problemas no gráfico
     * @param {array} data
     * @returns {array}
     */
    const reduceDataset = data => {

        let sum = _.reduce(data, (a, b) => {
            return {
                value: a.value + b.value
            };
        });

        sum = sum && sum.value ? sum.value : 0;

        let idx = 1;

        return _.map(_.values(_.groupBy(data, ({value}) => {
            if (value < sum * 0.05) {
                return 0;
            }
            return idx++;
        })), value => _.reduce(value, (a, b) => {
            a.value += b.value;
            a.color = '#93A7D8';
            a.highlight = new Color('#93A7D8').lighten(0.1).hsl().string();
            a.label = 'Outros';
            return a;
        }));
    };

    controller.registerTrigger('authentication::authenticated::end', 'dive::smartReport', () => {
        closeItems();

        controller.registerCall('dive::report::rfb', () => {
            const rfbColors = {
                success: 0,
                warning: 0,
                error: 0
            };
            controller.call('dive::smartReport::doughnut::show',
                'dive::report::rfb',
                'SELECT FROM \'DIVE\'.\'SpecialReportRFB\'',
                'Situação dos Documentos',
                'Situação dos CPF/CNPJs na Receita Federal.',
                require('../../markdown/dive/receita-federal.md.js'),
                node => {
                    const statusIdx = $('_id', node).text().split(' ')[0].toLowerCase();
                    const color = colors[rfbStatus[statusIdx]][rfbColors[rfbStatus[statusIdx]]++];
                    return new Color(color);
                });
        });

        controller.registerCall('dive::report::riscoReport', () => {
            let i = 0;
            controller.call('dive::smartReport::doughnut::show',
                'dive::report::riscoReport',
                'SELECT FROM \'DIVE\'.\'RiscoReport\'',
                'Risco de Crédito',
                'Risco de crédito dos CPF/CNPJs acompanhados.',
                require('../../markdown/dive/riscocredito.md.js'),
                node => new Color(harmonyColors[i++]));
        });

        controller.registerCall('dive::report::protestos', () => {
            let i = 0;
            controller.call('dive::smartReport::doughnut::show',
                'dive::report::protestos',
                'SELECT FROM \'DIVE\'.\'PROTESTOS\'',
                'Protestos em Cartório',
                'Protestos em cartório dos CPF/CNPJs acompanhados.',
                require('../../markdown/dive/protestos.md.js'),
                node => new Color(harmonyColors[i++]));
        });

        controller.registerCall('dive::report::ccf', () => {
            let i = 0;
            controller.call('dive::smartReport::doughnut::show',
                'dive::report::ccf',
                'SELECT FROM \'DIVE\'.\'CCF\'',
                'Cheque sem Fundo',
                'Cheques sem fundo dos CPF/CNPJs acompanhados.',
                require('../../markdown/dive/ccf.md.js'),
                node => new Color(harmonyColors[i++]));
        });

        controller.call('dive::report::ccf');
        controller.call('dive::report::protestos');
        controller.call('dive::report::rfb');
        controller.call('dive::report::riscoReport');

        // var i = 0;
        // controller.call("dive::smartReport::doughnut::show",
        //         "SELECT FROM 'DIVE'.'SPECIALREPORTINCOMETAX'",
        //         "Restituição do Imposto de Renda",
        //         "Exercício do Ano Corrente",
        //         require("../../markdown/dive/restituicao.md"),
        //         () => new Color(harmonyColors[i++]));
        //
        //
        //
        // i = 0;
        // controller.call("dive::smartReport::doughnut::show",
        //         "SELECT FROM 'DIVE'.'SPECIALREPORTINCOMETAX' WHERE 'LASTYEAR' = 'TRUE'",
        //         "Restituição do Imposto de Renda",
        //         "Exercício do Ano Anterior",
        //         require("../../markdown/dive/restituicao.md"),
        //         () => new Color(harmonyColors[i++]));
        //
        // controller.call("dive::smartReport::polar::show",
        //         "SELECT FROM 'DIVE'.'SpecialReportCBusca'",
        //         "Quantidade Média de Registros",
        //         "Situação dos CPF/CNPJs no bureau de crédito Dive.",
        //         require("../../markdown/dive/bureau-dive.md"),
        //         {
        //             avgTotalAddress: "Endereços",
        //             avgTotalCar: "Carros",
        //             avgTotalPhone: "Telefones",
        //             avgTotalEmail: "Emails",
        //             avgTotalCompany: "Empresas"
        //         }, {});
    });

    controller.registerCall('dive::smartReport::doughnut::show', (callback, endpoint, title, subtitle, markdown, nodeColor) => {
        controller.serverCommunication.call(endpoint, {
            success: ret => {
                controller.call('dive::smartReport::doughnut',
                    callback,
                    title,
                    subtitle,
                    markdown,
                    ret,
                    nodeColor);
            }
        });
    });

    controller.registerCall('dive::smartReport::polar::show', (endpoint, title, subtitle, markdown, inputs, labels) => {
        controller.serverCommunication.call(endpoint, {

            success: ret => {
                controller.call('dive::smartReport::polar',
                    title,
                    subtitle,
                    markdown,
                    ret,
                    inputs,
                    labels);
            }
        });
    });

    controller.registerCall('dive::smartReport::polar', (title, subtitle, markdown, ret, inputs, labels) => {
        if (!$('BPQL > body > reduce > result', ret).children().length) {
            return;
        }

        let report = controller.call('report', title, subtitle, null, false);
        let paragraph = report.paragraph().html(markdown);
        let canvas = report.canvas(330, 330);

        $('.app-content').append(report.element());

        let dataset = [];
        let i = 0;
        for (let name in inputs) {
            let element = $(name, ret);
            let status = changeCase.titleCase(inputs[name]);
            let total = parseFloat(element.text().replace(',', '.') || '0');
            let colorInstance = new Color(harmonyColors[i++]);

            dataset.push({
                value: Math.round(total * 10000) / 100,
                color: colorInstance.hsl().string(),
                highlight: colorInstance.lighten(0.1).hsl().string(),
                label: status
            });

            report.label(sprintf('%s: %s', status, numeral(total || 0).format('0,0.000'))).css({
                'background-color': colorInstance.hsl().string(),
                color: colorInstance.light() ? '#000' : '#fff'
            }).insertAfter(paragraph);
        }

        for (let name in labels) {
            let cStatus = changeCase.titleCase(labels[name].replace(/[^0-9a-z\s]/i, ''));
            let cTotal = parseFloat($(name, ret).text().replace(',', '.') || '0');
            let cColorInstance = new Color(harmonyColors[i++]);
            report.label(sprintf('%s: %s', cStatus, numeral(cTotal).format('0,0.000'))).css({
                'background-color': cColorInstance.hsl().string(),
                color: cColorInstance.light() ? '#000' : '#fff'
            }).insertAfter(paragraph);

        }

        report.gamification('lives');
        new ChartJS(canvas.getContext('2d')).PolarArea(dataset);
    });

    controller.registerCall('dive::smartReport::doughnut', (caller, title, subtitle, markdown, ret, nodeColor) => {

        if (!$('BPQL > body > reduce > result', ret).children().length) {
            return;
        }

        const report = controller.call('report',
            title,
            subtitle);

        report.paragraph().html(markdown);
        report.newAction('fa-refresh', () => {
            report.close();
            controller.call(caller);
        }, 'Atualizar');
        report.newContent();

        const canvas = report.canvas(250, 250);
        $('.app-content').append(report.element());

        const dataset = [];
        $('BPQL > body result > node', ret).each((idx, node) => {
            const status = changeCase.titleCase($('_id', node).text());
            const total = parseInt($('total', node).text());
            const colorInstance = nodeColor(node);

            if (!status) return;

            dataset.push({
                value: total,
                color: colorInstance.hsl().string(),
                highlight: colorInstance.lighten(0.1).hsl().string(),
                label: status
            });

            report.label(sprintf('%s: %d', status, total)).css({
                'background-color': colorInstance.hsl().string(),
                color: colorInstance.light() ? '#000' : '#fff',
                cursor: 'pointer'
            }).click(e => {
                e.preventDefault();

                const r = controller.call('report',
                    'Acompanhamento Cadastral e Análise de Crédito',
                    'Monitore de perto, e em tempo real, as ações de pessoas físicas e jurídicas.',
                    'Com essa ferramenta, informe-se em tempo real de todas as atividades de pessoas físicas e jurídicas de seu interesse. Saiba de tudo o que acontece e tenha avaliações de crédito imediatas, de forma contínua e precisa.');

                let watchEntityTimeline = r.timeline(controller);

                controller.server.call('SELECT FROM \'DIVE\'.\'ENTITYS\'', {
                    dataType: 'json',
                    data: {
                        entity: $('elements > node', node).map((i, e) => $(e).text()).toArray().join(',')
                    },
                    success: ret => {
                        for (let entity of _.values(ret.items)) {
                            controller.call('dive::entity::timeline', watchEntityTimeline, entity);
                        }
                    }
                });

                r.gamification('dive');
                r.element().insertAfter(report.element());
                $(window).scrollTop(r.element().offset().top);

            });
        });

        let interval = setInterval(() => {
            if (!report.element().is(':visible')) return;
            new ChartJS(canvas.getContext('2d')).Doughnut(reduceDataset(dataset));
            clearInterval(interval);
        }, 300);
    });

};
