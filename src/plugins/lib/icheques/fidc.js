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

                canvas.height = 150;
                var canvas = document.createElement('canvas');
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

    controller.registerTrigger("admin", "icheques", () => {
        controller.registerCall("icheques::fidc::approve", () => {
            controller.server.call("SELECT FROM 'ICHEQUESFIDC'.'LIST'", {
                data: {
                    approved: "false"
                },
                success: (ret) => {
                    controller.call("icheques::fidc::report::xml", ret);
                }
            })
        });

        controller.registerCall("icheques::fidc::report::xml", (ret) => {
            var elements = [];

            $("fidc", ret).each((idx) => {
                elements.push(controller.call("icheques::fidc::report", {
                    "": $("", ret)
                }));
            });

            return elements;
        });

        controller.registerCall("icheques::fidc::report", (dict) => {
            controller.call("report",
                `Deseja habilitar a empresa? ${dict.companyName}`,
                `Ao habilitar a empresa você`,
                "");
        });

        controller.registerTrigger("serverCommunication::websocket::ichequeFIDC", "update", (data, cb) => {

        });
    });
};
