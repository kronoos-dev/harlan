module.exports = function (controller) {

    controller.registerBootstrap('oauth', function (callback) {
        OAuth.initialize(controller.confs.oauthKey);
        callback();
    });

    controller.registerCall('oauth::call', function (args) {

        let [name, onSuccess, onError, onData] = args;

        OAuth.popup(name).done(function (result) {
            controller.call('oauth::result', [result, onData, name]);
            if (onSuccess)
                onSuccess(result, name);
        }).fail(function (errorMessage) {
            if (onError)
                onError(errorMessage);
        });
    });

    controller.registerCall('oauth::result', function (args) {
        let [result, onData, name] = args;
        result.me().done(function (data) {
            if (onData)
                onData(data, name);
            controller.call('oauth::data', [data, name]);
        });
    });

    controller.registerCall('oauth::data', function (args) {
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
