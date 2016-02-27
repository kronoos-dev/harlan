/* global bipbop, module */

/**
 * Módulo de Comunicação com a BIPBOP
 * @author Lucas Fernando Amorim <lf.amorim@bipbop.com.br>
 */

var SHA256 = require("crypto-js/sha256");

module.exports = function (controller) {

    if (controller.confs.websocketAddress)
        bipbop.websocketAddress = controller.confs.websocketAddress;

    if (controller.confs.webserviceAddress)
        bipbop.webserviceAddress = controller.confs.webserviceAddress;

    /**
     * Web Socket Function
     * @type @exp;bipbop@call;webSocket
     */
    var webSocketFnc;

    /**
     * Api Key
     * @type string
     */
    var bipbopApiKey = BIPBOP_FREE;

    /** O Harlan é assíncrono e o BIPBOP Loader bloqueante */
    $.bipbopDefaults.automaticLoader = false;

    /**
     * Default WebSocket Callback
     * @param {WebSocket Data} data
     * @returns {undefined}
     */
    var defaultCallback = function (data, event) {
        controller.trigger("serverCommunication::websocket::event", event);
        if (data.method) {
            controller.trigger("serverCommunication::websocket::" + data.method, data.data);
        }
    };

    /* BIPBOP WebSocket */
    this.webSocket = bipbop.webSocket(bipbopApiKey, defaultCallback, function (ws) {
        controller.trigger("serverCommunication::websocket::open", ws);
    });

    this.freeKey = function () {
        return bipbopApiKey === BIPBOP_FREE;
    };

    this.userHash = function () {
        return SHA256(bipbopApiKey);
    };

    /* BIPBOP API Key */
    this.apiKey = function (apiKey) {
        if (apiKey && bipbopApiKey !== apiKey) {
            bipbopApiKey = apiKey;
            this.webSocket(apiKey);
        }
        return bipbopApiKey;
    };

    /* Retorna o XHR da requisição AJAX */
    this.call = function (query, configuration) {
        controller.trigger("serverCommunication::call", [query, configuration]);
        return $.bipbop(query, bipbopApiKey, configuration);
    };

    /* ALIAS */
    this.request = this.call;

    return this;
};
