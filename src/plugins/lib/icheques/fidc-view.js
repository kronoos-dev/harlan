import { paramCase } from 'change-case';
import { CPF } from 'cpf_cnpj';
import { CNPJ } from 'cpf_cnpj';

module.exports = function(controller) {
    controller.registerCall('icheques::fidc::company::view', function(lastData) {
        var form = controller.call('form', () => {});
        form.configure({
            'title': 'Cadastro Prospecção',
            'subtitle': 'Resumo Cadastral',
            'paragraph': 'Seguem as informações do cliente para seu respectivo conhecimento.',
            'gamification': 'book',
            'disabled': true,
            'readOnly': true,
            'magicLabel': true,
            'screens': [{
                'fields': [
                    [{
                        'name': 'company-name',
                        'optional': false,
                        'type': 'text',
                        'placeholder': 'Nome da Empresa ou Próprio',
                    }, {
                        'maskOptions': {
                            onKeyPress: (input, e, field, options) => {
                                var masks = ['000.000.000-009', '00.000.000/0000-00'],
                                    mask = (input.length > 14) ? masks[1] : masks[0];
                                field.mask(mask, options);
                            }
                        },
                        'name': 'document',
                        'placeholder': 'CPF ou CNPJ de faturamento',
                        'optional': false,
                    }],
                    [{
                        'name': 'endereco',
                        'optional': false,
                        'type': 'text',
                        'placeholder': 'Endereço',
                    }, {
                        'name': 'zipcode',
                        'type': 'text',
                        'placeholder': 'CEP',
                        'optional': false,
                        'labelText': 'CEP',
                        'mask': '00000-000'
                    }],
                    [{
                        'name': 'numero',
                        'optional': false,
                        'type': 'text',
                        'numeral': true,
                        'placeholder': 'Número'
                    }, {
                        'name': 'complemento',
                        'type': 'text',
                        'optional': true,
                        'placeholder': 'Complemento'
                    }],
                    [{
                        'name': 'cidade',
                        'optional': false,
                        'type': 'text',
                        'placeholder': 'Cidade'
                    }, {
                        'name': 'estado',
                        'optional': false,
                        'type': 'select',
                        'placeholder': 'Estado',
                        'list': {
                            '': 'Escolha um estado',
                            'AC': 'Acre',
                            'AL': 'Alagoas',
                            'AM': 'Amazonas',
                            'AP': 'Amapá',
                            'BA': 'Bahia',
                            'CE': 'Ceará',
                            'DF': 'Distrito Federal',
                            'ES': 'Espírito Santo',
                            'GO': 'Goiás',
                            'MA': 'Maranhão',
                            'MT': 'Mato Grosso',
                            'MS': 'Mato Grosso do Sul',
                            'MG': 'Minas Gerais',
                            'PA': 'Pará',
                            'PB': 'Paraíba',
                            'PR': 'Paraná',
                            'PE': 'Pernambuco',
                            'PI': 'Piauí',
                            'RJ': 'Rio de Janeiro',
                            'RN': 'Rio Grande do Norte',
                            'RO': 'Rondônia',
                            'RS': 'Rio Grande do Sul',
                            'RR': 'Roraima',
                            'SC': 'Santa Catarina',
                            'SE': 'Sergipe',
                            'SP': 'São Paulo',
                            'TO': 'Tocantins'
                        }
                    }],
                    [{
                        'name': 'email',
                        'optional': false,
                        'type': 'text',
                        'placeholder': 'Endereço de E-mail do Financeiro',
                    }]
                ]
            }, {
                'fields': [{
                    'name': 'name',
                    'type': 'text',
                    'placeholder': 'Nome do Responsável',
                    'labelText': 'Nome do Responsável'
                }, {
                    'name': 'email',
                    'type': 'text',
                    'placeholder': 'E-mail do Responsável',
                    'labelText': 'E-mail do Responsável'
                }, {
                    'name': 'phone',
                    'type': 'text',
                    'placeholder': 'Telefone do Responsável',
                    'labelText': 'Telefone do Responsável',
                    'mask': '(00) 0000-00009'
                }]
            }, {
                'fields': [[{
                    'name': 'revenue',
                    'type': 'text',
                    'placeholder': 'Faturamento Mensal (R$)',
                    'labelText': 'Faturamento Mensal (R$)',
                    'mask': '000.000.000.000.000,00',
                    'maskOptions': {
                        'reverse': true
                    },
                    'numeral': true
                }, {
                    'name': 'activity-branch',
                    'type': 'text',
                    'placeholder': 'Ramo de Atividade',
                    'labelText': 'Ramo de Atividade',
                }],
                [{
                    'name': 'medium-term-sale',
                    'type': 'text',
                    'placeholder': 'Prazo Médio de Venda (dias)',
                    'labelText': 'Prazo Médio de Venda (dias)',
                    'hoverHelp' : 'Quantidade de dias, em média, para receber o total faturado.',
                    'mask': '999',
                    'numeral': true
                }, {
                    'name': 'check-liquidity',
                    'type': 'text',
                    'placeholder': 'Liquidez dos Cheques (%)',
                    'labelText': 'Liquidez dos Cheques (%)',
                    'hoverHelp' : 'Qual a porcentagem dos que cheques liquidam.',
                    'numeralFormat' : '0.00%',
                    'mask': '##0,99%',
                    'maskOptions': {
                        'reverse': true
                    },
                    'numeral': true
                }],
                [{
                    'name': 'pre-billing',
                    'type': 'text',
                    'placeholder': '* Pré-Faturamento (R$)',
                    'labelText': '* Pré-Faturamento (R$)',
                    'hoverHelp' : 'Emissão da NFe + Recebimento do valor antes da produção e entrega da mercadoria.',
                    'optional': true,
                    'mask': '000.000.000.000.000,00',
                    'maskOptions': {
                        'reverse': true
                    },
                    'numeral': true
                }, {
                    'name': 'pre-billing-days',
                    'type': 'text',
                    'placeholder': '* Quantos dias?',
                    'labelText': '* Quantos dias?',
                    'optional': true,
                    'mask': '999',
                    'numeral': true
                }]
                ]
            }, {
                'fields': [
                    [{
                        'name': 'number-employees',
                        'type': 'text',
                        'placeholder': 'Total de Funcionários',
                        'labelText': 'Total de Funcionários',
                        'mask': '000.000.000.000.000',
                        'maskOptions': {
                            'reverse': true
                        },
                        'numeral': true
                    }, {
                        'name': 'total-payroll',
                        'type': 'text',
                        'placeholder': 'Total da Folha de Pagto. (R$)',
                        'labelText': 'Total da Folha de Pagto. (R$)',
                        'numeral': true,
                        'mask': '000.000.000.000.000,00',
                        'maskOptions': {
                            'reverse': true
                        }
                    }], {
                        'name': 'own-property',
                        'type': 'select',
                        'labelText': 'Imóvel Próprio ou Alugado?',
                        'optional': false,
                        'list': ['Próprio', 'Alugado']
                    }, {
                        'name': 'location-value',
                        'type': 'text',
                        'placeholder': '* Valor da Locação (R$)',
                        'labelText': '* Valor da Locação (R$)',
                        'optional': true,
                        'numeral': true,
                        'mask': '000.000.000.000.000,00',
                        'maskOptions': {
                            'reverse': true
                        }
                    }
                ]
            }, {
                'magicLabel': true,
                'fields': [{
                    'name': 'month-check-ammount',
                    'type': 'text',
                    'placeholder': 'Quanto Antecipa ao Mês (R$)',
                    'numeral': true,
                    'optional': true,
                    'labelText': 'Quanto Antecipa ao Mês (R$)',
                    'mask': '000.000.000.000.000,00',
                    'maskOptions': {
                        'reverse': true
                    }
                }, {
                    'name': 'bulk',
                    'type': 'select',
                    'labelText': 'Cheques concentrados ou pulverizados?',
                    'optional': false,
                    'list': ['Concentrados', 'Pulverizados', 'Mistura de ambos']
                }, {
                    'name': 'avg-check-ammount',
                    'type': 'text',
                    'placeholder': 'Valor Médio do Cheque (R$)',
                    'labelText': 'Valor Médio do Cheque (R$)',
                    'numeral': true,
                    'optional': false,
                    'mask': '000.000.000.000.000,00',
                    'maskOptions': {
                        'reverse': true
                    }
                }, {
                    'name': 'own-send',
                    'type': 'select',
                    'labelText': 'Transportadora',
                    'optional': true,
                    'list': ['Não Possuo', 'Própria', 'Terceirizada', 'Própia e Terceirizada']
                }]
            }]
        });

        let data = Object.assign({}, lastData);
        for (let idx in data) {
            switch (idx) {
            case 'preBilling':
            case 'totalPayroll':
            case 'locationValue':
            case 'monthCheckAmmount':
            case 'avgCheckAmmount':
            case 'revenue':
                data[idx] *= 100;
                break;
            case 'document':
                data[idx] = CNPJ.isValid(data[idx]) ? CNPJ.format(data[idx]) : CPF.format(data[idx]);
                break;
            }
            form.setValue(paramCase(idx), data[idx]);
        }
    });
};
