import {
    CPF,
    CNPJ
} from "cpf_cnpj";
import async from "async";
import _ from "underscore";

const CNJ_REGEX_TPL = '(\\s|^)(\\d{7}\\-?\\d{2}.?\\d{4}\\.?\\d{1}\\.?\\d{2}\\.?\\d{4})(\\s|$)';
const CNJ_REGEX = new RegExp(CNJ_REGEX_TPL);
const NON_NUMBER = /[^\d]/g;

module.exports = function(controller) {

    const INPUT = $("#kronoos-q");

    $("#kronoos-action").submit((e) => {
        e.preventDefault();

        let document = INPUT.val();

        if (!CPF.isValid(document) && !CNPJ.isValid(document)) {
            toastr.error("O documento informado não é um CPF ou CNPJ válido.",
                "Preencha um CPF ou CNPJ válido para poder realizar a consulta Kronoos");
            return;
        }

        controller.server.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-user", `Capturando dados de identidade através do documento ${document}.`, {
                data: {
                    documento: document
                },
                success: (ret) => {
                    controller.call("kronoos::search", document, $("BPQL > body > nome", ret).text());
                }
            })));
    });

    controller.registerCall("kronoos::parse", (name, document, kronoosData, cbuscaData, jusSearch, procs) => {

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

        debugger;
        controller.call("kronoos::parse", name, document, kronoosData, cbuscaData, jusSearch, procs);

        for (let cnj in procs) {
            controller.server.call("SELECT FROM 'JURISTEK'.'KRONOOS'", controller.call("error::ajax",
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
        controller.server.call("SELECT FROM 'JUSSEARCH'.'CONSULTA'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-balance-scale", `Buscando por processos jurídicos para ${name} ${document}.`, {
                data: {
                    data: name
                },
                success: (ret) => {
                    controller.call("kronoos::juristek", name, document, kronoosData, cbuscaData, ret);
                }
            })));
    });

    controller.registerCall("kronoos::ccbusca", (name, document, kronoosData) => {
        controller.server.call("SELECT FROM 'CCBUSCA'.'CONSULTA'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-bank", `Acessando bureau de crédito para ${name} ${document}.`, {
                data: {
                    documento: document,
                },
                success: (ret) => {
                    controller.call("kronoos::jussearch", name, document, kronoosData, ret);
                }
            })));
    });

    controller.registerCall("kronoos::search", (document, name) => {
        controller.server.call("SELECT FROM 'KRONOOSUSER'.'API'", controller.call("error::ajax",
            controller.call("kronoos::status::ajax", "fa-user", `Pesquisando correlações através do nome ${name}, documento ${document}.`, {
                data: {
                    documento: document,
                    name: name
                },
                success: (ret) => {
                    controller.call("kronoos::ccbusca", name, document, ret);
                }
            })));
    });

};
