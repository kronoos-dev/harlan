import urljoin from 'url-join';

var tokenId;

module.exports = function (controller) {

    controller.registerCall("accuracy::server::auth", (authData) => {
        tokenId = authData[0].token;
        controller.trigger("accuracy::authenticated", authData);
    });

    controller.registerCall("accuracy::server::reset", (authData) => {
        tokenId = null;
    });

    controller.accuracyServer = {
        call : (path, data, dict) => {
            let dataLength = Object.keys(data).length;
            let ajaxCall = Object.assign({
                dataType: "json",
                type: dataLength ? 'POST' : 'GET', /* */
                contentType:'application/json', /* sempre envia dados em JSON */
                data: dataLength ? JSON.stringify(data) : null,
                url: urljoin(controller.confs.accuracy.webserver, path)
            }, dict);

            if (tokenId) {
                ajaxCall.headers = ajaxCall.headers || {};
                ajaxCall.headers.Authorization = `Bearer ${tokenId}`;
            }

            return $.ajax(ajaxCall);
        }
    };

};
