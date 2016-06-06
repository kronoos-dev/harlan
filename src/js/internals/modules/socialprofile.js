import {
    CPF,
    CNPJ
} from 'cpf_cnpj';
import VMasker from 'vanilla-masker';
import e from '../library/server-communication/exception-dictionary';
import emailRegex from 'email-regex';
import {
    titleCase
} from 'change-case';
import hashObject from 'hash-object';
import _ from 'underscore';
const detect = require('detect-gender');

const removeDiacritics = require('diacritics').remove,
    corrigeArtigos = (str) => {
        _.each([
            'o', 'os', 'a', 'as', 'um', 'uns', 'uma', 'umas',
            'a', 'ao', 'aos', 'a', 'as',
            'de', 'do', 'dos', 'da', 'das', 'dum', 'duns', 'duma', 'dumas',
            'em', 'no', 'nos', 'na', 'nas', 'num', 'nuns', 'numa', 'numas',
            'por', 'per', 'pelo', 'pelos', 'pela', 'pelas'
        ], (art) => {
            str = str.replace(new RegExp(`\\s${art}\\s`, 'ig'), ` ${art} `);
        });
        return str;
    };


module.exports = (controller) => {

    controller.registerTrigger("findDatabase::instantSearch", "socialprofile", function(args, callback) {
        let [text, modal] = args;
        let isCPF = CPF.isValid(text);

        if (!isCPF && !CNPJ.isValid(text)) {
            callback();
            return;
        }

        modal.item(`Análise para o documento ${(isCPF ? CPF: CNPJ).format(text)}`,
                "Obtenha informações detalhadas para o documento.",
                "Verifique telefone, e-mails, endereços e muito mais através da análise Harlan.")
            .addClass("socialprofile")
            .click(function() {
                controller.call("socialprofile", text);
            });
        callback();
    });


    var askBirthday = (stringDocument, callback) => {
        let modal = controller.call("modal");
        modal.title("Qual a data de nascimento?");
        modal.subtitle(`Será necessário que informe a data de nascimento para o documento ${stringDocument}.`);
        modal.paragraph("Essa verficação adicional é requerida em alguns casos para evitar pesquisas desncessárias e fraudes.");
        let form = modal.createForm(),
            nasc = form.addInput("nasc", "type", "Nascimento (dia/mês/ano)").mask("00/00/0000");

        form.element().submit((e) => {
            e.preventDefault();
            let birthday = nasc.val();
            if (!moment(birthday, "DD/MM/YYYY").isValid()) {
                nasc.addClass("error");
                return;
            }
            modal.close();
            callback(birthday);
        });

        form.addSubmit("send", "Submeter");

        modal.createActions().cancel();
    };

    var openEmail = () => {
        return (e) => {
            e.preventDefault();
        };
    };

    var openPhone = () => {
        return (e) => {
            e.preventDefault();
        };
    };

    var openAddress = () => {
        return (e) => {
            e.preventDefault();
        };
    };

    var buildReport = (document, name, ccbusca = null, results = [], specialParameters = {}) => {
        let report = controller.call("report"),
            isCPF = CPF.isValid(document);
        report.title(corrigeArtigos(titleCase(name)));
        report.subtitle(`Informações relacionadas ao documento
            ${(isCPF ? CPF : CNPJ).format(document)}.`);

        report.paragraph("Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.");
        var timeline = report.timeline();
        for (let i = 0; i < 5; i++) {
            timeline.add(null, "Pellentesque habitant morbi tristique senectus et netus.", "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.", [
                ["fa-folder-open", "Abrir", () => {
                    /* Abrir ! */
                }],
                ["fa-info-circle", "Sobre", () => {
                    /* Vender a informação aqui de maneira TOP! */
                }]
            ]).addClass("profile");
        }

        if (ccbusca) {
            report.paragraph("Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.");
            let newMark = report.markers();
            $("BPQL > body telefones > telefone", ccbusca).each((idx, element) => {
                let ddd = $("ddd", element).text(),
                    numero = $("numero", element).text();
                if (!/^\d{2}$/.test(ddd) || !/^\d{8,9}$/.test(numero)) {
                    return /* void */;
                }
                newMark("fa-phone", `(${ddd}) ${VMasker.toPattern(numero, "9999-99999")}`, openPhone(ddd, numero, document));
            });

            $("BPQL > body emails > email > email", ccbusca).each((idx, element) => {
                let email = $(element).text();
                if (!emailRegex({
                        exact: true
                    }).test(email)) {
                    return /* void */;
                }
                newMark("fa-at", email, openEmail(email, document));
            });

            var addresses = {};
            $("BPQL > body enderecos > endereco", ccbusca).each((idx, element) => {
                let cidade = corrigeArtigos(titleCase($("cidade", element).text().replace(/\s+/, ' ').trim())),
                    estado = $("estado", element).text().replace(/\s+/, ' ').trim().toUpperCase(),
                    cep = $("cep", element).text();

                if (/^\s*$/.test(cidade) || /^\s*$/.test(estado) || !/^\d{8}$/.test(cep)) {
                    return /* void */;
                }

                let obj = {
                        cep: cep,
                        cidade: removeDiacritics(cidade.toUpperCase()),
                        estado: estado,
                    },
                    hash = hashObject(obj);

                if (addresses[hash]) {
                    return /* void */;
                }

                addresses[hash] = true;

                newMark("fa-map", `${cidade}, ${estado} - ${VMasker.toPattern(cep, "99999-999")}`, openAddress(element, ccbusca, document));
            });
        }

        var game = report.gamification("silhouette").addClass(isCPF ? "cpf" : "cnpj");
        detect(name.split(" ")[0]).then((gender) => {
            debugger;
            if (gender === 'female') {
                game.addClass("people-2");
            }
        });

        $(".app-content").append(report.element());
    };

    var ccbusca = (document, name, results = [], specialParameters = {}) => {
        controller.serverCommunication.call("SELECT FROM 'CCBUSCA'.'CONSULTA'",
            controller.call("loader::ajax", controller.call("error::ajax", {
                data: {
                    documento: document
                },
                success: (ret) => {
                    buildReport(document, name, ret, results, specialParameters);
                },
                bipbopError: (exceptionType, exceptionMessage, exceptionCode) => {
                    buildReport(document, name, null, results, specialParameters);
                    controller.call("error::server", exceptionType, exceptionMessage, exceptionCode);
                }
            })));
    };

    controller.registerTrigger("mainSearch::submit", "socialprofile", (document, callback) => {
        callback();
        if (CPF.isValid(document) || CNPJ.isValid(document)) {
            controller.call("socialprofile", document, callback);
        }
    });

    controller.registerCall("socialprofile", (document, specialParameters = {}, results = []) => {
        let isCPF = CPF.isValid(document);

        /* Social Profile é para CPF ou CNPJ */
        if (!isCPF && !CNPJ.isValid(document)) {
            toastr.error("O documento inserido não é um CPF ou CNPJ válido.");
            return;
        }

        controller.server.call("SELECT FROM 'BIPBOPJS'.'CPFCNPJ'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                data: $.extend({
                    documento: document
                }, specialParameters),
                success: (ret) => {
                    ccbusca(document, $("BPQL > body nome", ret).text(), results, specialParameters);
                },
                bipbopError: (exceptionType, exceptionMessage, exceptionCode) => {
                    if (isCPF && exceptionType == "ExceptionDatabase" &&
                        exceptionCode == e.ExceptionDatabase.missingArgument) {
                        askBirthday(CPF.format(document), (birthday) => {
                            controller.call("socialprofile", document, $.extend({}, specialParameters, {
                                nascimento: birthday
                            }), results);
                        });
                        return;
                    }
                    controller.call("error::server", exceptionType, exceptionMessage, exceptionCode);
                }
            })));
    });

};
