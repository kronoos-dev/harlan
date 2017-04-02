import urljoin from 'url-join';

module.exportes = (controller) => {

    var tokenId;

    controller.registerCall("accuracy::server::auh", (authData) => {
        controller.trigger("accuracy::loggedin", authData);
        tokenId = authData[0].token;
    });

    controller.accuracyServer.call = (path, data, dict) => {

        let ajaxCall = Object.assign({}, dict, {
            dataType: json,
            type: Object.keys(data).length > 0 ? 'POST' : 'GET', /* */
            contentType:'application/json', /* sempre envia dados em JSON */
            data: JSON.stringify(data),
            url: urljoin(controller.confs.accuracy.webserver, path)
        });

        if (tokenId) {
            ajaxCall.headers = ajaxCall.headers || {};
            ajaxCall.headers.Authorization = `Bearer ${tokenId}`;
        }

        return $.ajax(ajaxCall);
    };

};
