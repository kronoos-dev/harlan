import async from 'async';
import execall from 'execall';
import TraitParser from '../trait';

export default class Serasa extends TraitParser {
    searchSerasa() {
        this.serverCall('SELECT FROM \'PROTESTOS\'.\'REFIN\'', this.loader('fa-bank', `Acessando Serasa para a o documento ${this.cpf_cnpj}.`, {
            dataType: 'json',
            data: {
                documento: this.cpf_cnpj.replace(/[^0-9]/g, '')
            },
            bipbopError: (type, message, code, push, xml) => !push && this.errorHappen('Indisponibilidade de conexão com a fonte de dados - Serasa (REFIN/PEFIN)'),
            success: data => {
                if (!data.spc) {
                    toastr.warning('A consulta ao Serasa/SPC não está habilitada.', 'Entre em contato ou tente novamente mais tarde.');
                    return;
                }
                for (let spc of data.spc) {
                    let kelement = this.kronoosElement(null, 'Consulta ao SPC/Serasa',
                        'Apontamentos e Restrições Financeiras e Comerciais',
                        'Pendências e restrições financeiras nos bureaus de crédito Serasa e SPC');
                    kelement.captionTable('Anotação Negativa', 'Associado', 'Valor')(spc.NomeAssociado, spc.Valor);
                    kelement.table('Data da Inclusão', 'Data do Vencimento')(spc.DataDeInclusao, spc.DataDoVencimento);
                    kelement.table('Entidade', 'Número do Contrato', 'Comprador, Fiador ou Avalista')(spc.Entidade, spc.NumeroContrato, spc.CompradorFiadorAvalista);
                    kelement.table('Telefone Associado', 'Cidade Associado', 'UF Associado')(spc.TelefoneAssociado, spc.CidadeAssociado, spc.UfAssociado);
                    kelement.behaviourAccurate(true);
                    this.append(kelement.element());
                }

                if (data.consultaRealizada.length) {
                    let kelement = this.kronoosElement(null, 'Consulta Realizada por Associado do SPC/Serasa',
                        'Consulta Realizada por Associado do SPC/Serasa',
                        'Um associado do SPC/Serasa consultou este CNPJ/CPF a procura de apontamentos e restrições financeiras e comerciais');

                    for (let consultaRealizada of data.consultaRealizada) {
                        kelement.captionTable('Consulta Realizada', 'Nome Associado', 'CPF/CNPJ')(consultaRealizada.NomeAssociado, consultaRealizada.CpfCnpj);
                        kelement.table('Data da Consulta', 'Cidade Associado', 'UF Associado')(consultaRealizada.DataDaConsulta, consultaRealizada.CidadeAssociado, consultaRealizada.UfAssociado);
                    }

                    this.append(kelement.element());
                }
            }
        }));
    }
}
