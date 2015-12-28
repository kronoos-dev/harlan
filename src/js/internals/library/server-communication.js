/**
 * Módulo de Comunicação com a BIPBOP
 * @author Lucas Fernando Amorim <lf.amorim@bipbop.com.br>
 */
module.exports = function (controller) {

    /**
     * Web Socket Function
     * @type @exp;bipbop@call;webSocket
     */
    var webSocketFnc;

    /**
     * Api Key
     * @type string
     */
    this.apiKey = BIPBOP_FREE;

    $.bipbopDefaults.automaticLoader = false;

    /**
     * Default WebSocket Callback
     * @param {WebSocket Data} data
     * @returns {undefined}
     */
    var defaultCallback = function (data) {
        controller.trigger("serverCommunication::websocket::data", data);
    };

    /* BIPBOP WebSocket */
    this.webSocket = function () {
        if (!webSocket) {
            webSocketFnc = bipbop.webSocket(this.apiKey, defaultCallback, function (ws) {
                controller.trigger("serverCommunication::websocket::open", ws);
            });

            controller.registerTrigger("authentication::authenticated", "serverCommunication::changeApiKey", function (args, callback) {
                webSocketFnc(this.apiKey);
                callback();
            });
        }
        return webSocketFnc;
    };

    /* Retorna o XHR da requisição AJAX */
    this.call = function (query, configuration) {
        controller.trigger("serverCommunication::call", [query, configuration]);
        return $.bipbop(query, this.apiKey, configuration);
    };

    /* ALIAS */
    this.request = this.call;

    return this;
};
