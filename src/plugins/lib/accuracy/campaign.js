import _ from 'underscore';

module.exports = function (controller) {

    controller.registerCall("accuracy::campaigns", (cb, onError) => {
        controller.call("accuracy::campaigns::get", (data) => cb(controller.call("accuracy::campaigns::parse", data)), onError);
    });

    controller.registerCall("accuracy::campaigns::parse", (data) => {
        return _.filter(data[0], (campaignObject) => {
            return moment(campaignObject.period_end, "YYYY-MM-DD").isAfter();
        });
    });

    controller.registerCall("accuracy::campaigns::get", (callback, errorCallback) => {
        let authData = controller.call("accuracy::authentication::data");
        controller.accuracyServer.call(`./getCampaignsByUser/${authData[0].id}`, {}, {
            success: (data) => {
                localStorage.accuracyCampaign = JSON.stringify(data);
                /* save cache, continue */
                if (callback) callback(data);
            },
            error: () => {
                if (localStorage.accuracyCampaign) {
                    if (errorCallback) errorCallback();
                    return;
                }
                if (callback) callback(JSON.parse(localStorage.accuracyCampaign));
            }
        });
    });
};
