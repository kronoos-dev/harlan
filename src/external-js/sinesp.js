(function (controller) {

    if (window.sinesp) {
        return; /* already defined */
    }

    window.sinesp = true;
    
    controller.registerTrigger("proshield::search", "sinesp::proshield::search", function (state, callback) {
        callback();
        state.header.result.addSeparator("Sinesp" , " Sistema Nacional de Informações de Segurança Pública, Prisionais e sobre Drogas", "Carregando").addClass("external-source loading");
    });

    controller.registerTrigger("proshield::save", "sinesp::proshield::save", function (state, callback) {
        callback();
    });

    controller.registerTrigger("proshield::load", "sinesp::proshield::load", function (state, callback) {
        callback();
    });

    controller.registerTrigger("proshield::delete", "sinesp::proshield::delete", function (state, callback) {
        callback();
    });

    sinesp();


})(window.harlan);