module.exports = `Relatório da Conta
====================

Situação dos Cheques Cadastrados
--------------------------------

{{{ message }}}

Sacado | Número | Vencimento | Valor | Situação | CCF | Protestos
-------|--------| -----------|-------|----------|-----|-----------
{{#checks}}
{{ name }} | {{{ number }}} | {{ expire }} | {{ ammount }} | {{ status }} | {{ ccf }} | {{ protesto }}
{{/checks}}
TOTAL  |  |  | {{ soma }} |  |  |

Muito obrigado e bons negócios,
Equipe iCheques.`;
