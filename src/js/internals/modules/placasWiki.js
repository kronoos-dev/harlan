/* global module, placa */

module.exports = function (controller) {

    controller.registerTrigger("findDatabase::instantSearch", function (args, callback) {
        callback();
        
        var placa = args[0],
                autocomplete = args[1];

        if (/^[A-Z]{3}\-?[0-9]{4}$/i.test(placa)) {

            autocomplete.item("Placas.Wiki",
                    "Consulta a Placa de Veículo",
                    "Para encontrar, comentar e avaliar motoristas", null, null, true).addClass("database").click(function () {
                controller.call("iframeEmbed::open", ["https://placas.wiki.br?p=" + placa]);
            });

        }
    });
};