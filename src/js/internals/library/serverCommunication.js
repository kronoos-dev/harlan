/**
 * Módulo de Comunicação com a BIPBOP
 * @author Lucas Fernando Amorim <lf.amorim@bipbop.com.br>
 */
module.exports = function (controller) {

    /** @TODO Remover a constante da BIPBOP no futuro */
    this.apiKey = BIPBOP_FREE;

    /* Retorna o XHR da requisição AJAX */
    this.call = function (query, configuration) {
        controller.trigger("serverCommunication::call", [query, configuration]);
        return $().bipbop(query, this.apiKey, $.extend({
            dataType: "xml",
        }, configuration));
    };

    /* ALIAS */
    this.request = this.call;

    return this;
};