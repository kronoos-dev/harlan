import iconv from 'iconv-lite';
import {
    CPF,
    CNPJ
} from 'cpf_cnpj';
import async from "async";
import _ from "underscore";
import pad from 'pad';
import bankCodes from "./bank-codes";
import VMasker from 'vanilla-masker';
import uniqid from 'uniqid';
import GoogleMapsLoader from 'google-maps';
import htmlDocx from 'html-docx-js';
import saveAs from 'save-as';
import toMarkdown from 'to-markdown';
import html2canvas from 'html2canvas';
import CSV from 'csv-string';

const CNJ_REGEX_TPL = '(\\s|^)(\\d{7}\\-?\\d{2}.?\\d{4}\\.?\\d{1}\\.?\\d{2}\\.?\\d{4})(\\s|$)';
const CNJ_REGEX = new RegExp(CNJ_REGEX_TPL);
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
    'licitacoes': ['Participação em Licitações', 'Constam participações em licitações.'],
    'hsbc': ['Fortunas e Offshores Ligadas a Brasileiros no HSBC da Suiça', 'Brasileiros com contas sigilosas na filial suíça do banco HSBC, por meio das "offshores"'] /* OrigemComprador, Participante, Status, data, Tipo da Licitações */
};

const removeDiacritics = require('diacritics').remove;

const highPriority = 0;
const normalPriority = 100;
const lowPriority = 200;
const searchBar = $(".kronoos-application .search-bar");

export class KronoosParse {

    constructor(controller, depth, name, cpf_cnpj, kronoosData,
        ccbuscaData = null, defaultType = "maximized", parameters = {}, brief = null) {

        this.stats = brief;
        this.depth = depth;
        this.networkData = null;
        this.uniqid = uniqid();
        this.parameters = parameters;
        this.name = name.replace(/(\r)?\n/g, " ").replace(/\s+/g, ' ');
        this.controller = controller;
        this.kelements = [];
        this.procElements = {};
        this.cpf_cnpjs = {};
        this.xhr = [];
        this.homonymous = 100;
        this.kronoosData = kronoosData;
        this.ccbuscaData = ccbuscaData;
        this.runningXhr = 0;
        this.titleCanChange = false;
        this.geocodes = [];

        if (CPF.isValid(cpf_cnpj)) {
            this.cpf = this.cpf_cnpj = CPF.format(cpf_cnpj);
        } else if (CNPJ.isValid(cpf_cnpj)) {
            this.cnpj = this.cpf_cnpj = CNPJ.format(cpf_cnpj);
        } else {
            throw "Verifique se no sistema é possível chegar um CPF / CNPJ inválido";
        }

        this.appendElement = $("<div />").addClass("record");
        this.generateHeader(defaultType);

        $(".kronoos-result").append(this.appendElement);

        let execute = () => {
            if (kronoosData) this.parseKronoos(kronoosData);
            this.emptyChecker();
            let m = moment();
            this.firstElement().header(this.cpf_cnpj, name, m.format("DD/MM/YYYY"), m.format("H:mm:ss"));
            this.searchAll();
        };

        if (this.cpf) {
            this.serverCall("SELECT FROM 'CBUSCA'.'HOMONYMOUS'",
                this.loader("fa-eye", `Verificando a quantidade de homônimos para o nome ${this.name}.`, {
                    dataType: "json",
                    data: {
                        nome: this.name
                    },
                    success: ret => {
                        this.homonymous = ret.homonymous;
                    },
                    complete: () => execute()
                }));
        } else {
            this.homonymous = 1;
            execute();
        }
    }

    get brief() {
        if (!this._brief)[this._brief, this._briefElement] = this.stats().create(this.name, this.cpf_cnpj,
            () => $('html, body').scrollTop(this.appendElement.offset().top));
        return this._brief;
    }

    call(...args) {
        return this.controller.call(...args);
    }

    isRunning() {
        return this.runningXhr > 0;
    }

    serverCall(query, conf, priority = null) {
        if (!(this.runningXhr++))
            this.header.element.addClass("loading");

        let complete = conf.complete;
        conf.timeout = conf.timeout || 120000; /* 2 minutes */
        conf.complete = (...args) => {
            if (!(--this.runningXhr)) {
                this.header.element.removeClass("loading");
                this.end();
            }
            if (complete) complete(...args);
        };

        this.controller.call("kronoos::ajax::queue", {
            parser: this,
            call: [query, conf]
        }, priority || normalPriority);
    }

    loader(...args) {
        return this.call("kronoos::status::ajax", ...args);
    }

    notFound(...args) {
        if (!this._notFoundList) {
            this._notFoundObject = {};
            this._notFoundList = this.firstElement().list("Não Constam Apontamentos", this._notFoundObject);
        }
        return this._notFoundList(...args);
    }

    searchTJSPCertidaoPDF(tipo, pedido, data) {
        this.serverCall("SELECT FROM 'TJSP'.'DOWNLOAD'",
            this.loader("fa-eye", `Capturando certidões no Tribunal de Justiça de São Paulo - ${tipo} ${this.cpf_cnpj}.`, {
                data: {
                    'nuPedido': pedido,
                    'dtPedido': data,
                },
                success: (data) => {
                    let kelement = this.kronoosElement("Certidão do TJSP",
                        tipo,
                        "Visualização da Certidão no Tribunal de Justiça de São Paulo");
                    kelement.element().find(".kronoos-side-content").append($("<a />").attr({
                        href: `data:application/octet-stream;base64,${$("body > pdf", data).text()}`,
                        download: `certidao-tjsp-${this.cpf_cnpj.replace(NON_NUMBER, '')}.pdf`
                    }).append($("<img />").addClass("certidao")
                        .attr({
                            src: `data:image/png;base64,${$("body > png", data).text()}`
                        })));
                    kelement.behaviourAccurate(!/\NADA\s*CONSTA/i.test($("body > text", data).text()));
                    this.append(kelement.element());
                }
            }, true));
    }

    searchTJSPCertidaoFisica() {
        if (!this.cpf || !this.name) return;
        for (let flGenero of ['M'])
            this.serverCall("SELECT FROM 'TJSP'.'CERTIDAO'",
                this.loader("fa-eye", `Capturando certidões no Tribunal de Justiça de São Paulo - ${this.cpf}.`, {
                    data: {
                        'nuCpfFormatado': this.cpf,
                        'nmPesquisa': this.name,
                        'nmMae': this.mae || "",
                        'dtNascimento': this.nascimento || "",
                        'tpPessoa': 'F',
                        'flGenero': flGenero
                    },
                    success: data => {
                        let element = $("body > pedido", data);
                        if (!element.length) return;
                        let kelement = this.kronoosElement("Certidão do TJSP",
                            "Cadastro de Pedido de Certidão no Tribunal de Justiça de São Paulo",
                            "Visualização do Pedido de Certidão no Tribunal de Justiça de São Paulo");
                        let captionTableElement = kelement.captionTable("Lista de Certidões", "Tipo", "Pedido", "Data");
                        element.each((i, item) => {
                            let pedido = $("pedido", item).text();
                            let data = $("data", item).text();
                            let tipo = $(item).attr("type");
                            captionTableElement(tipo, pedido, data);
                            this.searchTJSPCertidaoPDF(tipo, pedido, data);
                        });
                        this.append(kelement.element());
                    }
                }, true));
    }

