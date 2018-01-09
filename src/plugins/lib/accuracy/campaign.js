import _ from 'underscore';

module.exports = controller => {

    controller.registerCall('accuracy::campaigns', (cb, onError) => {
        controller.call('accuracy::campaigns::get', data => cb(controller.call('accuracy::campaigns::parse', data)), onError);
    });

    controller.registerCall('accuracy::campaigns::parse', data => {
        return _.filter(data[0], ({period_end}) => {
            return moment(period_end, 'YYYY-MM-DD').isAfter();
        });
    });

    controller.registerCall('accuracy::campaigns::get', (callback, errorCallback) => {
        controller.call('accuracy::authentication::data', (authData) =>
            controller.accuracyServer.call(`getCampaignsByUser/${authData[0].id}`, {}, {
                success: data => {
                    localStorage.accuracyCampaign = JSON.stringify(data);
                    /* save cache, continue */
                    if (callback) callback(data);
                },
                error: () => {
                    if (!localStorage.accuracyCampaign) {
                        if (errorCallback) errorCallback();
                        return;
                    }
                    toastr.warning('Parece que você está off-line, pegamos as informações de campanha do cache.', 'Sua conexão não está disponível para as campanhas.');
                    if (callback) callback(JSON.parse(localStorage.accuracyCampaign));
                }
            }, true));
    });
};
