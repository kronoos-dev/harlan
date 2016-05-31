import {
    CPF,
    CNPJ
} from "cpf_cnpj";
import async from "async";
import _ from "underscore";

const CNJ_REGEX_TPL = '(\\s|^)(\\d{7}\\-?\\d{2}.?\\d{4}\\.?\\d{1}\\.?\\d{2}\\.?\\d{4})(\\s|$)';
const CNJ_REGEX = new RegExp(CNJ_REGEX_TPL);
const NON_NUMBER = /[^\d]/g;
const R_EARTH = 6378137;
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
    const SEARCH_BAR = $(".search-bar");

    var clearAll = () => {
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

        xhr = [];
        photos = [];

        if (xhr) {
            for (let ajax of xhr) {
                ajax.abort();
                /* Default Status */
            }
        }

        SEARCH_BAR.css("background-image", `url(${BACKGROUND_IMAGES.notebook})`);
        $(".status-message").remove();
        $(".result").empty();
        $(".search-bar").addClass("search-bar").removeClass("minimize");
    };

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

    });

    controller.registerCall("kronoos::juristek::cnj", (cnj, ret) => {

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

            procs[match[3].replace(NON_NUMBER, '')] = articleText;
        });

        controller.call("kronoos::parse", name, document, kronoosData, cbuscaData, jusSearch, procs);

        for (let cnj in procs) {
            xhr.push(controller.server.call("SELECT FROM 'JURISTEK'.'KRONOOS'",
                controller.call("kronoos::status::ajax", "fa-balance-scale", `Verificando processo CNJ ${cnj} para ${document}.`, {
                    data: {
                        data: `SELECT FROM 'CNJ'.'PROCESSO' WHERE 'PROCESSO' = '${cnj}'`
                    },
                    success: (ret) => {
                        controller.call("kronoos::juristek::cnj", cnj, ret);
                    }
                })));

        }
    })

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
                    name: name
                },
                success: (ret) => {
                    controller.call("kronoos::ccbusca", name, document, ret);
                }
            }))));
    });

    var smartBackground = function () {
        return setInterval(function() {
            if (!photos.length) {
                return;
            }
            SEARCH_BAR.css("background-image", `url(${photos[Math.floor(Math.random() * photos.length)]})`);
        }, 15000);
    };

    controller.registerCall("kronoos::smartBackground", (cbuscaData) => {
        photosQueue = async.queue(function(picture, callback) {
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
                    })
                }
            });
        }, 2);

        mapQueue.drain = () => {
            if (!photos.length) {
                SEARCH_BAR.css("background-image", `url(${BACKGROUND_IMAGES.calculator})`);
            }
        }

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