    searchPep() {
        if (!this.cpf) return;
        this.serverCall("SELECT FROM 'KRONOOS'.'ELEICOES'",
            this.loader("fa-eye", `Comparando documento com base de dados das pessoas políticamente expostas - ${this.cpf}.`, {
                dataType: 'json',
                data: {
                    'nome': `"${this.name}"`
                },
                success: (data) => {
                    let behaviour = 'behaviourAccurate';
                    data = _.values(data);
                    data = _.filter(data, politic => {
                        if (!politic.CPF_CANDIDATO) {
                            if (politic.DATA_NASCIMENTO && this.nascimento) {
                                let d1 = moment(politic.DATA_NASCIMENTO, "DD/MM/YY");
                                let d2 = moment(this.nascimento, "DD/MM/YYYY");
                                if (d1.isValid() && d2.isValid()) {
                                    return d1.isSame(d2, 'day');
                                }
                            }
                            if (this.homonymous > 10) {
                                return false;
                            }
                            behaviour = 'behaviourHomonym';
                            return true;
                        }
                        let cpfValue = this.cpf.replace(/[^\d]/g, '');
                        return politic.CPF_CANDIDATO == cpfValue;
                    });
                    if (!data.length) {
                        this.notFound("Pessoa Políticamente Exposta <small>Não consta na base de dados do TSE.</small>");
                        return;
                    }
                    let kelement = this.kronoosElement("Pessoa Políticamente Exposta",
                        "A pessoa física se candidatou a cargo político e consta na base de dados do TSE.",
                        "Visualização das candidaturas da pessoa física na base de dados do Tribunal Superior Eleitoral.");
                    kelement[behaviour](true);
                    let captionTableElement = kelement.captionTable("Registros no Tribunal Superior Eleitoral", "Partido", "Descrição do Cargo", "Situação", "Candidatura", "Ano da Eleição");
                    for (let row of data) {
                        captionTableElement(row.NOME_PARTIDO, row.DESCRICAO_CARGO, row.DESC_SIT_TOT_TURNO || "Não há", row.DES_SITUACAO_CANDIDATURA, row.ANO_ELEICAO);
                    }
                    this.append(kelement.element());
                }
            }, true));
    }

    searchTJSPCertidao() {
        if (!this.cnpj) return;
        this.serverCall("SELECT FROM 'TJSP'.'CERTIDAO'",
            this.loader("fa-eye", `Capturando certidões no Tribunal de Justiça de São Paulo - ${this.cnpj}.`, {
                data: {
                    'nuCnpjFormatado': this.cnpj,
                    'nmPesquisa': this.name,
                    'tpPessoa': 'J'
                },
                success: (data) => {
                    let element = $("body > pedido", data);
                    if (!element.length) return;
                    let kelement = this.kronoosElement("Certidão do TJSP",
                        "Cadastro de Pedido de Certidão no Tribunal de Justiça de São Paulo",
                        "Visualização do Pedido de Certidão no Tribunal de Justiça de São Paulo");
                    let captionTableElement = kelement.captionTable("Lista de Certidões", "Tipo", "Pedido", "Data");
                    element.each((i, item) => {
                        let pedido = $("pedido", item).text();
                        let data = $("data", item).text();
                        let tipo = $(item).attr("type");
                        captionTableElement(tipo, pedido, data);
                        this.searchTJSPCertidaoPDF(tipo, pedido, data);
                    });
                    this.append(kelement.element());
                }
            }, true));
    }

    searchAll() {
        this.jusSearch();
        this.searchTjsp();
        this.searchMandados();
        this.searchCNDT();
        this.searchMTE();
        this.searchIbama();
        this.searchDAU();
        this.searchBovespa();
        if (this.cnpj) this.searchCertidao();
        if (this.cnpj) this.searchTJSPCertidao();
        this.searchCepim();
        this.searchExpulsoes();
        this.searchCnep();
        this.searchCeis();
        this.searchCCF();
        this.searchProtestos();

        if (!this.ccbuscaData) {
            this.serverCall("SELECT FROM 'CCBUSCA'.'CONSULTA'",
                this.loader("fa-bank", `Acessando bureau de crédito para ${this.name || ""} ${this.cpf_cnpj}.`, {
                    data: {
                        documento: this.cpf_cnpj,
                    },
                    success: (ret) => this.showCBusca(ret)
                }));
            return;
        }

        this.showCBusca();
        this.generateRelations = this.call("generateRelations");
        this.generateRelations.appendDocument(this.ccbuscaData, this.cpf_cnpj);
        this.cpf_cnpjs[this.cpf_cnpj] = true;
        this.graphTrack();
    }

    cbuscaMae() {
        let row = {};
        let maeNode = $("nomemae", this.ccbuscaData);
        if (maeNode.length && maeNode.text()) {
            row["Nome da Mãe"] = maeNode.text();
            this.mae = maeNode.text();
        }

        let dtNascimento = $("dtnascimento", this.ccbuscaData);
        if (dtNascimento.length && dtNascimento.text()) {
            let dtNasc = moment(dtNascimento.text(), "YYYYMMDD").format("DD/MM/YYYY");
            this.nascimento = dtNasc;
            if (this.cpf) this.searchCertidao(dtNasc, this.cpf);
            row[this.cpf ? "Data de Nascimento" : "Data de Abertura"] = dtNasc;
        }

        if (this.cpf) this.searchTJSPCertidaoFisica();

        if (!_.keys(row).length) return;
        this.firstElement().table(..._.keys(row))(..._.values(row));
    }

    cbuscaTelefone() {
        let telefones = $("telefones telefone", this.ccbuscaData);
        if (!telefones.length) return;

        let klist = this.firstElement().list("Telefones");
        telefones.each(function() {
            klist(VMasker.toPattern($("ddd", this).text() +
                $("numero", this).text(), "(99) 9999-99999"));
        });
    }

    end() {}

    cbuscaEmpregos() {
        let rendaEmpregador = $("rendaEmpregador rendaEmpregador", this.ccbuscaData);
        if (!rendaEmpregador.length) return;
        let klist = this.firstElement().list("Empregadores");
        rendaEmpregador.each((idx, value) => {
            let v = x => $(x, value).text();
            klist(`${v('empregador')} <small>${v('setorEmpregador')}</small> - ${v('cboDescricao')} <small>${v('faixaRenda')} em ${moment(v('rendaDataRef'), "YYYY-MM-DD").format("DD/MM/YYYY")}, ${moment(v('rendaDataRef'), "YYYY-MM-DD").fromNow()}.</small>`);
        });
    }

    cbuscaEnderecos() {
        let enderecos = $("enderecos endereco", this.ccbuscaData);
        if (!enderecos.length) return;
        let klist = this.firstElement().list("Endereço");
        let keys = {};
        enderecos.each((idx, value) => {
            let v = x => $(x, value).text();
            if (!v('cep')) return;

            let number = v('numero').replace(/^0+/, '');
            let key = v('cep') + number;
            if (keys[key]) return;
            keys[key] = true;
            klist(`${v('tipo')} ${v('logradouro')}, ${number} - ${v('complemento')} - ${v('cidade')} - ${v('estado')}, ${v('cep')}`);
            this.serverCall("SELECT FROM 'KRONOOS'.'GEOCODE'",
                this.loader("fa-eye", `Localizando para o documento ${this.cpf_cnpj} o endereço inscrito no CEP ${VMasker.toPattern(v('cep'), '99999-999')}.`, {
                    dataType: 'json',
                    data: {
                        address: `${v('tipo')} ${v('logradouro')}, ${number} - ${v('cidade')} - ${v('estado')}, ${v('cep')}`
                    },
                    success: geo => this.geocodes.push(geo)
                }));
        });
    }

