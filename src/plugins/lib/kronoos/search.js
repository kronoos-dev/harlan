import {
    CPF,
    CNPJ
} from "cpf_cnpj";

import async from "async";
import _ from "underscore";
import VMasker from 'vanilla-masker';

var removeDiacritics = require('diacritics').remove;

const CNJ_REGEX_TPL = '(\\s|^)(\\d{7}\\-?\\d{2}.?\\d{4}\\.?\\d{1}\\.?\\d{2}\\.?\\d{4})(\\s|$)';
const CNJ_REGEX = new RegExp(CNJ_REGEX_TPL);
const NON_NUMBER = /[^\d]/g;
const R_EARTH = 6378137;
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
    'clear': ['Não Constam Apontamentos Cadastrais', 'Não há nenhum apontamento cadastral registrado no sistema Kronoos.'],
};

const BACKGROUND_IMAGES = {
    calculator: "/images/bg/kronoos/photodune-11794453-desk-office-business-financial-accounting-calculate-l.jpg",
    notebook: "/images/bg/kronoos/photodune-13159493-close-up-of-womans-hand-using-laptop-with-notebook-l.jpg",
    officeStore: "/images/bg/kronoos/photodune-4129670-library-dossier-office-store-interior-full-of-indexcases-indexbox-files-l.jpg"
};

