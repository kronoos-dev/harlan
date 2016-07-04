import {
    CPF,
    CNPJ
} from 'cpf_cnpj';
import VMasker from 'vanilla-masker';
import e from '../library/server-communication/exception-dictionary';
import emailRegex from 'email-regex';
import {
    camelCase,
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

    var openEmail = (report, email, document) => {
        return (e) => {
            e.preventDefault();
            var modal = controller.call("modal");
            modal.createActions.cancel();
        };
    };

    var openPhone = (report, ddd, numero, document) => {
        return (e) => {
            e.preventDefault();
            var modal = controller.call(
                "confirm",
                {
                    title: "Você deseja realmente ligar?",
                    subtitle: `Uma ligação será realizada para o número ${ddd} ${numero}`
                },
                () => controller.call("softphone::call", ddd+numero)
            );
        };
    };

    var openAddress = (report, filterCep, ccbusca, document) => {
        var results = [];
        return function(e) {
            e.preventDefault();

            if (results.length) {
                $(this).removeClass("enabled");
                for (let result of results) {
                    result.element().remove();
                }

                results = [];
                return;
            }
            $(this).addClass("enabled");
            $("BPQL > body enderecos > endereco", ccbusca).each((i, element) => {
                let cep = $("cep", element).text().trim();
                if (filterCep && filterCep != cep) {
                    return /* void */;
                }

                let obj = {},
                    result = report.result(),
                    addItem = (key, value) => {
                        if (!value || /^\s*$/.test(value)) {
                            return;
                        }
                        obj[camelCase(removeDiacritics(key))] = value;
                        return result.addItem(key, value);
                    };

                results.push(result);
                addItem("Endereco", `${$("tipo", element).text().trim()} ${$("logradouro", element).text().trim()}`.trim());
                addItem("Número", $("numero", element).text().trim().replace(/^0+/, ''));
                addItem("Complemento", $("complemento", element).text().trim());
                addItem("Bairro", $("bairro", element).text().trim());
                addItem("CEP", cep);
                addItem("Bairro", $("bairro", element).text().trim());
                addItem("Cidade", $("cidade", element).text().trim());
                addItem("Estado", $("estado", element).text().trim());

                let image = new Image(),
                    imageAddress = "http://maps.googleapis.com/maps/api/staticmap?" + $.param({
                        "scale": "1",
                        "size": "600x150",
                        "maptype": "roadmap",
                        "format": "png",
                        "visual_refresh": "true",
                        "markers": "size:mid|color:red|label:1|" + _.values(obj).join(", ")
                    });

                image.onload = () => {
                    result.addItem().addClass("map").append(
                        $("<a />").attr({
                            "href": "https://www.google.com/maps?" + $.param({
                                q: _.values(obj).join(", ")
                            }),
                            "target": "_blank"
                        }).append($("<img />").attr("src", imageAddress)));
                };

                image.src = imageAddress;
            });
        };
    };

    var buildReport = (document, name, ccbusca = null, results = [], specialParameters = {}) => {
        let report = controller.call("report"),
            isCPF = CPF.isValid(document);
        report.title(corrigeArtigos(titleCase(name)));
        report.subtitle(`Informações relacionadas ao documento
            ${(isCPF ? CPF : CNPJ).format(document)}.`);

        let timeline = report.timeline(),
            paragraph = report.paragraph("Foram encontrados os seguintes apontamentos cadatrais para o documento em nossos bureaus de crédito, você pode clicar sobre uma informação para obter mais dados a respeito ou realizar uma ação, como enviar um e-mail, SMS, iniciar uma ligação. Bem como apontar inconsistências cadastrais.").hide(),
            m = report.markers(),
            newMark = (...args) => {
                paragraph.show();
                m(...args);
            };

        controller.trigger("socialprofile::queryList", {
            report: report,
            timeline: timeline,
            name: name,
            ccbusca: ccbusca,
            document: document,
            mark: newMark
        });

        if (ccbusca) {
            $("BPQL > body telefones > telefone", ccbusca).each((idx, element) => {
                let ddd = $("ddd", element).text(),
                    numero = $("numero", element).text();
                if (!/^\d{2}$/.test(ddd) || !/^\d{8,9}$/.test(numero)) {
                    return /* void */;
                }
                newMark("fa-phone", `(${ddd}) ${VMasker.toPattern(numero, "9999-99999")}`, openPhone(report, ddd, numero, document));
            });

            $("BPQL > body emails > email > email", ccbusca).each((idx, element) => {
                let email = $(element).text();
                if (!emailRegex({
                        exact: true
                    }).test(email)) {
                    return /* void */;
                }
                newMark("fa-at", email, openEmail(report, email, document));
            });

            var addresses = {};
            $("BPQL > body enderecos > endereco", ccbusca).each((idx, element) => {
                let cidade = corrigeArtigos(titleCase($("cidade", element).text().replace(/\s+/, ' ').trim())),
                    estado = $("estado", element).text().replace(/\s+/, ' ').trim().toUpperCase(),
                    cep = $("cep", element).text().trim();

                if (/^\s*$/.test(cidade) || /^\s*$/.test(estado) || !/^\d{8}$/.test(cep)) {
                    return /* void */;
                }

                if (addresses[cep]) {
                    return /* void */;
                }

                addresses[cep] = true;

                newMark("fa-map", `${cidade}, ${estado} - ${VMasker.toPattern(cep, "99999-999")}`, openAddress(report, cep, ccbusca, document));
            });
        }

        var game = report.gamification("silhouette").addClass(isCPF ? "cpf" : "cnpj");
        detect(name.split(" ")[0]).then((gender) => {
            if (gender === 'female') {
                game.addClass("people-2");
            }
        });

        for (let result of results) {
            report.element().find(".results").append(result.element());
        }

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

    controller.registerTrigger("socialprofile::queryList", "certidaoCNPJ", (args, cb) => {
        if (!CNPJ.isValid(args.document)) {
            cb();
            return;
        }
        controller.server.call("SELECT FROM 'RFB'.'CERTIDAO'", {
            data: {
                documento: args.document
            },
            success: (ret) => {
                args.report.results.append(controller.call("xmlDocument", ret, 'RFB', 'CERTIDAO'));
            },
            complete: () => {
                cb();
            }
        });
    });

};
