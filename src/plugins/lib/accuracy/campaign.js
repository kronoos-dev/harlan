module.exportes = (controller) => {

    controller.registerTrigger("accuracy::loggedin", "campaign", (authData, callback) => {
        let cb = () => callback();
        controller.call("accuracy::campaign", authData, cb, cb);
    });

    controller.registerCall("accuracy::campaign::render", (data) => {
        /* select and go to checkin screen */
    });

    controller.registerCall("accuracy::campaign", (authData, callback, errorCallback) => {
        controller.accuracyServer.call(`./getCampaignsByUser/${authData[0].id}`, {}, {
            success: (data) => {
                localStorage.accuracyCampaign = JSON.stringify(data) /* save cache, continue */},
                if (callback) callback(data);
            error: () => {
                if (localStorage.accuracyCampaign) {
                    if (errorCallback) errorCallback();
                    return;
                }
                if (callback) callback(data);
            }
        });
    });
};
