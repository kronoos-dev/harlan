import { CPF, CNPJ } from 'cpf_cnpj';
import async from "async";
import _ from "underscore";
import pad from 'pad';
import bankCodes from "./bank-codes";
import VMasker from 'vanilla-masker';


// CEAF – Cadastro de Expulsões da Administração Federal - Controladoria Geral da União (CGU)
// CNEP – Cadastro Nacional de Empresas Punidas, com base na Lei Anticorrupção (Lei nº 12.846/2013) - Controladoria Geral da União (CGU)
// CEPIM – Entidades Privadas Sem Fins Lucrativos Impedidas de celebrar convênios, contratos de repasse ou termos de parceria com a Administração Pública Federal - Controladoria Geral da União (CGU)

const NON_NUMBER = /[^\d]/g;
const GET_PHOTO_OF = ['peps', 'congressmen', 'state_representatives'];
const NAMESPACE_DESCRIPTION = {
    'peps': ['Pessoa Políticamente Exposta', 'Art. 52 da Convenção das Nações Unidas contra a Corrupção'],
    'congressmen': ['Deputado Federal', 'Representante eleito para a Câmara dos Deputados'],
    'state_representatives': ['Deputado Estadual', 'Representante eleito para a Assembleia Legislativa Estadual'],
    'corruption_scandals': ['Escândalo de Corrupção', 'Fatos políticos marcantes chamados de escândalos'],
    'slave_work': ['Trabalho Escravo', 'Lista de Trabalho Escravo'],
    'green_peace': ['Apontamento Greenpeace', 'Organização não governamental de preservação do meio ambiente'],
    'ibama': ['Apontamento Ibama', 'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis'],
    'gas_station': ['Postos de Gasolina Cassados', 'Estão sujeitos à fiscalização postos de combustíveis, distribuidoras e transportadoras'],
    'interpol': ['Interpol', 'A Organização Internacional de Polícia Criminal'],
    'ceaf': ['Cadastro de Expulsões da Administração Federal', 'Banco de informações mantido pela Controladoria-Geral da União'],
    'ceispj': ['Pessoa Jurídica listada no Cadastro listada no Cadastro Nacional de Empresas Inidôneas e Suspensas', 'Banco de informações mantido pela Controladoria-Geral da União'],
    'ceispf': ['Pessoas Físicas listadas no Cadastro listada no Cadastro Nacional de Empresas Inidôneas e Suspensas', 'Banco de informações mantido pela Controladoria-Geral da União'],
    'bovespa': ['Apontamento em Empresa de Capital Aberto - Bovespa', 'Cargos em empresas e/ou participações em assembleias.'],
    'clear': ['Não Constam Apontamentos Cadastrais', 'Não há nenhum apontamento cadastral registrado no sistema Kronoos.'],
    'licitacoes': ['Participação em Licitações', 'Constam participações em licitações.'] /* OrigemComprador, Participante, Status, data, Tipo da Licitações */
};

export class KronoosParse {

    constructor(controller, name, cpf_cnpj, kronoosData,
            cbuscaData = null, jusSearch = null, procs = [], defaultType = "maximized", parameters = {}) {
        this.parameters = parameters;
        this.name = name;
        this.controller = controller;
        this.kelements = [];
        this.cpf_cnpjs = {};
        this.searchBar = $(".kronoos-application .search-bar");
        this.xhr = [];

        if (CPF.isValid(cpf_cnpj)) {
            this.cpf = this.cpf_cnpj = CPF.format(cpf_cnpj);
        } else if (CNPJ.isValid(cpf_cnpj)) {
            this.cnpj = this.cpf_cnpj = CNPJ.format(cpf_cnpj);
        } else {
            console.error("Verifique se no sistema é possível chegar um CPF / CNPJ inválido");
            this.cpf_cnpj = CNPJ.strip(cpf_cnpj);
        }

        this.appendElement = $("<div />").addClass("record");
        this.generateHeader(defaultType);

        $(".kronoos-result").append(this.appendElement);

        if (kronoosData) this.parseKronoos(kronoosData);
        if (procs) this.parseProcs(procs);
        this.emptyChecker();

        let m = moment();
        this.kelements[0].header(this.cpf_cnpj, name, m.format("DD/MM/YYYY"), m.format("H:mm:ss"));

        this.searchMandados();
        this.searchBovespa();
        if (this.cnpj) this.searchCertidao();
        this.searchCepim();
        this.searchExpulsoes();
        this.searchCnep();
        this.searchCeis();
        this.searchCCF();
        this.searchProtestos();

        if (!cbuscaData) {
            return;
        }

        this.showCBusca(cbuscaData);
        this.generateRelations = this.controller.call("generateRelations");
        this.generateRelations.appendDocument(cbuscaData, this.cpf_cnpj);
        this.cpf_cnpjs[this.cpf_cnpj] = true;
        this.graphTrack();
    }