    showCBusca(ccbuscaData = null) {
        if (ccbuscaData) this.ccbuscaData = ccbuscaData;
        this.cbuscaMae();
        this.cbuscaTelefone();
        this.cbuscaEnderecos();
        this.cbuscaEmpregos();
        this.searchPep();
    }

    searchBovespa() {}

    searchDAU() {
        this.serverCall("SELECT FROM 'RFBDAU'.'CONSULTA'",
            this.loader("fa-eye", `Pesquisando Dívida Ativa da União para o CNPJ ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj
                },
                success: (data) => {
                    let kelement = this.kronoosElement("Certidão de Dívida Ativa da União",
                        "Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União",
                        "Documento comprova que empresa está em condição regular em relação à Secretaria da Receita Federal e à dívida ativa da União.");

                    kelement.table("Nome", "Documento")
                        ($("nome", data).text(), $("documento", data).text());
                    kelement.table("Validade", "Código de Controle")
                        ($("validade", data).text(), $("codigo_de_controle", data).text());
                    let text = $("descricao", data).text();
                    kelement.paragraph(text);
                    kelement.behaviourAccurate(!!/\:\s*constam/i.test(text));
                    this.append(kelement.element());
                }
            }, true));
    }

    searchCNDT() {
        if (!this.cnpj) return;
        this.serverCall("SELECT FROM 'CNDT'.'CERTIDAO'",
            this.loader("fa-eye", `Certidão Negativa de Débitos Trabalhistas ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cnpj
                },
                success: (data) => {
                    let kelement = this.kronoosElement("Certidão Negativa de Débitos Trabalhistas - TST",
                        "Geração de Certidão Negativa de Débitos Trabalhistas no Tribunal Superior do Trabalho",
                        "Certidão Negativa de Débitos Trabalhistas - CNDT, documento indispensável à participação em licitações públicas.");
                    kelement.element().find(".kronoos-side-content").append($("<a />").attr({
                        href: `data:application/octet-stream;base64,${$("body > pdf", data).text()}`,
                        download: `certidao-cndt-${this.cnpj.replace(NON_NUMBER, '')}.pdf`
                    }).append($("<img />").addClass("certidao")
                        .attr({
                            src: `data:image/png;base64,${$("body > png", data).text()}`
                        })));
                    kelement.behaviourAccurate(!/\N[Ãã]O CONSTA/i.test($("body > text", data).text()));
                    this.append(kelement.element());
                }
            }, true));
    }

    searchIbama() {
        if (!this.cnpj) return;
        this.serverCall("SELECT FROM 'Ibama'.'CERTIDAO'",
            this.loader("fa-eye", `Geração de Certidão Negativa de Débito do Ibama para o documento ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cnpj,
                    nome: this.name
                },
                success: (data) => {
                    let kelement = this.kronoosElement("Certidão de Débito do Ibama",
                        "Geração de Certidão de Débito do Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis.",
                        "Emissão de Geração de Certidão de Débito do Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis.");

                    kelement.element().find(".kronoos-side-content").append($("<a />").attr({
                        href: `data:application/octet-stream;base64,${$("body > pdf", data).text()}`,
                        download: `certidao-ibama-${this.cnpj.replace(NON_NUMBER, '')}.pdf`
                    }).append($("<img />").addClass("certidao")
                        .attr({
                            src: `data:image/png;base64,${$("body > png", data).text()}`
                        })));
                    kelement.behaviourAccurate(!/\NADA CONSTA/i.test($("body > text", data).text()));
                    this.append(kelement.element());
                }
            }, true));
    }


    searchMTE() {
        if (!this.cnpj) return;
        this.serverCall("SELECT FROM 'MTE'.'CERTIDAO'",
            this.loader("fa-eye", `Geração de Certidão de Débito e Consulta a Informações Processuais de Autos de Infração ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cnpj
                },
                success: (data) => {
                    let kelement = this.kronoosElement("Secretaria de Inspeção do Trabalho - SIT",
                        "Geração de Certidão de Débito e Consulta a Informações Processuais de Autos de Infração",
                        "Emissão de Certidão de Débito, Consulta a Andamento Processual e Consulta a Informações Processuais de Autos de Infração.");

                    kelement.element().find(".kronoos-side-content").append($("<a />").attr({
                        href: `data:application/octet-stream;base64,${$("body > pdf", data).text()}`,
                        download: `certidao-mte-${this.cnpj.replace(NON_NUMBER, '')}.pdf`
                    }).append($("<img />").addClass("certidao")
                        .attr({
                            src: `data:image/png;base64,${$("body > png", data).text()}`
                        })));
                    kelement.behaviourAccurate(!/\N[Ãã]O CONSTA/i.test($("body > text", data).text()));
                    this.append(kelement.element());
                }
            }, true));
    }

    searchProtestos() {
        this.serverCall("SELECT FROM 'IEPTB'.'WS'",
            this.loader("fa-eye", `Buscando por ocorrências de protestos para o documento ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj
                },
                success: (data) => {
                    let iterateOver = $("BPQL > body > consulta > conteudo > cartorio", data);

                    if (!iterateOver.length) {
                        this.notFound("Protestos em Cartórios <small>Não foram localizados protestos registrados em cartório</small>");
                        return;
                    }

                    _.each(iterateOver, (element) => {
                        let kelement = this.kronoosElement("Protestos em Cartórios",
                            "Detalhes a cerca de protestos realizados em cartório",
                            "Foram localizados protestos registrados em cartório.");
                        kelement.behaviourAccurate(true);

                        kelement.table("Nome do Cartório", "Endereço")
                            ($("nome", element).text(), $("endereco", element).text());
                        kelement.table("Protestos", "Telefone", "Cidade")
                            ($("protestos", element).text(), $("telefone", element).text(), $("cidade", element).text());
                        this.append(kelement.element());
                    });
                },
            }, true));
    }

    searchCCF() {
        this.serverCall("SELECT FROM 'SEEKLOC'.'CCF'",
            this.loader("fa-eye", `Buscando por ocorrências de cheques sem fundo para o documento ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj
                },
                success: (data) => {
                    let iterateOver = $("data resposta list > *", data);
                    if (!iterateOver.length) {
                        this.notFound("Cheques sem Fundo em Instituição Bancária <small>Não foram localizados cheques sem fundo em uma instituição bancária.</small>");
                        return;
                    }
                    _.each(iterateOver, (element) => {

                        let bankName = bankCodes[$("banco", element).text()] ||
                            bankCodes[$("banco", element).text().replace(/^0+/, '')];

                        let kelement = this.kronoosElement("Cheques sem Fundo em Instituição Bancária",
                            "Detalhes acerca de cheques sem fundo emitidos",
                            "Foram localizados cheques sem fundo em uma instituição bancária.");
                        kelement.behaviourAccurate(true);

                        if (bankName) {
                            kelement.table("Código Bancário", "Banco", "Agência")
                                ($("banco", element).text(), bankName, $("agencia", element).text());
                        } else {
                            kelement.table("Código Bancário", "Agência")
                                ($("banco", element).text(), $("agencia", element).text());

                        }

                        kelement.table("Qtde. Ocorrências", "Alínea")($("qteOcorrencias", element).text(), $("motivo", element).text());

                        let v1 = moment($("dataUltOcorrencia", element).text(), "DD/MM/YYYY"),
                            v2 = moment($("ultimo", element).text(), "DD/MM/YYYY"),
                            e1 = v1.isAfter(v2) ? v2 : v1,
                            e2 = v1.isAfter(v2) ? v1 : v2;

                        let table = kelement.table(`Primeiro Registro (${e1.fromNow()})`,
                            `Última Ocorrência (${e2.fromNow()})`);
                        table(e1.format("DD/MM/YYYY"), e2.format("DD/MM/YYYY"));
                        this.append(kelement.element());
                    });

                },
            }, true));

    }

    searchCnep() {
        if (!this.cnpj) return;
        this.serverCall("SELECT FROM 'PORTALTRANSPARENCIA'.'CNEP'",
            this.loader("fa-eye", `Verificando cadastro nacional de empresas punidas com o CNPJ ${this.cnpj}.`, {
                data: {
                    documento: this.cnpj
                },
                error: () => this.notFound("Cadastro Nacional de Empresas Punidas <small>Não existem de apontamentos cadastrais</small>"),
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.kronoosElement('Cadastro Nacional de Empresas Punidas',
                        "Existência de apontamentos cadastrais.", 'Portal da transparência, cadastro nacional de empresas punidas.');
                    kelement.behaviourAccurate(true);
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

                    this.append(kelement.element());
                },
            }, true));
    }

    searchExpulsoes() {
        if (!this.cpf) return;
        this.serverCall("SELECT FROM 'PORTALTRANSPARENCIA'.'EXPULSOES'",
            this.loader("fa-eye", `Verificando sanções e expulsões na controladoria geral da união com o CPF ${this.cpf}.`, {
                data: {
                    documento: this.cpf
                },
                error: () => this.notFound("Sanções e expulsões na controladoria geral da união <small>Não existem de apontamentos cadastrais.</small>"),
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.kronoosElement('Sanções e Expulsões na Controladoria Geral da União',
                        "Existência de apontamentos cadastrais.", 'Sanções e expulsões na controladoria geral da união.');

                    kelement.behaviourAccurate(true);

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

                    this.append(kelement.element());
                },
            }, true));
    }

    searchCepim() {
        if (!this.cnpj) return;
        this.serverCall("SELECT FROM 'PORTALTRANSPARENCIA'.'CEPIM'",
            this.loader("fa-eye", `Verificando entidades privadas sem fins lucrativas impedidas com o CNPJ ${this.cnpj}.`, {
                error: () => this.notFound("Entidades privadas sem fins lucrativas impedidas na controladoria geral da união <small>Não existem de apontamentos cadastrais.</small>"),
                data: {
                    documento: this.cnpj
                },
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.kronoosElement('ONGs impedidas na CGU',
                        "Existência de apontamentos cadastrais.", 'Entidades privadas sem fins lucrativas impedidas na controladoria geral da união.');

                    kelement.behaviourAccurate(true);
                    kelement.table("Número do Convênio Siafi", "Situação")(x("NUMERO-DO-CONVENIO-SIAFI"), x("SITUACAO"));
                    kelement.table("Nº Original", "Objeto do Convênio")(x("N-ORIGINAL"), x("OBJETO-DO-CONVENIO"));
                    kelement.table("Orgão Superior", "Concedente")(x("ORGAO-SUPERIOR"), x("CONCEDENTE"));
                    kelement.table("Convenente", "Valor Convênio")(x("CONVENENTE"), `R$ ${x("VALOR-CONVENIO")}`);
                    kelement.table("Valor Liberado", "Publicação")(x("VALOR-LIBERADO"), x("PUBLICACAO"));
                    kelement.table("Início da Vigência", "Fim da Vigência")(x("INICIO-DA-VIGENCIA"), x("FIM-DA-VIGENCIA"));
                    kelement.table("Valor Contrapartida", "Data Última Liberação")(`R$ ${x("VALOR-CONTRAPARTIDA")}`, x("DATA-ULTIMA-LIBERACAO"));
                    kelement.table("valor Última Liberação")(`R$ ${x("VALOR-ULTIMA-LIBERACAO")}`);

                    this.append(kelement.element());
                },
            }, true));
    }

    searchCertidao(nascimento = null, cpf_cnpj = null) {
        cpf_cnpj = cpf_cnpj || this.cpf_cnpj;
        this.serverCall("SELECT FROM 'RFB'.'CERTIDAO'",
            this.loader("fa-eye", `Verificando a situação do documento ${this.cpf_cnpj} junto a receita federal.`, {
                data: {
                    documento: cpf_cnpj,
                    nascimento: nascimento
                },
                success: (data) => {
                    let x = n => $(n, data).text();
                    let kelement = this.kronoosElement(`Situação Cadastral do ${this.cpf ? "CPF" : "CNPJ"} pela Receita Federal`,
                        "Consulta do documento a Receita Federal.", 'Certidão remetida pela Receita Federal.');

                    if (CPF.isValid(cpf_cnpj)) {
                        kelement.table("Nome", "Código Comprovante")(x("nome"), x("codigo-comprovante"));
                        kelement.table("Data Consulta", "Situação")(x("data-consulta"), x("situacao"));
                        kelement.table("Data de Nascimento", "Data da Inscrição")(x("dataNascimento"), x("dataInscricao"));
                    } else {
                        kelement.table("Nome", "CNPJ", "Data de Abertura")
                            (x("nome"), this.cnpj, x("data-abertura"));
                        kelement.table("Data Consulta", "Situação", "Data Situação")
                            (x("data-consulta"), x("situacao"), x("data-situacao"));
                        kelement.table("EFR", "Situação Especial", "Data Situação Especial")
                            (x("efr") || "*******", x("situacao-especial") || "*******", x("data-situacao-especial") || "*******");
                        kelement.table("Natureza Jurídica", "Tipo CNPJ", "Capital Social")
                            (`${$("natureza-juridica", data).attr("codigo")} ${x("natureza-juridica")}`, x("tipo-cnpj"), numeral(parseInt(x("capitalSocial"))).format("$0,0.00"));
                        kelement.table("Atividade Econômica", "E-mail", "Telefone")
                            (`${$("atividade-economica", data).attr("codigo") || ""} ${x("atividade-economica")}`,
                                x("email"), x("telefones"));

                        let v = n => $(`endereco ${n}`, data).text();
                        kelement.list("Endereço")
                            (`${v('logradouro')}, ${v('numero')} ${v('complemento')} - ${v('cep')}, ${v('bairro')}, ${v('municipio')} / ${v('uf')}`);

                        let geocode = `${v('logradouro')}, ${v('numero')} - ${v('bairro')} - ${v('municipio')}, ${v('uf')} - ${v('cep')}`;
                        this.serverCall("SELECT FROM 'KRONOOS'.'GEOCODE'",
                            this.loader("fa-eye", `Localizando para o documento ${this.cpf_cnpj} o endereço inscrito no CEP ${VMasker.toPattern(v('cep'), '99999-999')}.`, {
                                dataType: 'json',
                                data: {
                                    address: geocode
                                },
                                success: geo => this.geocodes.push(geo)
                            }));

                        let atividadesSecundarias = $("atividade-secundaria", data);
                        if (atividadesSecundarias.length) {
                            let atividades = kelement.captionTable("Atividades Secundárias", "CNAE", "Qualificação");
                            atividadesSecundarias.each(function() {
                                atividades($(this).attr("codigo"), $(this).text());
                            });
                        }


                        let socios = $("socio", data);
                        if (socios.length) {
                            let qsa = kelement.captionTable("Quadro Social", "Qualificação", "Nome do Sócio");
                            socios.each(function() {
                                qsa($(this).attr("qualificacao"), $(this).text());
                            });
                        }

                    }

                    kelement.behaviourAccurate(["REGULAR", "ATIVA"].indexOf(x("situacao").split(" ")[0]) === -1);
                    this.append(kelement.element());
                },
            }, true));
    }

    informationQA() {
        let groupContent = _.groupBy(_.map(_.filter(this.kelements), (kelement) => kelement.notation()), (r) => r[0]);
        return _.object(_.keys(groupContent), _.map(groupContent, (n) => _.countBy(n, (i) => i[1])));
    }

    changeResult() {
        if (this._notFoundObject && this._notFoundObject.list.is(':empty')) {
            this._notFoundObject.container.remove();
            this._notFoundObject = null;
            this._notFoundList = null;
        }

        if (this._briefElement && this._briefElement.find("ol").is(':empty')) {
            this._brief = null;
            this._briefElement.remove();
            this._briefElement = null;
        }

        this.firstElement().stageClear();
        let informationQA = this.informationQA();
        if (informationQA.hasNotation && informationQA.hasNotation.behaviourAccurate) {
            this.header.element
                .removeClass("kronoos-hasNotation")
                .removeClass("kronoos-hasntNotation")
                .addClass("kronoos-hasConfirmedNotation");
        } else if (informationQA.hasNotation) {
            this.header.element
                .removeClass("kronoos-hasConfirmedNotation")
                .removeClass("kronoos-hasntNotation")
                .addClass("kronoos-hasNotation");
        } else {
            this.header.element
                .removeClass("kronoos-hasConfirmedNotation")
                .removeClass("kronoos-hasNotation")
                .addClass("kronoos-hasntNotation");
        }

        if (this.titleCanChange) {
            if (informationQA.hasNotation) {
                this.firstElement().title('Constam Apontamentos Cadastrais');
                this.firstElement().subtitle('Há apontamento cadastral registrado no sistema Kronoos.');
                this.firstElement().sidenote("Constam apontamentos cadastrais.");
            } else {
                this.firstElement().title('Não Constam Apontamentos Cadastrais');
                this.firstElement().subtitle('Não há nenhum apontamento cadastral registrado no sistema Kronoos.');
                this.firstElement().sidenote("Não consta nenhum apontamento cadastral.");
            }

        }
        for (let notationType in informationQA) {
            let pieces = [];
            let notationMessage;
            let icon = "exclamation";
            switch (notationType) {
                case "hasNotation":
                    notationMessage = ["possui apontamento", "possuem apontamentos"];
                    break;
                case "hasntNotation":
                    notationMessage = ["não possui apontamento", "não possuem apontamentos"];
                    break;
                default:
                    notationMessage = ["de apontamento desconhecido e", "de apontamentos desconhecidos e"];
            }
            for (let behaviourType in informationQA[notationType]) {
                let behaviourMessage;
                switch (behaviourType) {
                    case "behaviourAccurate":
                        if (notationType === "hasntNotation") icon = "check";
                        else icon = "times";
                        behaviourMessage = [", sem possibilidade da presença de falsos positivos", ", sem possibilidade da presença de falsos positivos"];
                        break;
                    case "behaviourUnstructured":
                        behaviourMessage = ["pendente de verificação por ser desestruturado", "pendentes de verificação por serem desestruturados"];
                        break;
                    case "behaviourUnstructuredHomonym":
                        behaviourMessage = ["pendente de verificação por ser desestruturado e com presença de possíveis homônimos", "pendentes de verificação por serem desestruturados e com presença de possíveis homônimos"];
                        break;
                    case "behaviourHomonym":
                        behaviourMessage = ["pendente de verificação por presença de possíveis homônimos", "pendentes de verificação por presença de possíveis homônimos"];
                        break;
                    default:
                        behaviourMessage = ["pendente de verificação", "pendentes de verificação"];
                }

                let searchMessage;
                if (informationQA[notationType][behaviourType] > 1) {
                    searchMessage = `${informationQA[notationType][behaviourType]} resultados ${notationMessage[1]} ${behaviourMessage[1]}.`;
                } else {
                    searchMessage = `1 resultado ${notationMessage[0]} ${behaviourMessage[0]}.`;
                }
                this.firstElement().stage(icon, searchMessage.replace(/\s+,/, ',')).addClass(`type-${notationType}-${behaviourType}`);
            }
        }

        this.controller.trigger("kronoos::changeResult");
    }

    firstElement() {
        return this.kelements[0];
    }

    kronoosElement(...args) {
        let kelement = this.call("kronoos::element", ...args);
        if (this.kelements.length) kelement.notFound = (...x) => this.notFound(...x);
        kelement.brief = (...args) => this.brief(...args);
        this.kelements.push(kelement);
        kelement.aggregate(() => this.changeResult());
        kelement.behaviourAccurate(false);
        return kelement;
    }

    searchCeis() {
        this.serverCall("SELECT FROM 'PORTALTRANSPARENCIA'.'CEIS'",
            this.loader("fa-eye", `Verificando empresas de pessoas físicas sancionadas pelo documento ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf_cnpj
                },
                error: () => this.notFound("CEIS – Cadastro Nacional de Empresas Inidôneas e Suspensas <small>Não existem apontamentos cadastrais.</small>"),
                success: (data) => {
                    let x = n => $(n, data).text();

                    let kelement = this.kronoosElement('CEIS – Cadastro Nacional de Empresas Inidôneas e Suspensas',
                        "Cadastro Nacional de Empresas Inidôneas e Suspensas de celebrar convênios, contratos de repasse ou termos de parceria com a administração pública federal", "Controladoria Geral da União (CGU)");
                    kelement.behaviourAccurate(true);

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

                    this.append(kelement.element());
                },
            }, true));
    }

    searchMandado(idLog, numeroMandado) {
        this.serverCall("SELECT FROM 'PROCURADOS'.'MANDADO'",
            this.loader("fa-eye", `Verificando mandado de prisão ${numeroMandado}.`, {
                data: {
                    idLog: idLog,
                    numero: numeroMandado
                },
                success: (data) => {
                    let x = n => $(n, data).first().text();
                    let mae = x("genitoras");
                    if (this.mae && mae && this.normalizeName(this.mae) != this.normalizeName(mae)) return;

                    let kelement = this.kronoosElement('Mandado de Prisão',
                        "Existência de apontamentos cadastrais.", 'Mandado de prisão expedido.');

                    if ((!this.mae || !mae) && this.homonymous > 1) kelement.behaviourHomonym(true);
                    else kelement.behaviourAccurate(true);

                    kelement.table("Numero do Mandado", "Data do Mandado")(x("numeroMandado"), x("dataMandado"));
                    kelement.table("Genitora", "Genitor")(x("genitoras"), x("genitores"));
                    kelement.table("Validade", "Orgão Julgador")
                        (x("dataValidade"), `${x("orgaoJulgador nome")} - ${x("orgaoJulgador municipio")} / ${x("orgaoJulgador UF")}`);
                    kelement.table("Síntese da Decisão")(x("sinteseDecisao"));
                    this.append(kelement.element());
                },
            }, true), highPriority);
    }

    searchMandados() {
        /* DEBUG PELO CPF 32078569852 */
        if (!this.cpf || !CPF.isValid(this.cpf)) return;
        this.serverCall("SELECT FROM 'PROCURADOS'.'CONSULTA'",
            this.loader("fa-eye", `Verificando mandados de prisão através do CPF/CNPJ ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf,
                    nome: this.name
                },
                success: (data) => {
                    let idLog = $("idLog", data).text();
                    var ctx = this;
                    $("CNJ > retorno > node", data).each(function() {
                        if ($("pessoa", this).text().toLowerCase() != ctx.name.toLowerCase())
                            return;
                        ctx.searchMandado(idLog, $("numeroMandado", this).text());
                    });
                },
            }, true), lowPriority);
    }

    downloadMarkdown() {
        let htmlContent = this.appendElement
            .children()
            .filter((i, e) => !$(e).hasClass('kronoos-header'))
            .map((i, e) => $(e).html()).toArray().join();

        saveAs(new Blob([toMarkdown(htmlContent)]),
            `${moment().format("YYYY-MM-DD")}-${this.name}-${this.cpf_cnpj}.txt`);
    }

    downloadCSV() {
        let csvString = CSV.stringify(['Partes Contrária', 'Descrição do Tipo de Ação',
            'Número do Processo', 'Fórum / Vara', 'Valor da Causa'
        ], ";");
        let procs = _.map(_.filter(this.kelements, x => !!x.element().data("parsedProc")),
            x => x.element().data("parsedProc"));
        for (let processoElement of procs) {
            csvString += CSV.stringify([
                $("partes parte", processoElement).map((i, e) => `${$(e).attr("tipo")}: ${$(e).text()}`).toArray().join(", "), [$("acao", processoElement).first().text(), $("area", processoElement).first().text()].join(", "),
                $("numero_processo", processoElement).first().text(), [$("foro", processoElement).first().text(), $("vara", processoElement).first().text()].join(", "),
                $("valor_causa", processoElement).first().text()
            ], ";");
        }
        saveAs(new Blob([iconv.encode(csvString, "ISO-8859-1")]), `${moment().format("YYYY-MM-DD")}-${this.name}-${this.cpf_cnpj}.csv`);
    }

    downloadDOCX() {
        let htmlContent = this.appendElement
            .children()
            .filter((i, e) => !$(e).hasClass('kronoos-header'))
            .map((i, e) => $(e).html()).toArray().join();

        saveAs(htmlDocx
            .asBlob(iconv.encode(`<!DOCTYPE html><html><body>${htmlContent}</body></html>`, "ISO-8859-1").toString(), {
                orientation: 'portrait'
            }),
            `${moment().format("YYYY-MM-DD")}-${this.name}-${this.cpf_cnpj}.docx`);
    }

    downloadImage() {
        html2canvas(this.appendElement, {
            background: '#FFFFFF',
            onrendered(canvas) {
                canvas.toBlob(blob =>
                    saveAs(blob, `${moment().format("YYYY-MM-DD")}-${this.name}-${this.cpf_cnpj}.png`),
                    "image/png",
                    0.95);
            }
        });
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
            title: $("<div />").addClass("kronoos-title").text(`Informações - ${this.name}`),
            subtitle: $("<div />").addClass("kronoos-subtitle").text(`${this.cpf ? "CPF" : "CNPJ"}: ${this.cpf_cnpj}${observation}`)
        };
        this.header.container.data("instance", this);
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
            trash: $("<i />").addClass("fa fa-trash"),
            download: $("<i />").addClass("fa fa-cloud-download"),
        };

        this.header.actionElements.download.click((e) => {
            e.preventDefault();
            let modal = this.call("modal");
            modal.gamification("accuracy");
            modal.title("Exportação de Dossiê");
            modal.subtitle("Escolha o formato de exportação do dossiê.");
            modal.paragraph("O dossiê exportado pode perder características de estilo ou não funcionar em todos os programas.");
            let form = modal.createForm();
            let list = form.createList();
            list.add("fa-file-word-o", "DOCX - Microsoft Word 2007 (Windows)").click(e => {
                e.preventDefault();
                this.downloadDOCX();
            });
            // list.add("fa-file-text-o", "Formato de Texto Markdown").click(e => {
            //     e.preventDefault();
            //     this.downloadMarkdown();
            // });
            // list.add("fa-file-image-o", "Arquivo de Imagem Kronoos").click(e => {
            //     e.preventDefault();
            //     this.downloadImage();
            // });
            list.add("fa-file-excel-o", "CSV - Comma-separated values (Excel)").click(e => {
                e.preventDefault();
                this.downloadCSV();
            });
            modal.createActions().cancel();
        });

        this.header.actionElements.push.click((e) => {
            e.preventDefault();
            this.confirm({
                title: `Deseja acompanhar o documento?`,
                subtitle: `Acompanhamento para o ${this.cpf ? "CPF" : "CNPJ"} ${this.cpf_cnpj}.`,
                paragraph: "O sistema irá te informar a respeito de quaisquer novas alterações das informações deste relatório / target.",
            }, () => {
                this.controller.server.call("INSERT INTO 'KRONOOS'.'PUSH'", this.controller.call("error::ajax", {
                    data: {
                        document: this.cpf_cnpj
                    },
                    success: () => {
                        controller.alert({
                            icon: 'pass',
                            title: `Parabéns! O documento ${this.cpf || this.cnpj} está sendo acompanhando.`,
                            subtitle: `Você receberá um e-mail caso ocorra alguma atualização no cadastro de ${this.name}`,
                            paragraph: `Verificaremos diariamente o documento informado ${this.cpf || this.cnpj} em busca de alterações,
                            caso ocorra alguma nós encaminharemos um e-mail para o endereço cadastrado.`
                        });
                    }
                }));
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

        this.call("tooltip", this.header.actions, "Remover")
            .append(this.header.actionElements.trash);
        this.call("tooltip", this.header.actions, "Expandir / Minimizar")
            .append(this.header.actionElements.windowResize);
        this.call("tooltip", this.header.actions, "Download")
            .append(this.header.actionElements.download);
        this.call("tooltip", this.header.actions, "Acompanhar")
            .append(this.header.actionElements.push);
    }

    confirm(...args) {
        this.controller.confirm(...args);
    }

    alert(...args) {
        this.controller.alert(...args);
    }

    parseKronoos(kronoosData) {
        if (!kronoosData) return;

        $("BPQL body item", kronoosData).each((idx, element) => {
            let cpfFilter = $("CPF", element).text().replace(NON_NUMBER, '');
            if (this.cpf && cpfFilter && cpfFilter != this.cpf.replace(NON_NUMBER, '')) {
                return;
            }

            if (cpfFilter && this.cnpj) {
                return;
            }

            let cnpjFilter = $("CNPJ", element).text().replace(NON_NUMBER, '');
            if (this.cnpj && cnpjFilter && cnpjFilter != this.cnpj.replace(NON_NUMBER, '')) {
                return;
            }

            if (cnpjFilter && this.cpf) {
                return;
            }

            let namespace = $("namespace", element).text(),
                [title, description] = NAMESPACE_DESCRIPTION[namespace],
                kelement = this.kronoosElement(title, "Existência de apontamentos cadastrais.", description),
                notes = $("notes node", element),
                source = $("source node", element),
                position = $("position", element),
                insertMethod = "append",
                insertElement = this.appendElement;

            if (cnpjFilter || cpfFilter || this.homonymous <= 1) {
                kelement.behaviourAccurate(true);
            } else {
                kelement.behaviourHomonym(true);
            }

            // if (GET_PHOTO_OF.indexOf(namespace) !== -1) {
            //     // insertMethod = "prepend";
            //     // if (this.header) {
            //     //     insertMethod = "insertAfter";
            //     //     insertElement = this.header.element;
            //     //
            //     // }
            //     this.serverCall("SELECT FROM 'KRONOOS'.'PHOTOS'", {
            //         data: {
            //             name: name
            //         },
            //         dataType: "json",
            //         success: (ret) => {
            //             for (let picture of ret) {
            //                 kelement.picture(picture);
            //                 return;
            //             }
            //         }
            //     });
            // }

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
            searchBar.addClass("minimize").removeClass("full");
        });
    }

    parseProc(proc, article, match) {
        if (this.procElements[proc]) return false;
        let kelement = this.kronoosElement(`Processo Nº ${proc}`,
            "Obtido em recorte de diário oficial.",
            "Foram encontradas informações, confirmação pendente pelo sistema Kronoos.");

        if (this.homonymous > 1) kelement.behaviourUnstructuredHomonym(true);
        else kelement.behaviourUnstructured(true);

        this.procElements[proc] = kelement;
        kelement.paragraph(article.replace(match, `<strong>${match}</strong>`));
        this.append(kelement.element().attr("id", `cnj-${proc.replace(NON_NUMBER, '')}`));
        return true;
    }

    query(query, cpf_cnpj, elements) {
        let key = `${query}.'${cpf_cnpj}'`;
        if (this.cpf_cnpjs[key]) {
            return;
        }

        this.cpf_cnpjs[key] = true;
        elements.push((callback) => this.serverCall(query,
            this.loader("fa-eye", `Capturando dados de conexão através do CPF/CNPJ ${this.cpf_cnpj}.`, {
                data: {
                    documento: cpf_cnpj,
                    cpf: cpf_cnpj,
                    cnpj: cpf_cnpj
                },
                success: (data) => this.generateRelations.appendDocument(data, cpf_cnpj),
                complete: () => callback()
            }, true)));
    }

    emptyChecker() {
        if (!this.kelements.length) {
            let [title, description] = NAMESPACE_DESCRIPTION.clear,
                nelement = this.kronoosElement(title, "Não consta nenhum apontamento cadastral.", description);
            this.titleCanChange = true;
            this.append(nelement.element());
            searchBar.addClass("minimize").removeClass("full");
        }
    }

    kill() {
        this.controller.call("kronoos::ajax::queue::remove", task => {
            if (task.data.parser.uniqid == this.uniqid) {
                if (task.data.call[1].complete) task.data.call[1].complete();
                return true;
            }
            return false;
        });
        for (let xhr of this.xhr)
            if (xhr) xhr.abort();
        if (this.taskGraphTrack) this.taskGraphTrack.kill();
        if (this.taskGraphParallel) this.taskGraphParallel.kill();
    }

    graphTrack() {
        this.taskGraphTrack = async.timesSeries(this.depth, (i, callback) => this.generateRelations.track((data) => {
            let elements = [];
            for (let node of data.nodes) {
                let formatted_document = pad(node.id.length > 11 ? 14 : 11, node.id, '0');
                if (!CPF.isValid(formatted_document) && !CNPJ.isValid(formatted_document)) continue;
                let cpf_cnpj = (CPF.isValid(formatted_document) ? CPF : CNPJ).format(formatted_document);

                this.query("SELECT FROM 'RFB'.'CERTIDAO'", formatted_document, elements);
                this.query("SELECT FROM 'CBUSCA'.'CONSULTA'", formatted_document, elements);
                this.query("SELECT FROM 'CCBUSCA'.'CONSULTA'", formatted_document, elements);
                if (CPF.isValid(formatted_document)) {
                    this.query("SELECT FROM 'FINDER'.'RELATIONS'", formatted_document, elements);
                }

                if (!this.cpf_cnpjs[cpf_cnpj]) {
                    this.cpf_cnpjs[cpf_cnpj] = true;
                    elements.push((cb) => this.serverCall("SELECT FROM 'KRONOOS'.'API'", this.errorAjax(
                        this.loader("fa-eye", `Pesquisando correlações através do nome ${node.label}, documento ${this.cpf_cnpj}.`, {
                            data: {
                                documento: this.cpf_cnpj,
                                name: `"${node.label.replace("\n", "")}"`
                            },
                            success: (data) => {
                                this.call("kronoos::parse", node.label, formatted_document, data, null, "minimized", {
                                    observation: `relacionado ao ${this.cpf ? "CPF" : "CNPJ"} ${this.cpf_cnpj} - ${this.name}.`
                                });
                            },
                            complete: () => cb()
                        }))));
                }
            }
            this.taskGraphParallel = async.parallel(elements, () => callback());
        }), () => {
            this.generateRelations.track((data) => {
                if (!data.nodes.length)
                    return;
                this.networkData = data;
                let [network, node] = this.firstElement().addNetwork(data.nodes, data.edges, {
                    groups: data.groups
                });
                network.on("click", params => {
                    if (!params.nodes[0]) {
                        return;
                    }

                    let doc = pad(params.nodes[0].length > 11 ? 14 : 11, params.nodes[0], '0');
                    if (!CPF.isValid(doc) && !CNPJ.isValid(doc)) {
                        this.alert({
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

    errorAjax(...args) {
        return this.call("error::ajax", ...args);
    }

    searchTjsp() {
        this.serverCall("SELECT FROM 'KRONOOSJURISTEK'.'DATA'",
            this.loader("fa-balance-scale", `Buscando por processos jurídicos no TJSP para ${this.name}, documento ${this.cpf_cnpj}.`, {
                data: {
                    'data': `SELECT FROM 'TJSP'.'PRIMEIRAINSTANCIANOME' WHERE 'NOME_PARTE' = '${this.name.replace("'", "")}'`,
                },
                success: jusSearch => this.juristekCNJ(jusSearch)
            }), lowPriority);
    }

    jusSearch() {
        this.serverCall("SELECT FROM 'JUSSEARCH'.'CONSULTA'",
            this.loader("fa-balance-scale", `Buscando por processos jurídicos para ${this.name}, documento ${this.cpf_cnpj}.`, {
                data: {
                    data: this.name
                },
                success: jusSearch => this.juristek(jusSearch)
            }), lowPriority);
    }

    juristek(jusSearch) {
        /* All fucking data! */
        const CNJ_NUMBER = new RegExp(`(${CNJ_REGEX_TPL})((?!${CNJ_REGEX_TPL}).)*${this.name}`, 'gi');

        let cnjs = {};
        $("BPQL > body snippet", jusSearch).each((idx, article) => {

            let articleText = $(article).text(),
                match = CNJ_NUMBER.exec(articleText);

            if (!match) return;

            let cnj = VMasker.toPattern(match[3].replace(NON_NUMBER, ''), "9999999-99.9999.9.99.9999");
            if (cnjs[cnj]) return;
            cnjs[cnj] = true;
            if (this.procElements[cnj]) return;

            let articleData = articleText.substr(articleText.indexOf(match[0]) + 1);
            let end = articleData.slice(match[0].length - 1).search(/(\,|\.|\!|\-|\n)/);
            let articleShow = articleData.substr(0, match[0].length + end);

            this.serverCall("SELECT FROM 'NATURAL'.'ENTITY_EXTRACTION'",
                this.loader("fa-cube", `Usando inteligência artificial no processo Nº ${cnj} para ${this.cpf_cnpj}.`, {
                    dataType: 'json',
                    method: 'POST',
                    data: {
                        text: articleShow.replace("/", "-")
                    },
                    success: data => {
                        let c1 = data['1-Entity-Tagged-Text'];
                        if (!c1) return;
                        c1 = $.parseHTML(c1);
                        let n1 = this.normalizeName(this.name);
                        if (this.cpf && !$("span", c1).filter((i, e) => this.normalizeName($(e).text()) == n1).length) return;
                        if (!this.parseProc(cnj, articleText, match[0])) return;
                        this.normalizeJuristek(cnj);
                    }
                }));
        });

    }

    normalizeJuristek(cnj) {
        this.serverCall("SELECT FROM 'KRONOOSJURISTEK'.'DATA'",
            this.loader("fa-balance-scale", `Verificando processo Nº ${cnj} para ${this.cpf_cnpj}.`, {
                data: {
                    data: `SELECT FROM 'CNJ'.'PROCESSO' WHERE 'PROCESSO' = '${cnj}'`
                },
                success: ret => this.juristekCNJ(ret, cnj),
                /* melhorar o quesito de erro! */
                error: (jqXHR, ...args) => {
                    let hasNetworkIssue = () => {
                        if (!this.procElements[cnj]) {
                            return;
                        }
                        this.procElements[cnj].subtitle("Informação não estruturada pendente de confirmação humana.");
                        this.procElements[cnj].canDelete();
                    };

                    if (!jqXHR.responseText) {
                        hasNetworkIssue();
                        return;
                    }

                    try {
                        var xml = $.parseXML(jqXHR.responseText);
                        $.bipbopAssert(xml, (type, message, code, push) => {
                            if (!push) {
                                hasNetworkIssue();
                                return;
                            }
                            if (!this.procElements[cnj]) {
                                return;
                            }
                            this.procElements[cnj].remove();
                            delete this.kelements[this.kelements.indexOf(this.procElements[cnj])];
                            delete this.procElements[cnj];
                            this.changeResult();
                        });
                    } catch (err) {
                        hasNetworkIssue();
                    }
                }
            }), lowPriority);

    }

    normalizeName(name) {
        return removeDiacritics(name).toUpperCase().replace(/\s+/, ' ');
    }

    juristekCNJ(ret, cnj = null, findProc = true) {
        let normalizedName = this.normalizeName(this.name);
        let cnjInstance = null;
        let proc = null;
        if (cnj) {
            cnjInstance = this.procElements[cnj];
            let procs = $("processo", ret).filter((i, e) => {
                return $("partes parte", e).filter((x, a) => {
                    let n1 = this.normalizeName($(a).text());
                    return n1 == normalizedName;
                }).length > 0;
            });

            if (!procs.length) {
                cnjInstance.remove();
                delete this.procElements[cnj];
                delete this.kelements[this.kelements.indexOf(cnjInstance)];
                this.changeResult();
                return;
            }

            proc = procs.first();
        } else {
            if (findProc) {
                let procs = $("processo", ret).filter((i, e) => {
                    return $("partes parte", e).filter((x, a) => {
                        let n1 = this.normalizeName($(a).text());
                        return n1 == normalizedName;
                    }).length > 0;
                }).map((index, element) => this.juristekCNJ(element, null, false));
                return;
            }
            proc = ret;
            let numproc = VMasker.toPattern($("numero_processo", proc).first().text().replace(NON_NUMBER, ''), "9999999-99.9999.9.99.9999");
            if (!numproc) numproc = "";
            if (numproc && this.procElements[numproc]) {
                cnjInstance = this.procElements[numproc];
            } else {
                cnjInstance = this.kronoosElement(numproc ? `Processo Nº ${numproc}` : "Processo Jurídico",
                    "Obtido em recorte de diário oficial.",
                    "Foram encontradas informações, confirmação pendente.");
                this.procElements[numproc] = cnjInstance;
                this.append(cnjInstance.element().attr("id", `cnj-${proc.replace(NON_NUMBER, '')}`));
            }
        }

        if (!cnjInstance) return;
        if (!proc) return;

        cnjInstance.clear();
        cnjInstance.element().data("parsedProc", proc);

        let urlProcesso,
            getNode = (x) => $(x, proc).first().text(),
            partes = $("partes parte", proc),
            andamentos = $("andamentos andamento", proc),
            pieces = _.pairs({
                "Valor Causa": getNode("valor_causa"),
                "Foro": getNode("foro"),
                "Vara": getNode("vara"),
                "Comarca": getNode("comarca"),
                "Número Antigo": getNode("numero_antigo"),
                "Número Processo": getNode("numero_processo"),
                "Autuação": getNode("autuacao"),
                "Localização": getNode("localizacao"),
                "Ação": getNode("acao"),
                "Área": getNode("area"),
                "Situação": getNode("situacao"),
                "Observação": getNode("observacao"),
                "Classe": getNode("classe"),
                "Distribuição": getNode("distribuicao"),
                "Acesso": ((urlProcesso = getNode("url_processo")) ? $("<a />").attr({
                    href: urlProcesso,
                    target: '_blank'
                }).text("Acessar Processo") : null)
            });


        cnjInstance.subtitle("Existência de apontamentos cadastrais.");
        cnjInstance.sidenote("Participação em processo jurídico.");

        if (this.homonymous <= 1) {
            cnjInstance.behaviourAccurate(true);
        } else {
            cnjInstance.behaviourHomonym(true);
        }


        let validPieces = _.filter(pieces, (t) => {
            if (!t[1]) return false;
            return !/^\s*$/.test(t[1]);
        });

        let [keys, values] = _.unzip(validPieces);


        for (let i = 0; i < keys.length; i += 2) {
            cnjInstance.table(keys[i], keys[i + 1])(values[i], values[i + 1]);
        }

        if (partes.length) {
            let kparts = cnjInstance.list("Partes");
            partes.each((idx) => {
                let node = partes.eq(idx);
                kparts(`${node.attr("tipo")} - ${node.text()}`);
            });
        }
    }

    append(...args) {
        return this.appendElement.append(...args);
    }

}
