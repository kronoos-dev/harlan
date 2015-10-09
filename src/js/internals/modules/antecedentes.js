module.exports = function (controller) {


    if (controller.confs.antecedentes.hosts.indexOf(window.location.host.split(":")[0]) === -1)
        return;

    controller.registerBootstrap("site::buttons", null);
    controller.registerBootstrap("site::carrousel", null);

    controller.registerBootstrap("databaseSearch", function (callback) {
        callback();
        controller.call("antecedentes::stylish");
        /* Busca de antecedentes */
    });

    controller.registerCall("antecedentes::stylish", function () {
        document.title = "ProShield | Seu RH seguro";
        $("link[rel='shortcut icon']").attr("href", "/images/favicon-escudo.png");
        controller.interface.addCSSDocument("css/antecedentes.min.css");
        controller.interface.helpers.template.render("antecedentes-site", {}, function (template) {
            $(".site").empty();
            $(".site").html(template);
            controller.call("site::carrousel");
            controller.call("site::buttons");
        });

    });
};