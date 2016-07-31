module.exports = (controller) => {

    controller.registerCall("geolocation", (callback) => {
        let modal = controller.call("modal");
        modal.gamification("magicWand");
        modal.title("Aguarde enquanto obtemos sua localização.");
        modal.subtitle("Seu navegador pode solicitar autorização.");
        modal.paragraph("Caso seu navegador solicite autorização é necessário que aceite para poder continuar.");

        modal.createActions().cancel();

        navigator.geolocation.getCurrentPosition((geoposition) => {
            callback(geoposition);
            modal.close();
        }, () => {
            callback();
        }, {
            enableHighAccuracy: true
        });
    });
};
