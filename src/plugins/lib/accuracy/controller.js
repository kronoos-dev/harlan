import { ApplicationState } from './application-state';
import _ from 'underscore';

let as, clearState;

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
        controller.call("accuracy::checkin::init", as.applicationState.campaign, as.applicationState.store, (obj) => {
            controller.confirm({}, () => {
                controller.call("accuracy::question", _.filter(as.applicationState.campaign.question, (q) => q.is_checkin != "Y"),
                    (response) => {
                        obj.questions = response;
                        objectConfirm(obj, () => {
                            render({
                                status: 'checkin',
                                checkout: obj
                            });
                    });
                });
            }, () => {
                if (navigator.app && navigator.app.exitApp) {
                    navigator.app.exitApp();
                }
            });
        }, geolocationErrorCallback, cameraErrorCallback, "checkout");
    };

    let checkin = () => {
        controller.call("accuracy::checkin::init", as.applicationState.campaign, as.applicationState.store, (obj) => {
            controller.confirm({
                title: `Realizar check-in em ${as.applicationState.campaign.name}`,
                subtitle: `Selecionado local ${as.applicationState.store} para check-in`,
                paragraph: "Ao realizar o check-in será lhe informado "
            }, () => {
                controller.call("accuracy::question", _.filter(as.applicationState.campaign.question, (q) => {
                    return q.is_checkin == "Y";
                }), (response) => {
                    obj.questions = response;
                    objectConfirm(obj, () => {
                        render({
                            status: 'checkout',
                            checkin: obj
                        });
                    });
                });
            }, () => render({status: 'campaign'}));
        }, geolocationErrorCallback, cameraErrorCallback);
    };

    let campaign = (campaigns) => {
        let container = $("<div />").addClass("container accuracy-campaigns"),
        content = $("<div />").addClass("content"),
        list = $("<ul />");

        container.append(content);
        content.append(list);
        applicationElement.append(container);

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

        return () => container.remove();
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
            render({status: 'checkin', campaign: campaign, store: campaign.store[storeSelector.val()]});
            modal.close();
        });
        return modal;
    };

    let render = (data = null) => {
        if (data) {
            as.render(data);
        }
        if (!as) return;
        if (clearState) clearState(); /* limpa estado anterior da tela */
        switch (as.applicationState.status) {
            case 'checkout':
                clearState = checkout();
                break;
            case 'checkin':
                clearState = checkin();
                break;
            default:
                controller.call("accuracy::campaigns", (campaigns) => {
                    clearState = campaign(campaigns);
                }, () => fatalError("Não há como baixar as campanhas.",
                    "É necessária ao menos uma campanha para continuar."));
        }
    };

    controller.registerTrigger("accuracy::authenticated", "controller", (authData, cb) => {
        cb();
        as = new ApplicationState(authData);
        render();
    });

};