    cbuscaMae(cbuscaData) {
        let row = {};
        let maeNode = $("nomemae", cbuscaData);
        if (maeNode.length && maeNode.text()) {
            row["Nome da Mãe"] = maeNode.text();
        }

        let dtNascimento = $("dtnascimento", cbuscaData);
        if (dtNascimento.length && dtNascimento.text()) {
            let dtNasc = moment(dtNascimento.text(), "YYYYMMDD").format("DD/MM/YYYY");
            if (this.cpf) this.searchCertidao(dtNasc, this.cpf);
            row[this.cpf ? "Data de Nascimento" : "Data de Abertura"] = dtNasc;
        }

        if (!_.keys(row).length) return;
        this.kelements[0].table(..._.keys(row))(..._.values(row));
    }

    cbuscaTelefone(cbuscaData) {
        let telefones = $("telefones telefone", cbuscaData);
        if (!telefones.length) return;

        let klist = this.kelements[0].list("Telefones");
        telefones.each(function () {
            klist(VMasker.toPattern($("ddd", this).text() +
                $("numero", this).text(), "(99) 9999-99999"));
        });
    }

    cbuscaEnderecos(cbuscaData) {
        let enderecos = $("enderecos endereco", cbuscaData);
        if (!enderecos.length) return;
        let klist = this.kelements[0].list("Endereço");
        enderecos.each(function () {
            let v = x => $(x, this).text();
            klist(`${v('tipo')} ${v('logradouro')}, ${v('numero').replace(/^0+/, '')} ${v('complemento')} - ${v('cep')}, ${v('bairro')}, ${v('cidade')} / ${v('estado')}`);
        });
    }

    showCBusca(cbuscaData) {
        this.cbuscaMae(cbuscaData);
        this.cbuscaTelefone(cbuscaData);
        this.cbuscaEnderecos(cbuscaData);
    }

    searchBovespa() {
        let [title, description] = NAMESPACE_DESCRIPTION.bovespa,
        kelement = this.controller.call("kronoos::element", title, "Existência de apontamentos cadastrais.", description);
    }

