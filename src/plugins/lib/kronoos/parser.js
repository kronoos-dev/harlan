import { CPF, CNPJ } from 'cpf_cnpj';
import async from "async";
import _ from "underscore";
import pad from 'pad';
import VMasker from 'vanilla-masker';

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
    'sinesp': ['Mandado de Prisão', 'Mandado de prisão expedido.'],
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
        // this.searchMandado();
        this.searchBovespa();
        this.emptyChecker();

        let m = moment();
        this.kelements[0].header(this.cpf_cnpj, name, m.format("DD/MM/YYYY"), m.format("H:mm:ss"));

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
            row["Data de Nascimento"] =
                moment(dtNascimento.text(), "YYYYMMDD").format("DD/MM/YYYY");
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
    };

    cbuscaEnderecos(cbuscaData) {
        let enderecos = $("enderecos endereco", cbuscaData);
        if (!enderecos.length) return;
        let klist = this.kelements[0].list("Endereço");
        enderecos.each(function () {
            let v = x => $(x, this).text();
            klist(`${v('tipo')} ${v('logradouro')}, ${v('numero').replace(/^0+/, '')} ${v('complemento')} - ${v('cep')}, ${v('bairro')}, ${v('cidade')} / ${v('estado')}`);
        });
    };

    showCBusca(cbuscaData) {
        this.cbuscaMae(cbuscaData);
        this.cbuscaTelefone(cbuscaData);
        this.cbuscaEnderecos(cbuscaData);
    }

    searchBovespa() {
        let [title, description] = NAMESPACE_DESCRIPTION.bovespa,
        kelement = this.controller.call("kronoos::element", title, "Existência de apontamentos cadastrais.", description);
    }

    searchMandado() {
        if (!this.cpf || !CPF.isValid(this.cpf)) return;
        this.controller.server.call("SELECT FROM 'PROCURADOS'.'CONSULTA'",
            this.controller.call("kronoos::status::ajax", "fa-eye", `Verificando mandados de prisão através do CPF/CNPJ ${this.cpf_cnpj}.`, {
                data: {
                    documento: this.cpf
                },
                success: (data) => {
                    let [title, description] = NAMESPACE_DESCRIPTION.sinesp,
                    kelement = this.controller.call("kronoos::element", title, "Existência de apontamentos cadastrais.", description);

                    /*  */

                },
            }, true));
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
                this.kelements[0].addNetwork(data.nodes, data.edges, {
                    groups: data.groups
                });
            });
        });
    }
}
