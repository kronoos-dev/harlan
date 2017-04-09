import { ApplicationState } from './application-state';
import _ from 'underscore';

let as, clearState;

const applicationElement = $(".accuracy-app");

module.exports = function (controller) {

    let fatalError = () => {};

    let checkout = () => {
        controller.call("accuracy::checkin::init", as.applicationState.campaign, as.applicationState.store, (obj) => {
            controller.confirm({}, () => {
                controller.call("accuracy::question", _.filter(as.applicationState.campaign.question, (q) => {
                    return q.is_checkin == "Y";
                }), (response) => {
                    obj.questions = response;
                    controller.cal("accuracy::checkin::confirm", obj, () => {})
                });
            });
        }, fatalError, fatalError, "checkout");
    };

    let checkin = () => {
        controller.call("accuracy::checkin::init", as.applicationState.campaign, as.applicationState.store, (obj) => {
            controller.confirm({}, () => {
                controller.call("accuracy::question", _.filter(as.applicationState.campaign.question, (q) => {
                    return q.is_checkin == "Y";
                }), (response) => {
                    obj.questions = response;
                    controller.cal("accuracy::checkin::confirm", obj, () => {})
                });
            });
        }, fatalError, fatalError);
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
            as.configure({status: 'checkin', campaign: campaign, store: campaign.store[storeSelector.val()]});
            render();
            modal.close();
        });
    };

    let render = () => {
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
            }, fatalError);
        }
    };

    controller.registerTrigger("accuracy::authenticated", "controller", (authData, cb) => {
        cb();
        as = new ApplicationState(authData);
        render();
    });

};
