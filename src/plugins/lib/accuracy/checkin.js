import { DistanceMeter } from './distance-meter';
import Guid from 'guid';
import basename from 'basename';

module.exports = function (controller) {

    controller.registerCall("accuracy::checkin::init", (campaign, store, callback, geolocationErrorCallback, type='checkin') =>
        controller.call("accuracy::checkin::object", campaign, store, (obj) =>
            controller.call("accuracy::checkin::picture", obj, callback, cameraErrorCallback), geolocationErrorCallback, type));

    let cameraResume = null;
    document.addEventListener('resume', event => {
        if (event.pendingResult && event.pendingResult.pluginStatus === 'OK' &&
            event.pendingResult.pluginServiceName === "Camera") {
            cameraResume = event.pendingResult.result;
        }
    }, false);

    controller.registerCall("accuracy::checkin::picture", (obj, callback, cameraErrorCallback) => {
        if (!navigator.camera || !navigator.camera.getPicture) {
            callback(obj);
            return;
        }

        let successCallback = imageURI => {
            obj[0].file = basename(imageURI);
            obj[0].uri = imageURI;
            callback(obj);
        };

        if (cameraResume) {
            successCallback(cameraResume);
            cameraResume = null;
        }

        navigator.camera.getPicture(successCallback, cameraErrorCallback, {
            quality: 50,
            targetWidth: 600,
            targetHeight: 600,
            sourceType: Camera.PictureSourceType.CAMERA,
            destinationType: Camera.DestinationType.FILE_URI,
            saveToPhotoAlbum: false,
            correctOrientation: true
        });
    });

    controller.registerCall("accuracy::checkin::sendImage", (cb, obj) => {
        let formdata = new FormData();
        controller.accuracyServer.upload("saveImages", {
            token: obj[0].file,
            employee_id: obj[0].employee_id
        }, {
            file: obj[0].uri,
            fileKey: "file",
            fileName: `${obj[0].file}.jpg`,
            mimeType : "image/jpeg",
            success: () => cb(),
            error: () => cb("O envio fracassou, verifique sua conexão com a internet e entre em contato com o suporte")
        });
    });

    controller.registerCall("accuracy::checkin::send", (cb, obj) => {
        controller.accuracyServer.call("saveAnswer", obj, {
            success: () => {
                cb();
                if (obj[0].uri) {
                    controller.sync.job("accuracy::checkin::sendImage", null, obj);
                }
            },
            error: () => cb("O envio fracassou, verifique sua conexão com a internet e entre em contato com o suporte")
        });
    });

    controller.registerCall("accuracy::checkin::object", (campaign, store, callback, geolocationErrorCallback, type="checkIn") => {
        let blockui = controller.call("blockui", {
            icon: "fa-location-arrow",
            message: "Aguarde enquanto capturamos sua localização."
        });

        let timeout = setTimeout(() => {
            blockui.message.text("Estamos demorando para capturar sua localização. Experimente ir para um local aberto, certifique de ativar o Wi-Fi, dados e GPS.");
        }, 6000);


        controller.call("accuracy::authentication::data", authData =>
        navigator.geolocation.getCurrentPosition((position) => {
            clearTimeout(timeout);
            blockui.mainContainer.remove();
            let distance = DistanceMeter(store.coordinates, position.coords);
            callback([{
                type: type,
                time: moment().format("HH:mm"),
                created_date: moment().format("DD/MM/YYYY"),
                store_id: store.id,
                campaign_id: campaign.id,
                employee_id: authData[0].id,
                token: Guid.raw(),
                file: Guid.raw(),
                questions: [],
                verifyCoordinates: {
                    local: `${position.coords.latitude},${position.coords.longitude}`,
                    store: store.coordinates
                },
                approved: store.coordinates ? (distance >
                    controller.confs.accuracy.geofenceLimit ? "N" : "Y") : "Y"
            }]);
        }, (...args) => {
            clearTimeout(timeout);
            blockui.mainContainer.remove();
            geolocationErrorCallback(...args);
        }));
    });

};
