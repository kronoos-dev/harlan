module.exports = (controller) => {

    controller.registerCall("geolocation", (callback) => {
        let modal = controller.call("modal");
        modal.gamification("magicWand");
        modal.title("Aguarde enquanto obtemos sua localização.");
        modal.subtitle("Seu navegador pode solicitar autorização.");
        modal.paragraph("Caso seu navegador solicite autorização é necessário que aceite para poder continuar.");

        modal.createActions().cancel();

        navigator.geolocation.getCurrentPosition((geoposition) => {
            modal.close();
            callback(geoposition);
        }, () => {
            if (!controller.confs.user || !controller.confs.user.geocode || !controller.confs.user.geocode.geometry || !controller.confs.user.geocode.geometry.location) {
                modal.close();
                callback();
                return;
            }

            modal.close();
            callback({coords: {latitude: controller.confs.user.geocode.geometry.location.lat, longitude: controller.confs.user.geocode.geometry.location.lng}});
        }, {
            enableHighAccuracy: true
        });
    });
};
