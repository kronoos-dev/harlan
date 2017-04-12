import { ApplicationState } from './application-state';
import _ from 'underscore';

let as, campaignContainer;

const applicationElement = $(".accuracy-app");

module.exports = function (controller) {

    let cameraErrorCallback = (message) => {
        return fatalError("Não foi possível abrir a câmera do dispositivo.", message);
    };

    let geolocationErrorCallback = (e) => {
        return fatalError("Não foi possível capturar a sua localização.", `${e.code} - ${e.message}`);
    };

    let fatalError = (title, message) => {
        return controller.alert({
            title: title,
            message: message,
            paragraph: "Ocorreu um erro fatal e o programa será finalizado, tente novamente mais tarde."
        }, () => navigator.app.exitApp());
    };

    let objectConfirm = (obj, callback) => {
        controller.confirm({}, () => {
            controller.sync.job("accuracy::checkin::send", obj);
            callback();
        }, () => render());
    };

    let checkout = () => {
        controller.call("accuracy::checkin::object", as.applicationState.campaign, as.applicationState.store, (obj) => {
            controller.confirm({
                title: `Realizar checkout em ${as.applicationState.campaign.name}`,
                subtitle: `Prosseguir com checkout do local ${as.applicationState.store.name}.`,
                paragraph: `Será lhe apresentado um questionário para prosseguir com o checkout. ${distantMessage(obj)}`
            }, () => {
                controller.call("accuracy::checkin::picture", obj, () => {
                    controller.call("accuracy::question", _.filter(as.applicationState.campaign.question, (q) => q.is_checkin != "Y"),
                    (response) => {
                        obj[0].token = as.applicationState.checkin[0].token;
                        obj[0].questions = response;
                        objectConfirm(obj, () => {
                            render({
                                status: 'campaign',
                                checkout: obj
                            });
                        });
                    }, () => render(), {title: "Perguntas do checkout"});
                }, cameraErrorCallback);
            }, () => {
                if (navigator.app && navigator.app.exitApp) {
                    navigator.app.exitApp();
                }
            });
        }, geolocationErrorCallback, "checkout");
    };

    let distantMessage = (obj) => {
        return obj.approved === "Y" ? "Esta ação está pré-aprovada pelo administrador." :
        "<strong>Você está distante da loja, esta ação dependerá da aprovação de um administrador.</strong>";
    };

    let checkin = () => {
        controller.call("accuracy::checkin::object", as.applicationState.campaign, as.applicationState.store, (obj) => {
            controller.confirm({
                title: `Realizar check-in em ${as.applicationState.campaign.name}`,
                subtitle: `Prosseguir com local ${as.applicationState.store.name}.`,
                paragraph: `Será lhe apresentado um questionário para prosseguir com o check-in. ${distantMessage(obj)}`
            }, () => {
                controller.call("accuracy::checkin::picture", obj, () => {
                    controller.call("accuracy::question", _.filter(as.applicationState.campaign.question, (q) => {
                        return q.is_checkin == "Y";
                    }), (response) => {
                        obj[0].questions = response;
                        objectConfirm(obj, () => {
                            render({
                                status: 'checkout',
                                checkin: obj
                            });
                        });
                    });
                }, cameraErrorCallback);
            }, () => render({status: 'campaign'}));
        }, geolocationErrorCallback);
    };

    let campaign = () => {
        controller.call("accuracy::campaigns", (campaigns) => {
            if (campaignContainer) campaignContainer.remove();

            campaignContainer = $("<div />").addClass("container accuracy-campaigns");
            let content = $("<div />").addClass("content");
            let list = $("<ul />");

            campaignContainer.prepend($("<p />").text("Selecione uma das campanhas abaixo para começar."))
            .prepend($("<h2 />").text("Seleção de Campanha"));
            campaignContainer.append(content);
            content.append(list);
            applicationElement.append(campaignContainer);

            let contentMenu = $("<ul />").addClass("actions");
            campaignContainer.append(contentMenu);

            let registration = controller.call("accuracy::authentication::data")[0].registration;
            if (registration === "Y" || registration === true) {
                contentMenu.append($("<li />").append($("<a />").attr({
                    href: "#"
                }).text("Cadastrar Loja").click((e) => {
                    e.preventDefault();
                    controller.call("accuracy::createStore");
                })));
            }

            contentMenu.append($("<li />").append($("<a />").attr({
                href: "#"
            }).text("Atualizar").click((e) => {
                e.preventDefault();
                render();
            })));


            contentMenu.append($("<li />").append($("<a />").attr({
                href: "#"
            }).text("Sair").click((e) => {
                e.preventDefault();
                controller.call("accuracy::logout");
                controller.interface.helpers.activeWindow(".login");
            })));


            _.each(campaigns, (campaign) => {
                let campaignElement = $("<li />").addClass("accuracy-campaign").click((e) => {
                    e.preventDefault();
                    campaignStores(campaign);
                });

                campaignElement
                .append($("<img />").attr({
                    src: campaign.avatar
                }).addClass("accuracy-campaign-image"))
                .append($("<span />")
                .text(campaign.name)
                .addClass("accuracy-campaign-title"));

                list.append(campaignElement);
            });

        }, () => fatalError("Não há como baixar as campanhas.",
        "É necessária ao menos uma campanha para continuar."));
    };

    let campaignStores = (campaign) => {
        let modal = controller.call("modal");
        modal.title("Loja da Campanha");
        modal.subtitle("Escolha a loja em que será realizada a ação.");
        modal.paragraph("Selecione abaixo a loja em que será realizada a ação.");
        let form = modal.createForm(),
        storeSelector = form.addSelect("select", "Loja para Checkin", _.map(campaign.store, (s) => s.name));
        form.addSubmit("submit", "Selecionar Loja");
        modal.createActions().cancel();
        form.element().submit((e) => {
            e.preventDefault();
            /* quando a pessoa seleciona já podemos configurar o local para
            realizar o checkin */
            render({
                status: 'checkin',
                campaign: campaign,
                store: campaign.store[storeSelector.val()]
            });
            modal.close();
        });
        return modal;
    };

    let render = (data = null) => {
        if (data) {
            as.configure(data);
        }
        if (!as) return;
        switch (as.applicationState.status) {
            case 'checkout':
            checkout();
            break;
            case 'checkin':
            checkin();
            break;
            default:
            campaign();
        }
    };

    controller.registerTrigger("accuracy::authenticated", "controller", (authData, cb) => {
        cb();
        as = new ApplicationState(authData);
        render();
    });

};
