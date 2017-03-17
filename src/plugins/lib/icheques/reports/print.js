'use strict';
module.exports = `Relatório da Conta
====================

Situação dos Cheques Cadastrados
--------------------------------

{{{ status }}}

Sacado | Número | Vencimento | Valor | Situação | CCF | Protestos
-------|--------| -----------|-------|----------|-----|-----------
{{#checks}}
{{ name }} | {{{ cmc }}} | {{ expire }} | {{ ammount }} | {{ status }} | {{ ccf }} | {{ protesto }}
{{/checks}}
TOTAL  |  |  | {{ soma }} |  |  |

Muito obrigado e bons negócios,
Equipe iCheques.`;
