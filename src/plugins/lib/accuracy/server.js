import urljoin from 'url-join';

var tokenId;

const logo = $("body > div.accuracy-app > div:nth-child(1) > div > div > span");

module.exports = function (controller) {

    controller.registerCall("accuracy::server::auth", (authData) => {
        tokenId = authData[0].token;
        controller.trigger("accuracy::authenticated", authData);
    });

    controller.registerCall("accuracy::server::reset", (authData) => {
        tokenId = null;
    });
    let rcounter = 0;
    controller.accuracyServer = {
        upload: (path, data, dict, loader = false) => {
            let conn = typeof Connection === 'undefined' ? navigator.connection : Connection;
            if (controller.confs.isCordova && navigator.connection && conn && navigator.connection.type === conn.NONE) {
                if (dict.error) dict.error();
                if (dict.complete) dict.complete();
                return;
            }

            let dataLength = Object.keys(data).length;

            let success = (...args) => {
                if (dict.success) dict.success(...args);
                if (dict.complete) dict.complete();
            };

            let error = (...args) => {
                if (dict.error) dict.error(...args);
                if (dict.complete) dict.complete();
            };

            var uploadOptions = new FileUploadOptions();
            uploadOptions.fileKey = dict.fileKey;
            uploadOptions.fileName = dict.fileName;
            uploadOptions.mimeType = dict.mimeType;
            uploadOptions.params = data;
            uploadOptions.headers = {
                Authorization: `Bearer ${tokenId}`
            };

            new FileTransfer().upload(dict.file, urljoin(controller.confs.accuracy.webserver, path), success, error, uploadOptions);
        },
        call : (path, data, dict, loader = false) => {
            let conn = typeof Connection === 'undefined' ? navigator.connection : Connection;
            if (controller.confs.isCordova && navigator.connection && conn && navigator.connection.type === conn.NONE) {
                if (dict.error) dict.error();
                if (dict.complete) dict.complete();
                return;
            }

            let blockui, timeout;
            if (loader) {
                blockui = controller.call("blockui", {
                    icon: "fa-rocket",
                    message: "Estamos transmitindo dados, certifique que seu plano de dados esteja ativado."
                });

                timeout = setTimeout(() => {
                    blockui.message.text("Sua conexão está muito lenta, verifique se há um método alternativo de conexão com a internet.");
                }, 3000);
            } else {
                rcounter++;
                logo.css({animation:"spin 1s infinite"});
            }

            let complete = dict.complete;
            dict.complete = (...args) => {
                if (loader) {
                    clearTimeout(timeout);
                    blockui.mainContainer.remove();
                } else {
                    if (!--rcounter) {
                        logo.css({animation:"none"});
                    }
                }
                if (complete) complete(...args);
            };

            let dataLength = Object.keys(data).length;
            let ajaxCall = Object.assign({
                timeout: controller.confs.accuracy.ajaxTimeout,
                dataType: "json",
                type: dataLength ? 'POST' : 'GET', /* POST || GET */
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
