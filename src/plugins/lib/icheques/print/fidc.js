module.exports = `Cadastro para Prospecção
===========================

Informações do cliente para respectivo conhecimento.
----------------------------------------------------

Campo | Valor
-------|--------|
Nome | {{ name }}
Documento | {{ document }}
Endereço | {{ endereco }}, {{ numero }} {{ complemento }} - {{ cidade }}, {{ estado }} - {{ zipcode }}
Email | {{ email }}
Telefone | {{ phone }}
Responsável | {{ name }}
Faturamento | {{ revenue }}
Ramo de Atividade | {{ activityBranch }}
Prazo Médio de Venda (dias) | {{ mediumTermSale }}
Liquidez dos Cheques (%) | {{ checkLiquidity }}
Pré-Faturamento (R$) | {{ preBilling }}
Quantos dias? | {{ preBillingDays }}
Total de Funcionários | {{ numberEmployees }}
Total da Folha de Pagto (R$) | {{ totalPayroll }}
Imóvel | {{ ownProperty }}
Valor da Locação (R$)  | {{ locationValue }}
Quanto Antecipa ao Mês (R$) | {{ monthCheckAmmount }}
Cheques concentrados ou pulverizados? | {{ bulk }}
Valor Médio do Cheque (R$) | {{ avgCheckAmmount }}
Transportadora | {{ ownSend }}

Muito obrigado e bons negócios,  	
Equipe iCheques.`;
