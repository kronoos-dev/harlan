const FIDC = /(^|\s)antec?i?p?a?d?o?r?a?(\s|$)/i;

import browserImageSize from 'browser-image-size';
import _ from 'underscore';

module.exports = (controller) => {

    var globalReport = null;

    controller.registerTrigger("call::authentication::loggedin", "icheques::fidc", function(args, callback) {
        controller.server.call("SELECT FROM 'ICHEQUESFIDC'.'STATUS'", {
            success: (ret) => {
                var id = $("BPQL > body > fidc > _id", ret);
                if (!id.length) {
                    if (globalReport) globalReport.element().remove();
                    return;
                };
                var expireNode = $("BPQL > body > fidc > expire", ret),
                    expire = expireNode.length ? moment.unix(parseInt(expireNode.text())) : null;

                controller.call("icheques::fidc::status", {
                    _id: id.text(),
                    expire: expire,
                    created: moment.unix(parseInt($("BPQL > body > fidc > created", ret).text())),
                    approved: $("BPQL > body > fidc > approved", ret).text() === "true",
                    bio: $("BPQL > body > fidc > bio", ret).text(),
                    logo: $("BPQL > body > fidc > logo", ret).text(),
                    expired: expire ? moment().diff(expire) > 0 : true
                });
            }
        });
    });

    controller.registerCall("icheques::fidc::status", (dict) => {
        var report = controller.call("report");
        if (dict.approved && dict.expired) {
            report.title("Seu cadastro de antecipador está expirado.");
            report.subtitle("Infelizmente você não poderá receber novas operações.");
            report.paragraph("Renove seu cadastro de antecipador clicando no botão abaixo, é um custo de R$ 500 (quinhentos reais) para mais um mês de operações.");
            report.button("Renovar Cadastro", () => {
                controller.call("credits::has", 50000, () => {
                    controller.server.call("UPDATE 'ICHEQUESFIDC'.'RENEW'",
                        controller.call("error::ajax", controller.call("loader::ajax", {
                            success: () => {
                                controller.call("alert", {
                                    icon: "pass",
                                    title: "Pronto! Agora você pode operar por mais 1 mês.",
                                    subtitle: "Seu usuário já pode receber novos arquivos para antecipação.",
                                    paragraph: "Parabéns! Você renovou por mais 1 (um) mês a assinatura para fundos de antecipação iCheques."
                                })
                            }
                        }, true)));
                });
            });
            report.gamification("fail");
        } else if (dict.approved) {
            report.title("Seu cadastro de antecipador está perfeito.");
            report.subtitle("Essa conta está habilitada para receber carteiras de cheques.");
            report.paragraph(dict.bio);
            report.gamification("pass").css({
                "background": `url(${dict.logo}) no-repeat center`
            });

            controller.server.call("SELECT FROM 'ICHEQUESFIDC'.'OPERATIONS'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    success: (ret) => {
                        $("BPQL > body > antecipate", ret).each((idx, node) => {
                            var args = {
                                cmcs: [],
                                company: {
                                    _id: $("company > _id").text(),
                                    username: $("company > username", node).text(),
                                    cpf: $("company > cpf", node).text(),
                                    cnpj: $("company > cnpj", node).text(),
                                    status: $("company > status", node).text(),
                                    approved: $("approved", node).text(),
                                    contractAccepted: $("company > contractAccepted", node).text() == "true",
                                    status: parseInt($("company > status", node).text()),
                                    responsavel: $("company > responsavel", node).text(),
                                    contrato: [
                                        $("company > contrato > node:eq(0)", node).text(),
                                        $("company > contrato > node:eq(1)", node).text(),
                                        $("company > contrato > node:eq(2)", node).text(),
                                        $("company > contrato > node:eq(3)", node).text(),
                                        $("company > contrato > node:eq(4)", node).text(),
                                        $("company > contrato > node:eq(5)", node).text(),
                                    ],
                                    endereco: [
                                        $("company > endereco > node:eq(0)", node).text(),
                                        $("company > endereco > node:eq(1)", node).text(),
                                        $("company > endereco > node:eq(2)", node).text(),
                                        $("company > endereco > node:eq(3)", node).text(),
                                        $("company > endereco > node:eq(4)", node).text(),
                                        $("company > endereco > node:eq(5)", node).text(),
                                        $("company > endereco > node:eq(6)", node).text(),
                                    ],
                                    email: [],
                                    telefone: []
                                },
                                created: moment.unix(parseInt($(node).children("created").text()))
                            };

                            $("cmcs node", node).each((idx, cmc) => {
                                args.cmcs.push($(cmc).text());
                            });

                            $("company telefone node", node).each((idx, phone) => {
                                args.company.telefone.push([
                                    $("node:eq(0)", phone).text(),
                                    $("node:eq(1)", phone).text(),
                                    $("node:eq(2)", phone).text(),
                                    $("node:eq(3)", phone).text(),
                                    $("node:eq(4)", phone).text(),
                                ]);
                            });

                            $("company email node", node).each((idx, email) => {
                                args.company.email.push([
                                    $("node:eq(0)", email).text(),
                                    $("node:eq(1)", email).text()
                                ]);
                            });

                            controller.call("icheques::fidc::operation::decision", args);
                        });
                    }
                })));

            controller.registerTrigger("serverCommunication::websocket::ichequesFIDCOperation", (args, call) => {
                call();
                args.created = moment.unix(args.created);
                controller.call("icheques::fidc::operation::decision", args);
            });

        } else {
            report.title("Seu cadastro de antecipador ainda não foi aprovado.");
            report.subtitle("Infelizmente ainda não é possível receber carteiras de cheques.");
            report.paragraph("Nosso prazo para validação de antecipadores parceiros é de até 7 dias úteis. Certifique que você atendeu a todas as ligações e leu todos seus e-mails, podemos entrar em contato a qualquer momento.");
            report.gamification("fail");
        }

        if (!globalReport) {
            $(".app-content").prepend(report.element());
        } else {
            globalReport.replaceWith(report.element());
        }
        globalReport = report.element();
    });

    controller.registerTrigger("serverCommunication::websocket::ichequeFIDC", "update", (data, cb) => {
        cb();
        data.created = moment.unix(data.created);
        if (data.expire) {
            data.expire = moment.unix(data.expire);
        }
        data.expired = data.expire ? moment().diff(data.expire) > 0 : true
        controller.call("icheques::fidc::status", data);
    });

    controller.registerTrigger("findDatabase::instantSearch", "icheques::fidc::configure", function(args, callback) {
        callback();

        var [text, autocomplete] = args;

        if (!FIDC.test(text)) {
            return;
        }

        autocomplete.item("Antecipadora",
                "Configurar Antecipadora",
                "Habilite seu fundo a receber títulos do iCheques")
            .addClass("icheque").click((e) => {
                e.preventDefault();
                controller.call("fidc::configure");
            });
    });

    controller.registerCall("fidc::configure", () => {
        var modal = controller.call("modal"),
            gamification = modal.gamification("moneyBag"),
            logoImage = null;

        modal.title("Configurar Antecipadora");
        modal.subtitle("Comece já a receber títulos do iCheques");
        modal.paragraph("Configurando sua antecipadora você passa a receber cheques de nossos clientes e parceiros, seu perfil estará sujeito a avaliação cadastral.");
        var form = modal.createForm(),
            logo = form.addInput("logo", "file", "Logomarca - 150x150"),
            bio = form.addTextarea("about", "História da Empresa (200 caracteres)").attr({
                "maxlength": 200
            });

        logo.on('change', () => {
            var file = event.target.files[0];
            if (!file.type.match(/image/)) {
                toastr.warning(`O arquivo ${file.name} não é uma imagem.`, `A extensão enviada é ${file.type}.`);
                return;
            }
            browserImageSize(file).then((size) => {
                var scale = 150 / size[size.height > size.width ? "height" : "width"],
                    fileReader = new FileReader();

                var canvas = document.createElement('canvas');
                canvas.height = 150;
                canvas.width = 150;

                var canvasContext = canvas.getContext("2d"),
                    reader = new FileReader();

                reader.onload = function(e) {
                    var image = new Image();
                    image.onload = function() {
                        canvasContext.drawImage(image, 0, 0, size.width * scale, size.height * scale);
                        logoImage = canvas.toDataURL("image/png");
                        gamification.css({
                            "background": `url(${logoImage}) no-repeat center`
                        });
                    };
                    image.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        });

        form.addSubmit("send", "Continuar");
        form.element().submit((e) => {
            e.preventDefault();

            if (!logoImage || bio.val().replace(/s+/, " ").length < 100) {
                toastr.warning("O campo história da empresa deve ter ao menos 100 caracteres e o logo deve estar preenchido.",
                    "Verifique o formulário e tente novamente.");
                return;
            }

            modal.close();
            controller.call("confirm", {
                title: "Você aceita com o contrato de serviço?",
                subtitle: "Para continuar é necessário que você aceite o contrato de serviço desta ferramenta.",
                paragraph: "o contrato de serviço estão disponíveis <a target='_blank' href='/legal/icheques/MINUTA___CONTRATO__ANTECIPADORA_DE_CHEQUES.pdf' title='contrato de serviço'>neste link</a>, após a leitura clique em confirmar para acessar sua conta. O aceite é fundamental para que possamos disponibilizar todos os nossos serviços e você assim desfrutar de todos os benefícios iCheques.",
                confirmText: "Aceitar"
            }, () => {
                controller.call("credits::has", 50000, () => {
                    controller.call("billingInformation::need", () => {
                        controller.server.call("INSERT INTO 'ICHEQUESFIDC'.'COMPANY'", controller.call("error::ajax", controller.call("loader::ajax", {
                            method: "POST",
                            data: {
                                bio: bio.val(),
                                logo: logoImage
                            },
                            success: () => {
                                controller.call("alert", {
                                    icon: "pass",
                                    title: "Parabéns! Aguarde seu e-mail pela nossa aprovação.",
                                    subtitle: "Assim que aprovado seu cadastro você já poderá transacionar com nossos clientes e parceiros.",
                                    paragraph: "O nosso prazo é de 7 (sete) dias úteis, mas de repente podemos aprovar antes. Certifique de manter pelo menos R$ 500 reais de créditos para poder começar a trabalhar com as operações."
                                });
                            }
                        }, true)));
                    });
                });
            });
        });
        modal.createActions().cancel();
    });

    controller.registerTrigger("admin", "icheques", (args, callback) => {


        controller.server.call("SELECT FROM 'ICHEQUESFIDC'.'LIST'", {
            data: {
                approved: "false"
            },
            success: (ret) => {
                controller.call("icheques::fidc::enable::xml", ret);
            }
        });

        controller.registerCall("icheques::fidc::enable::xml", (ret) => {
            var elements = [];

            $("fidc", ret).each((idx, node) => {
                elements.push(controller.call("icheques::fidc::enable", {
                    "bio": $(node).children("bio").text(),
                    "_id": $(node).children("_id").text(),
                    "logo": $(node).children("logo").text(),
                    "name": $("company nome", node).text() || $("company reponsabel", ret).text(),
                    "creation": moment.unix(parseInt($(node).children("creation").text())),
                    "responsible": $(node).children("bio"),
                }));
            });

            return elements;
        });

        controller.registerCall("icheques::fidc::enable", (dict) => {
            var report = controller.call("report",
                `Deseja habilitar a empresa?`,
                `Ao habilitar a empresa você permite que todos os clientes iCheques possam enviar suas operações.`,
                dict.bio);
            report.label(`Empresa: ${dict.name}`);
            report.button("Habilitar Fundo", () => {
                controller.call("confirm", {}, () => {
                    controller.server.call("UPDATE 'IChequesFIDC'.'Approve'",
                        controller.call("loader::ajax", controller.call("error::ajax", {
                            data: {
                                fidc: dict._id
                            },
                            success: (ret) => {
                                controller.call("alert", {
                                    icon: "pass",
                                    title: "Antecipadora aprovada com sucesso.",
                                    subtitle: "A antecipadora foi aprovada e já pode ser utilizada pelos clientes e parceiros iCheques.",
                                    paragraph: "Um e-mail foi enviado avisando da aprovação, também foram debitados os R$ 500,00 (quinhentos reais), referentes ao primeiro mês de uso."
                                });
                                report.close();
                            }
                        }), true));
                });
            });
            report.gamification("pass").css({
                "background": `url(${dict.logo}) no-repeat center`
            });
            $(".app-content").prepend(report.element());
            return report;
        });

        controller.registerTrigger("serverCommunication::websocket::ichequeFIDC::admin", "admin", (data, cb) => {
            data.name = data.company.nome || data.company.responsavel;
            controller.call("icheques::fidc::enable", data);
        });

    });

    controller.registerCall("icheques::fidc::operation::decision", (args) => {
        var report = controller.call("report");
        report.title("Carteira de Antecipação");
        report.subtitle("Visualização da Carteira Recebida");
        report.paragraph("Você recebeu uma carteira de cheques para antecipação. " +
            "Para aceitar os cheques você deve encaminhar um arquivo .iTIT para geração de fatura e conclusão.");

        report.label(`Usuário\: ${args.company.username}`);
        report.label(`Documento\: ${args.company.cnpj || args.company.cpf}`);
        report.label(`Nome\: ${args.company.nome || args.company.responsavel}`);
        report.label(`Cheques\: ${args.cmcs.length}`);

        report.newAction("fa-cloud-download", () => {
            controller.server.call("SELECT FROM 'iChequesFIDC'.'OPERATION'", controller.call("error::ajax", {
                data: {
                    id: args._id
                },
                success: function(ret) {
                    var storage = [];
                    $(ret).find("check").each(function() {
                        storage.push(controller.call("icheques::parse::element", this));
                    });
                    controller.call("icheques::ban::generate", {values:storage}, args.company);
                }
            }));
        });

        report.newAction("fa-folder-open", () => {
            controller.server.call("SELECT FROM 'iChequesFIDC'.'OPERATION'", controller.call("error::ajax", {
                data: {
                    id: args._id
                },
                success: function(ret) {
                    var storage = [];
                    $(ret).find("check").each(function() {
                        storage.push(controller.call("icheques::parse::element", this));
                    });
                    controller.call("icheques::show", storage, null, report.element());
                }
            }));
        });

        var sendAccept = (accept) => {
            controller.confirm({}, (cmcs) => {
                controller.server.call("UPDATE 'iChequesFIDC'.'Operation'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: $.extend({
                            id: args._id,
                            approved: accept
                        }, cmcs),
                        success: () => {
                            toastr.success("A operação foi aceita com sucesso, agora os cheques fazem parte de sua carteira.", "Cheques adicionados a carteira.");
                            report.close();
                        }
                    }, true)));
            });
        };

        let accept = (accept) => {
            return () => {

                if (accept) {

                }

            };
        };
        report.newAction("fa-user", () => {

        });
        report.button("Recusar Operação", accept(false));
        report.button("Aceitar Operação", accept(true));
        report.gamification("sword");

        $(".app-content").append(report.element());
    });

};
