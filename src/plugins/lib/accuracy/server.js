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
