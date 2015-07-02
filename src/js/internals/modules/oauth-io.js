module.exports = function (controller) {

    controller.registerBootstrap("oauth", function (callback) {
        OAuth.initialize(controller.confs.oauthKey);
        callback();
    });

    controller.registerCall("oauth::call", function (args) {

        var name = args[0], onSuccess = args[1],
                onError = args[2], onData = args[3];

        OAuth.popup(name).done(function (result) {
            controller.call("oauth::result", [result, onData, name]);
            if (onSuccess)
                onSuccess(result, name);
        }).fail(function (errorMessage) {
            if (onError)
                onError(errorMessage);
        });
    });

    controller.registerCall("oauth::result", function (args) {
        var result = args[0], onData = args[1], name = args[2];
        result.me().done(function (data) {
            if (onData)
                onData(data, name);
            controller.call("oauth::data", [data, name]);
        });
    });

    controller.registerCall("oauth::data", function (args) {
        var data = args[0], name = args[1];

        controller.trigger("oauth::data", [data, name]);
        controller.serverCommunication.call("INSERT INTO 'HARLANOAUTH'.'PROFILE'", {
            data: {
                kind: name,
                user: $.param(data),
            }
        });
    });

};