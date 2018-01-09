module.exports = controller => {

    controller.registerBootstrap('oauth', callback => {
        OAuth.initialize(controller.confs.oauthKey);
        callback();
    });

    controller.registerCall('oauth::call', args => {

        let [name, onSuccess, onError, onData] = args;

        OAuth.popup(name).done(result => {
            controller.call('oauth::result', [result, onData, name]);
            if (onSuccess)
                onSuccess(result, name);
        }).fail(errorMessage => {
            if (onError)
                onError(errorMessage);
        });
    });

    controller.registerCall('oauth::result', args => {
        let [result, onData, name] = args;
        result.me().done(data => {
            if (onData)
                onData(data, name);
            controller.call('oauth::data', [data, name]);
        });
    });

    controller.registerCall('oauth::data', args => {
        let [data, name] = args;

        controller.trigger('oauth::data', [data, name]);
        controller.serverCommunication.call('INSERT INTO \'HARLANOAUTH\'.\'PROFILE\'', {
            data: {
                kind: name,
                user: $.param(data),
            }
        });
    });

};
