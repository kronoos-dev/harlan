import async from 'async';
import execall from 'execall';
import TraitParser from '../../trait';

const NON_NUMBER = /[^\d]/g;

export default class Certidao extends TraitParser {
    searchCertidaoPDF(arr) {

        let defaultList = [
            ['trf3', 'SELECT FROM \'CERTIDOES\'.\'TRF03\'', 'TRF03', 'Tribunal Regional Federal 3º Região', null],
            ['trf3-ms', 'SELECT FROM \'CERTIDOES\'.\'TRF03\' WHERE \'ABRANGENCIA\' = \'3\'', 'TRF03', 'Justiça Federal de Primeiro Grau em Mato Grosso do Sul', null],
            ['trf3-sp', 'SELECT FROM \'CERTIDOES\'.\'TRF03\' WHERE \'ABRANGENCIA\' = \'2\'', 'TRF03', 'Justiça Federal de Primeiro Grau em São Paulo ', null],
            ['trt15', 'SELECT FROM \'CERTIDOES\'.\'TRT15\'', 'TRT15', 'Tribunal Regional do Trabalho da 15º Região ', str => !/não\s+existe\s+ação/i.test(str)],
            ['trt02', 'SELECT FROM \'CERTIDOES\'.\'TRT02\'', 'TRT02', 'Tribunal Regional do Trabalho da 2º Região', str => !/NÃO CONSTA/i.test(str)]
        ];

        if (this.cnpj) {
            defaultList.push(['trt03', 'SELECT FROM \'CERTIDOES\'.\'CONSULTATRT03\'', 'TRT03', 'Tribunal Regional do Trabalho da 3º Região', str => !/CERTID[ãÃA]O\s+NEGATIVA/i.test(str)]);
        }

        async.each(arr || defaultList, (data, cb) => {
            let [fname, query, , database, test] = data;
            if (!test) {
                test = str => /,\s*CONSTA,/i.test(str);
            }
            this.serverCall(query, this.loader('fa-balance-scale', `Capturando certidões no ${database} - ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj,
                    nome: this.name
                },
                bipbopError: (type, message, code, push) => {
                    if (!push) {
                        this.errorHappenQuery(query, `Indisponibilidade de conexão com a fonte de dados para a certidão - ${database}`, 'não foi possível emitir a certidão no momento');
                        return;
                    }

                },
                complete: () => cb(),
                success: data => {
                    var str = $('body > text', data).text();
                    if (!test(str)) {
                        this.notFoundJuridic(database);
                        return;
                    }

                    let kelement = this.kronoosElement(null, `Certidão do ${database}`,
                        `Certidão do ${database}`, `Visualização da Certidão no ${database}`);

                    kelement.element().find('.kronoos-side-content').append($('<a />').attr({
                        href: `data:application/octet-stream;base64,${$('body > pdf', data).text()}`,
                        target: '_blank',
                        download: `certidao-${fname}-${this.cpf_cnpj.replace(NON_NUMBER, '')}.pdf`
                    }).append($('<img />').addClass('certidao').attr({
                        src: `data:image/png;base64,${$('body > png', data).text()}`
                    })));

                    execall(/\d{7}(\-)?\d{2}(\.)?\d{4}(\.)?\d(\.)?\d{2}(\.)?\d{4}/g, str).map(r => {
                        let proc = r.match;kelement.beha;
                        this.serverCall('SELECT FROM \'KRONOOSJURISTEK\'.\'DATA\'', this.loader('fa-balance-scale', `Verificando processo ${r.match} para documento ${this.cpf_cnpj}`, {
                            data: {
                                data: `SELECT FROM 'CNJ'.'PROCESSO' WHERE 'PROCESSO' = '${r.match}'`
                            },
                            success: data => this.juristekCNJ(data, null, true, false, false),
                            error: data => this.errorHappen(`Indisponibilidade de conexão com a fonte de dados - ${database} - processo ${r.match}.`)
                        }));
                    });

                    kelement.behaviourAccurate(true);
                    this.append(kelement.element());
                }
            }));

        }, () => {});
    }

}