module.exports = function(controller) {

    var xhr = [],
        photos = [],
        registered,
        backgroundTimeout,
        mapQueue,
        photosQueue;

    const INPUT = $("#kronoos-q");
    const SEARCH_BAR = $(".kronoos-application .search-bar");

    var clearAll;
    controller.registerCall("kronoos::clearAll", clearAll = () => {
        if (mapQueue) {
            mapQueue.kill();
        }
        if (photosQueue) {
            photosQueue.kill();
        }
        photosQueue = null;
        mapQueue = null;
        clearInterval(registered);
        clearTimeout(backgroundTimeout);

        if (xhr) {
            for (let ajax of xhr) {
                ajax.abort();
                /* Default Status */
            }
        }

        xhr = [];
        photos = [];

        SEARCH_BAR.css("background-image", `url(${BACKGROUND_IMAGES.notebook})`);
        $(".kronoos-application .status-message").remove();
        $(".kronoos-result").empty();
        SEARCH_BAR.addClass("full").removeClass("minimize");
    });

    $("#kronoos-action").submit((e) => {
        e.preventDefault();

        clearAll();

        let document = INPUT.val();

        if (!CPF.isValid(document) && !CNPJ.isValid(document)) {
            toastr.error("O documento informado não é um CPF ou CNPJ válido.",
                "Preencha um CPF ou CNPJ válido para poder realizar a consulta Kronoos");
            return;
        }

        xhr.push(controller.server.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-user", `Capturando dados de identidade através do documento ${document}.`, {
                data: {
                    documento: document
                },
                success: (ret) => {
                    controller.call("kronoos::search", document, $("BPQL > body > nome", ret).text());
                }
            }))));
    });

    controller.registerCall("kronoos::parse", (name, document, kronoosData, cbuscaData, jusSearch, procs) => {
        $("BPQL body item", kronoosData).each((idx, element) => {
            let namespace = $("namespace", element).text(),
                [title, description] = NAMESPACE_DESCRIPTION[namespace],
                kelement = controller.call("kronoos::element", title, "Existência de apontamentos cadastrais.", description),
                notes = $("notes node", element),
                source = $("source node", element),
                position = $("position", element),
                insertMethod = "append";

            if (GET_PHOTO_OF.indexOf(namespace) !== -1) {
                insertMethod = "prepend";
                controller.server.call("SELECT FROM 'KRONOOSUSER'.'PHOTOS'", {
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

            $(".kronoos-result")[insertMethod](kelement.element());
            SEARCH_BAR.addClass("minimize").removeClass("full");
        });

        for (let proc in procs) {
            let jelement = controller.call("kronoos::element", `Processo CNJ ${proc}`, "Aguarde enquanto o sistema busca informações adicionais.",
                "Foram encontradas informações, confirmação pendente.");
            let [article, match] = procs[proc];
            jelement.paragraph(article.replace(match, `<strong>${match}</strong>`));
            $(".kronoos-result").append(jelement.element().attr("id", `cnj-${proc.replace(NON_NUMBER, '')}`));
        }

        if (!$(".kronoos-element-container").length) {
            return;
        }
        var m = moment();
        $(".kronoos-element-container")
            .first()
            .data("instance")
            .header(document, name, m.format("DD/MM/YYYY"), m.format("H:mm:ss"));
    });

    controller.registerCall("kronoos::juristek::cnj", (cnj, name, document, ret) => {
        let normalizeName = (name) => {
                return removeDiacritics(name).toUpperCase().replace(/\s+/, ' ');
            },
            cnjInstance = $(`#cnj-${cnj.replace(NON_NUMBER, '')}`).data("instance"),
            normalizedName = normalizeName(name),
            procs = $("processo", ret).filter(function() {
                return $("partes parte", this).filter(function() {
                    return normalizeName($(this).text()) == normalizedName;
                }).length;
            });

        if (!procs.length) {
            cnjInstance.element().remove();
            return;
        }

        cnjInstance.element().find("p").remove();

        let proc = procs.first(),
            partes = proc.find("partes parte"),
            andamentos = proc.find("andamentos andamento"),
            pieces = _.pairs({
                "Valor Causa": proc.find("valor_causa").text(),
                "Foro": proc.find("foro").text(),
                "Vara": proc.find("vara").text(),
                "Comarca": proc.find("comarca").text(),
                "Número Antigo": proc.find("numero_antigo").text(),
                "Número Processo": proc.find("numero_processo").text(),
                "Autuação": proc.find("autuacao").text(),
                "Localização": proc.find("localizacao").text(),
                "Ação": proc.find("acao").text(),
                "Área": proc.find("area").text(),
                "Situação": proc.find("situacao").text(),
                "Observação": proc.find("observacao").text(),
                "Classe": proc.find("classe").text(),
                "Distribuição": proc.find("distribuicao").text(),
            });


        cnjInstance.subtitle("Existência de apontamentos cadastrais.");
        cnjInstance.sidenote("Participação em processo jurídico.");

        let validPieces = _.filter(pieces, (t) => {
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

        if (andamentos.length) {
            let kparts = cnjInstance.list("Andamentos");
            andamentos.each((idx) => {
                kparts(`${andamentos.eq(idx).find("data").text()} - ${andamentos.eq(idx).find("descricao").text()}`);
            });
        }
    });

    controller.registerCall("kronoos::juristek", (name, document, kronoosData, cbuscaData, jusSearch) => {
        /* All fucking data! */
        var procs = {};
        const CNJ_NUMBER = new RegExp(`(${CNJ_REGEX_TPL})((?!${CNJ_REGEX_TPL}).)*${name}`, 'gi');

        $(jusSearch).find("BPQL > body article").each((idx, article) => {

            let articleText = $(article).text(),
                match = CNJ_NUMBER.exec(articleText);

            if (!match) {
                return;
            }

            procs[VMasker.toPattern(match[3].replace(NON_NUMBER, ''), "9999999-99.9999.9.99.9999")] = [articleText, match[0]];
        });

        controller.call("kronoos::parse", name, document, kronoosData, cbuscaData, jusSearch, procs);

        for (let cnj in procs) {
            xhr.push(controller.server.call("SELECT FROM 'JURISTEK'.'KRONOOS'",
                controller.call("kronoos::status::ajax", "fa-balance-scale", `Verificando processo CNJ ${cnj} para ${document}.`, {
                    data: {
                        data: `SELECT FROM 'CNJ'.'PROCESSO' WHERE 'PROCESSO' = '${cnj}'`
                    },
                    success: (ret) => {
                        controller.call("kronoos::juristek::cnj", cnj, name, document, ret);
                    },
                    error: () => {
                        $(`#cnj-${cnj.replace(NON_NUMBER, '')}`).remove();
                    }
                })));

        }
    });

    controller.registerCall("kronoos::jussearch", (name, document, kronoosData, cbuscaData) => {
        var run = false;
        SEARCH_BAR.css("background-image", `url(${BACKGROUND_IMAGES.officeStore})`);
        backgroundTimeout = setTimeout(() => {
            run = true;
            controller.call("kronoos::smartBackground", cbuscaData);
        }, 10000);
        xhr.push(controller.server.call("SELECT FROM 'JUSSEARCH'.'CONSULTA'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-balance-scale", `Buscando por processos jurídicos para ${name} ${document}.`, {
                data: {
                    data: name
                },
                success: (ret) => {
                    if (!run) {
                        clearTimeout(backgroundTimeout);
                        controller.call("kronoos::smartBackground", cbuscaData);
                    }
                    controller.call("kronoos::juristek", name, document, kronoosData, cbuscaData, ret);
                }
            }))));
    });

    controller.registerCall("kronoos::ccbusca", (name, document, kronoosData) => {
        xhr.push(controller.server.call("SELECT FROM 'CCBUSCA'.'CONSULTA'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-bank", `Acessando bureau de crédito para ${name} ${document}.`, {
                data: {
                    documento: document,
                },
                success: (ret) => {
                    controller.call("kronoos::jussearch", name, document, kronoosData, ret);
                }
            }))));
    });

    controller.registerCall("kronoos::search", (document, name) => {
        xhr.push(controller.server.call("SELECT FROM 'KRONOOSUSER'.'API'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-user", `Pesquisando correlações através do nome ${name}, documento ${document}.`, {
                data: {
                    documento: document,
                    name: `"${name}"`
                },
                success: (ret) => {
                    controller.call("kronoos::ccbusca", name, document, ret);
                }
            }))));
    });

    var smartBackground = function() {
        return setInterval(function() {
            if (!photos.length) {
                return;
            }
            SEARCH_BAR.css("background-image", `url(${photos[Math.floor(Math.random() * photos.length)]})`);
        }, 15000);
    };

    controller.registerCall("kronoos::smartBackground", (cbuscaData) => {
        photosQueue = async.queue(function(picture, callback) {
            if (picture.width < SEARCH_BAR.width() || picture.height < SEARCH_BAR.height()) {
                callback();
                return;
            }


            let img = new Image();
            img.onload = function() {
                callback();
                if (this.width >= SEARCH_BAR.width() && this.height >= SEARCH_BAR.height()) {
                    photos.push(picture.photo_file_url);
                }
            };
            img.src = picture.photo_file_url;
        }, 2);

        mapQueue = async.queue(function(task, callback) {
            var lat, lng;
            $.getJSON({
                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                data: {
                    sensor: false,
                    address: `CEP ${task}, Brazil`
                },
                success: (data, textStatus) => {
                    if (textStatus !== "success" || !data.results.length) {
                        return;
                    }
                    lat = data.results[0].geometry.location.lat;
                    lng = data.results[0].geometry.location.lng;
                },
                complete: () => {
                    if (!lat || !lng) {
                        callback();
                        return;
                    }

                    $.ajax("http://www.panoramio.com/map/get_panoramas.php", {
                        method: "GET",
                        dataType: "jsonp",
                        data: {
                            "set": "full",
                            "from": "0",
                            "to": "10",
                            "minx": lng + (-200 / (R_EARTH * Math.cos(Math.PI * lat / 180))) * (180 / Math.PI),
                            "miny": lat + (-200 / R_EARTH) * (180 / Math.PI),
                            "maxx": lng + (200 / (R_EARTH * Math.cos(Math.PI * lat / 180))) * (180 / Math.PI),
                            "maxy": lat + (200 / R_EARTH) * (180 / Math.PI),
                            "size": "original",
                            "mapfilter": "true"
                        },
                        success: (ret) => {
                            for (let picture of ret.photos.slice(0, 10)) {
                                photosQueue.push(picture);
                                if (!registered) {
                                    registered = smartBackground();
                                }
                            }

                        },
                        complete: () => {
                            callback();
                        }
                    });
                }
            });
        }, 2);

        mapQueue.drain = () => {
            if (!photos.length) {
                SEARCH_BAR.css("background-image", `url(${BACKGROUND_IMAGES.calculator})`);
            }
        };

        var runnedAddresses = [];
        $($("endereco cep", cbuscaData).get().reverse()).each((idx, element) => {
            let cep = $(element).text().replace(NON_NUMBER, '');
            if (/^\s*$/.test(cep) || runnedAddresses.indexOf(cep) != -1) {
                return;
            }

            runnedAddresses.push(cep);
            mapQueue.push(cep);
        });
    });

};