    searchProtestos() {
        this.xhr.push(this.controller.server.call("SELECT FROM 'IEPTB'.'WS'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Buscando por ocorrências de protestos para o documento ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj
                },
                success: (data) => {
            		_.each($("BPQL > body > consulta > conteudo > cartorio", data), (element) => {
                        let kelement = this.controller.call("kronoos::element", "Protestos em Cartórios",
                            "Detalhes a cerca de protestos realizados em cartório",
                            "Foram localizados protestos registrados em cartório.");
                        this.kelements.push(kelement);
                        kelement.table("Nome do Cartório", "Endereço")
                            ($("nome", element).text(), $("endereco", element).text());
                        kelement.table("Protestos", "Telefone", "Cidade")
                            ($("protestos", element).text(), $("telefone", element).text(), $("cidade", element).text());
            		});
                },
            }, true)));
    }

    searchCCF() {
        this.xhr.push(this.controller.server.call("SELECT FROM 'SEEKLOC'.'CCF'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Buscando por ocorrências de cheques sem fundo para o documento ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj
                },
                success: (data) => {
                    _.each($("data resposta list > *", data), (element) => {

                        let bankName = bankCodes[$("banco", element).text()] ||
                            bankCodes[$("banco", element).text().replace(/^0+/, '')];

                        let kelement = this.controller.call("kronoos::element", "Cheques sem Fundo em Instituição Bancária",
                            "Detalhes acerca de cheques sem fundo emitidos",
                            "Foram localizados cheques sem fundo em uma instituição bancária.");
                        this.kelements.push(kelement);

                        if (bankName)
                            result.addItem("Banco", bankName);

                        kelement.table("Código Bancário", "Agência")
                            ($("banco", element).text(), $("agencia", element).text());
                        kelement.table("Qtde. Ocorrências", "Alínea")($("qteOcorrencias", element).text(), $("motivo", element).text());

            			let v1 = moment($("dataUltOcorrencia", element).text(), "DD/MM/YYYY"),
            				v2 = moment($("ultimo", element).text(), "DD/MM/YYYY"),
                            e1 = v1.isAfter(v2) ? v2 : v1,
                            e2 = v1.isAfter(v2) ? v1 : v2;

                        let table = kelement.table(`Primeiro Registro (${e1.fromNow()})`,
                                       `Última Ocorrência (${e2.fromNow()})`);
                        table(e1.format("DD/MM/YYYY"), e2.format("DD/MM/YYYY"));
                        this.appendElement.append(kelement.element());
                    });

                },
            }, true)));

    }

    searchCnep() {
        if (!this.cnpj) return;
        this.xhr.push(this.controller.server.call("SELECT FROM 'PORTALTRANSPARENCIA'.'CNEP'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando cadastro nacional de empresas punidas com o CNPJ ${this.cnpj}.`, {
                data: {
                    documento: this.cnpj
                },
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.controller.call("kronoos::element", 'Cadastro Nacional de Empresas Punidas',
                        "Existência de apontamentos cadastrais.", 'Portal da transparência, cadastro nacional de empresas punidas.');
                        kelement.table("Tipo da sanção", "Fundamentação legal")
                            (x("TIPO-DA-SANCAO"), x("FUNDAMENTACAO-LEGAL"));
                        kelement.table("Descrição da fundamentação legal", "Data de início da sanção")
                            (x("DESCRICAO-DA-FUNDAMENTACAO-LEGAL"), x("DATA-DE-INICIO-DA-SANCAO"));
                        kelement.table("Data de fim da sanção", "Data de publicação sanção")
                            (x("DATA-DE-FIM-DA-SANCAO"), x("DATA-DE-PUBLICACAO-SANCAO"));
                        kelement.table("Número do processo", "Órgão sancionador")
                            (x("NUMERO-DO-PROCESSO"), x("ORGAO-SANCIONADOR"));
                        kelement.table("UF do órgão sancionador", "Origem da informação")
                            (x("UF-DO-ORGAO-SANCIONADOR"), x("ORIGEM-DA-INFORMACAO"));

                    this.kelements.push(kelement);
                    this.appendElement.append(kelement.element());
                },
            }, true)));
    }

    searchExpulsoes() {
        if (!this.cpf) return;
        this.xhr.push(this.controller.server.call("SELECT FROM 'PORTALTRANSPARENCIA'.'EXPULSOES'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando sanções e expulsões na controladoria geral da união com o CPF ${this.cpf}.`, {
                data: {
                    documento: this.cpf
                },
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.controller.call("kronoos::element", 'EXPULSOES',
                        "Existência de apontamentos cadastrais.", 'EXPULSOES.');


                    kelement.table("Número da Portaria", "Publicação do DOU")
                        (x("NUMERO-DA-PORTARIA"), x("PUBLICACAO-NO-DOU"));
                    kelement.table("Número do Processo Administrativo", "Tipo de Punição")
                        (x("NUMERO-DO-PROCESSO-ADMINISTRATIVO"), x("TIPO-DE-PUNICAO"));
                    kelement.table("Cargo Efetivo", "Função ou Cargo de Confiança")
                        (x("CARGO-EFETIVO"), x("FUNCAO-OU-CARGO-DE-CONFIANCA"));
                    kelement.table("Orgão de Lotação", "UF de Lotação")
                        (x("ORGAO-DE-LOTACAO"), x("UF-DE-LOTACAO"));
                    kelement.table("Fundamento Legal")
                        (x("FUNDAMENTO-LEGAL"));


                    this.kelements.push(kelement);
                    this.appendElement.append(kelement.element());
                },
            }, true)));
    }

    searchCepim() {
        if (!this.cnpj) return;
        this.xhr.push(this.controller.server.call("SELECT FROM 'PORTALTRANSPARENCIA'.'CEPIM'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando entidades privadas sem fins lucrativas impedidas com o CNPJ ${this.cnpj}.`, {
                data: {
                    documento: this.cnpj
                },
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.controller.call("kronoos::element", 'CEPIM',
                        "Existência de apontamentos cadastrais.", 'CEPIM.');

                    kelement.table("Número do Convênio Siafi", "Situação")(x("NUMERO-DO-CONVENIO-SIAFI"), x("SITUACAO"));
                    kelement.table("Nº Original", "Objeto do Convênio")(x("N-ORIGINAL"), x("OBJETO-DO-CONVENIO"));
                    kelement.table("Orgão Superior", "Concedente")(x("ORGAO-SUPERIOR"), x("CONCEDENTE"));
                    kelement.table("Convenente", "Valor Convênio")(x("CONVENENTE"), `R$ ${x("VALOR-CONVENIO")}`);
                    kelement.table("Valor Liberado", "Publicação")(x("VALOR-LIBERADO"), x("PUBLICACAO"));
                    kelement.table("Início da Vigência", "Fim da Vigência")(x("INICIO-DA-VIGENCIA"), x("FIM-DA-VIGENCIA"));
                    kelement.table("Valor Contrapartida", "Data Última Liberação")(`R$ ${x("VALOR-CONTRAPARTIDA")}`, x("DATA-ULTIMA-LIBERACAO"));
                    kelement.table("valor Última Liberação")(`R$ ${x("VALOR-ULTIMA-LIBERACAO")}`);

                    this.kelements.push(kelement);
                    this.appendElement.append(kelement.element());
                },
            }, true)));
    }

    searchCertidao(nascimento = null, cpf_cnpj = null) {
        cpf_cnpj = cpf_cnpj || this.cpf_cnpj;
        this.xhr.push(this.controller.server.call("SELECT FROM 'RFB'.'CERTIDAO'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando a situação do documento ${this.cpf_cnpj} junto a receita federal.`, {
                data: {
                    documento: cpf_cnpj,
                    nascimento: nascimento
                },
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.controller.call("kronoos::element", 'Certidão do Documento pela Receita Federal',
                        "Consulta do documento a Receita Federal.", 'Certidão remetida pela Receita Federal.');
                    if (CPF.isValid(cpf_cnpj)) {
                        kelement.table("Nome", "Código Comprovante")(x("nome"), x("codigo-comprovante"));
                        kelement.table("Data Consulta", "Situação")(x("data-consulta"), x("situacao"));
                        kelement.table("Data de Nascimento", "Data da Inscrição")(x("dataNascimento"), x("dataInscricao"));
                    } else {
                        kelement.table("Nome", "CNPJ", "Data de Abertura")
                            (x("nome"), x("CNPJ"), x("data-abertura"));
                        kelement.table("Data Consulta", "Situação", "Data Situação")
                            (x("data-consulta"), x("situacao"), x("data-situacao"));
                        kelement.table("EFR", "Situação Especial", "Data Situação Especial")
                            (x("efr"), x("situacao-especial"), x("data-situacao-especial"));
                            kelement.table("Natureza Jurídica", "Tipo CNPJ", "Capital Social")
                                (`${$("natureza-juridica", data).attr("codigo")} ${x("natureza-juridica")}`, x("tipo-cnpj"), numeral(parseInt(x("capitalSocial"))).format("$0,0.00"));
                        kelement.table("Atividade Econômica", "E-mail", "Telefone")
                            (`${$("atividade-economica", data).attr("codigo")} ${x("atividade-economica")}`,
                                x("email"), x("telefone"));

                        let v = n => $(`endereco ${n}`, data).text();
                        kelement.list("Endereço")
                            (`${v('logradouro')}, ${v('numero')} ${v('complemento')} - ${v('cep')}, ${v('bairro')}, ${v('municipio')} / ${v('uf')}`);

                        let atividadesSecundarias = $("atividade-secundaria", data);
                        if (atividadesSecundarias.length) {
                            let atividades = kelement.captionTable("Atividades Secundárias", "CNAE", "Qualificação");
                            atividadesSecundarias.each(function () {
                                atividades($(this).attr("codigo"), $(this).text());
                            });
                        }


                        let socios = $("socio", data);
                        if (socios.length) {
                            let qsa = kelement.captionTable("Quadro Social", "Qualificação", "Nome do Sócio");
                            socios.each(function () {
                                qsa($(this).attr("qualificacao"), $(this).text());
                            });
                        }

                    }
                    this.kelements.push(kelement);
                    this.appendElement.append(kelement.element());
                },
            }, true)));
    }

    searchCeis() {
        this.xhr.push(this.controller.server.call("SELECT FROM 'PORTALTRANSPARENCIA'.'CEIS'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando empresas de pessoas físicas sancionadas pelo documento ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj
                },
                success: (data) => {
                    let x = n => $(n, data).text();

                    let kelement = this.controller.call("kronoos::element", 'CEIS – Cadastro Nacional de Empresas Inidôneas e Suspensas',
                        "Cadastro Nacional de Empresas Inidôneas e Suspensas de celebrar convênios, contratos de repasse ou termos de parceria com a administração pública federal", "Controladoria Geral da União (CGU)");
                    this.kelements.push(kelement);

                    kelement.table("Tipo da sanção", "Fundamentação legal")
                        (x("TIPO-DA-SANCAO"), x("FUNDAMENTACAO-LEGAL"));
                    kelement.table("Descrição da fundamentação legal")(x("DESCRICAO-DA-FUNDAMENTACAO-LEGAL"));
                    kelement.table("Data de início da sanção")(x("DATA-DE-INICIO-DA-SANCAO"));
                    kelement.table("Data de fim da sanção", "Data de publicação sanção")
                        (x("DATA-DE-FIM-DA-SANCAO"), x("DATA-DE-PUBLICACAO-SANCAO"));
                    kelement.table("Número do processo", "Órgão sancionador")
                        (x("NUMERO-DO-PROCESSO"), x("ORGAO-SANCIONADOR"));
                    kelement.table("UF do órgão sancionador", "Origem da informação")
                        (x("UF-DO-ORGAO-SANCIONADOR"), x("ORIGEM-DA-INFORMACAO"));

                    this.appendElement.append(kelement.element());
                },
            }, true)));
    }

    searchMandado(idLog, numeroMandado) {
        this.xhr.push(this.controller.server.call("SELECT FROM 'PROCURADOS'.'MANDADO'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando mandado de prisão ${numeroMandado}.`, {
                data: {
                    idLog: idLog,
                    numero: numeroMandado
                },
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.controller.call("kronoos::element", 'Mandado de Prisão',
                        "Existência de apontamentos cadastrais.", 'Mandado de prisão expedido.');
                    kelement.table("Numero do Mandado", "Data do Mandado")(x("numeroMandado"), x("dataMandado"));
                    kelement.table("Genitora", "Genitor")(x("genitoras"), x("genitores"));
                    kelement.table("Validade", "Orgão Julgador")
                        (x("dataValidade"), `${x("orgaoJulgador nome")} - ${x("orgaoJulgador municipio")} / ${x("orgaoJulgador UF")}`);
                    kelement.table("Síntese da Decisão")(x("sinteseDecisao"));
                    this.kelements.push(kelement);
                    this.appendElement.append(kelement.element());
                },
            }, true)));
    }

    searchMandados() {
        if (!this.cpf || !CPF.isValid(this.cpf)) return;
        this.xhr.push(this.controller.server.call("SELECT FROM 'PROCURADOS'.'CONSULTA'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando mandados de prisão através do CPF/CNPJ ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf,
                    nome: this.name
                },
                success: (data) => {
                    let idLog = $("idLog", data).text();
                    var ctx = this;
                    $("CNJ > retorno > node", data).each(function () {
                        if ($("pessoa", this).text().toLowerCase() != ctx.name.toLowerCase())
                             return;
                        ctx.searchMandado(idLog, $("numeroMandado", this).text());
                    });
                },
            }, true)));
    }

    generateHeader(defaultType = "minimized") {
        let observation = ''; /* empty */
        if (this.parameters.observation)
            observation = `, ${this.parameters.observation}`;

        this.header = {
            container: $("<div />").addClass("container"),
            content: $("<div />").addClass("content"),
            element: $("<div />").addClass("kronoos-header"),
            actions: $("<ul />").addClass("kronoos-actions"),
            title: $("<div />").addClass("kronoos-title").text(`Informações Kronoos - ${this.name}`),
            subtitle: $("<div />").addClass("kronoos-subtitle").text(`${this.cpf ? "CPF" : "CNPJ"}: ${this.cpf_cnpj} ${observation}`)
        };
        this.appendElement.prepend(this.header.element).addClass(defaultType);
        this.header.element.append(this.header.container);
        this.header.container.append(this.header.content);
        this.header.content.append(this.header.actions);
        this.header.content.append(this.header.title);
        this.header.content.append(this.header.subtitle);

        var icon = "fa-minus-square-o";
        if (defaultType == "minimized") {
            icon = "fa-plus-square-o";
        }

        this.header.actionElements = {
            push: $("<i />").addClass(`fa fa-eye`),
            windowResize: $("<i />").addClass(`fa ${icon}`),
            trash: $("<i />").addClass("fa fa-trash")
        };

        this.header.actionElements.push.click((e) => {
            e.preventDefault();
            this.controller.confirm({
                title: `Deseja acompanhar o documento?`,
                subtitle: `Acompanhamento para o ${this.cpf ? "CPF" : "CNPJ"} ${this.cpf_cnpj}.`,
                paragraph: "O sistema irá te informar a respeito de quaisquer novas alterações das informações deste relatório / target.",
            }, () => {
                this.controller.alert({});
            });
        });


        this.header.actionElements.windowResize.click((e) => {
            e.preventDefault();
            let isMinimized = this.appendElement.hasClass("minimized");
            this.appendElement[isMinimized ? "removeClass" : "addClass"]("minimized");
            this.appendElement[isMinimized ? "addClass" : "removeClass"]("maximized");
            this.header.actionElements.windowResize[isMinimized ? "removeClass" : "addClass"]("fa-plus-square-o");
            this.header.actionElements.windowResize[isMinimized ? "addClass" : "removeClass"]("fa-minus-square-o");
        });

        this.header.actionElements.trash.click((e) => {
            e.preventDefault();
            this.kill();
            this.appendElement.remove();
        });

        this.controller.call("tooltip", this.header.actions, "Remover")
            .append(this.header.actionElements.trash);
        this.controller.call("tooltip", this.header.actions, "Expandir / Minimizar")
            .append(this.header.actionElements.windowResize);
        this.controller.call("tooltip", this.header.actions, "Acompanhar")
                .append(this.header.actionElements.push);
    }

    parseKronoos(kronoosData) {
        if (!kronoosData) return;
        $("BPQL body item", kronoosData).each((idx, element) => {
            let namespace = $("namespace", element).text(),
            [title, description] = NAMESPACE_DESCRIPTION[namespace],
            kelement = this.controller.call("kronoos::element", title, "Existência de apontamentos cadastrais.", description),
            notes = $("notes node", element),
            source = $("source node", element),
            position = $("position", element),
            insertMethod = "append",
            insertElement = this.appendElement;

            if (GET_PHOTO_OF.indexOf(namespace) !== -1) {
                // insertMethod = "prepend";
                // if (this.header) {
                //     insertMethod = "insertAfter";
                //     insertElement = this.header.element;
                //     debugger;
                // }
                this.kelements.unshift(kelement);
                this.controller.server.call("SELECT FROM 'KRONOOSUSER'.'PHOTOS'", {
                    data: {
                        name: name
                    },
                    dataType: "json",
                    success: (ret) => {
                        for (let picture of ret) {
                            kelement.picture(picture);
                            return;
                        }
                    }
                });
            } else {
                this.kelements.push(kelement);
            }

            if (notes.length) {
                let knotes = kelement.list("Notas");
                notes.each((idx) => {
                    knotes(notes.eq(idx).text());
                });
            }

            if (source.length || position.length) {
                if (source.length && !position.length) {
                    let ksources = kelement.list("Fontes");
                    source.each((idx) => {
                        let s = source.eq(idx).text();
                        ksources($("<a />").attr("href", s).text(s).html());
                    });

                } else if (!source.length && position.length) {
                    kelement.list("Marcação")(position.text());
                } else {
                    let ktable = kelement.table("Marcação", "Fontes");
                    source.each((i) => {
                        let s = source.eq(i).text();
                        ktable(position.eq(i).text(), $("<a />").attr("href", s).text(s).html());
                    });
                }
            }

            insertElement[insertMethod](kelement.element());
            this.searchBar.addClass("minimize").removeClass("full");
        });
    }

    parseProcs(procs) {
        for (let proc in procs) {
            let jelement = this.controller.call("kronoos::element", `Processo Nº ${proc}`, "Aguarde enquanto o sistema busca informações adicionais.",
            "Foram encontradas informações, confirmação pendente.");
            this.kelements.push(jelement);
            let [article, match] = procs[proc];
            jelement.paragraph(article.replace(match, `<strong>${match}</strong>`));
            this.appendElement.append(jelement.element().attr("id", `cnj-${proc.replace(NON_NUMBER, '')}`));
        }
    }

    query(query, cpf_cnpj, elements) {
        let key = `${query}.'${cpf_cnpj}'`;
        if (this.cpf_cnpjs[key]) {
            return;
        }

        this.cpf_cnpjs[key] = true;
        elements.push((callback) => this.xhr.push(this.controller.server.call(query,
            this.controller.call("kronoos::status::ajax", "fa-eye", `Capturando dados de conexão através do CPF/CNPJ ${this.cpf_cnpj}.`, {
                data: {
                    documento: cpf_cnpj
                },
                success: (data) => this.generateRelations.appendDocument(data, cpf_cnpj),
                complete: () => callback()
            }, true))));
    }

    emptyChecker () {
        if (!this.kelements.length) {
            let [title, description] = NAMESPACE_DESCRIPTION.clear,
            nelement = this.controller.call("kronoos::element", title, "Não consta nenhum apontamento cadastral.", description);
            this.appendElement.append(nelement.element());
            this.kelements.push(nelement);
            this.searchBar.addClass("minimize").removeClass("full");
        }
    }

    kill () {
        for (let xhr of this.xhr)
            xhr.abort();
        if (this.taskGraphTrack) this.taskGraphParallel.kill();
        if (this.taskGraphParallel) this.taskGraphParallel.kill();
    }

    graphTrack () {
        this.taskGraphTrack = async.times(5, (i, cb) => this.generateRelations.track((data) => {
            let elements = [];
            for (let node of data.nodes) {
                let formatted_document = pad(node.id.length > 11 ? 14 : 11, node.id, '0'),
                    cpf_cnpj = (CPF.isValid(formatted_document) ? CPF : CNPJ).format(formatted_document);
                this.query("SELECT FROM 'RFB'.'CERTIDAO'", formatted_document, elements);
                this.query("SELECT FROM 'CBUSCA'.'CONSULTA'", formatted_document, elements);
                this.query("SELECT FROM 'CCBUSCA'.'CONSULTA'", formatted_document, elements);

                if (!this.cpf_cnpjs[cpf_cnpj]) {
                    this.cpf_cnpjs[cpf_cnpj] = true;
                    elements.push((cb) => this.xhr.push(this.controller.server.call("SELECT FROM 'KRONOOSUSER'.'API'", this.controller.call("error::ajax",
                    this.controller.call("kronoos::status::ajax", "fa-eye", `Pesquisando correlações através do nome ${node.label}, documento ${this.cpf_cnpj}.`, {
                        data: {
                            documento: this.cpf_cnpj,
                            name: `"${node.label.replace("\n", "")}"`
                        },
                        success: (data) => {
                            this.controller.call("kronoos::parse", node.label, formatted_document, data, null, null, [], "minimized", {
                                observation: `relacionado ao ${this.cpf ? "CPF" : "CNPJ"} ${this.cpf_cnpj} - ${this.name}.`
                            });
                        },
                        complete: () => cb()
                    })))));
                }
            }
            this.taskGraphParallel = async.parallel(elements, cb);
        }), () => {
            this.generateRelations.track((data) => {
                if (!data.nodes.length)
                return;
                let [network, node] = this.kelements[0].addNetwork(data.nodes, data.edges, {
                    groups: data.groups
                });
                network.on("click", params => {
                    if (!params.nodes[0]) {
                        return;
                    }

                    let doc = pad(params.nodes[0].length > 11 ? 14 : 11, params.nodes[0], '0');
                    if (!CPF.isValid(doc) && !CNPJ.isValid(doc)) {
                        this.controller.alert({
                            title: "Não foi possível pesquisar a pessoa solicitada.",
                            subtitle: "A informação de conexão que possuimos não permite rastreamento posterior",
                            paragraph: "É provável que não tenhamos metadados suficientes para realizar esta pesquisa."
                        });
                        return;
                    }

                    var win = window.open(`${document.location.origin}?k=${doc}`, '_blank');
                    if (win) win.focus();
                });
            });
        });
    }
}
