import { DistanceMeter } from './distance-meter';
import { Sync } from './sync';

function basename(str){
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1)
    base = base.substring(0, base.lastIndexOf("."));
    return base;
}

module.exports = function (controller) {

    controller.registerCall("accuracy::checkin::init", (campaign, store, callback, geolocationErrorCallback, cameraErrorCallback, type='checkin') =>
        controller.call("accuracy::checkin::object", campaign, store, (obj) =>
            controller.call("accuracy::checkin::picture", obj, () => callback(obj), cameraErrorCallback), geolocationErrorCallback, type));

    controller.registerCall("accuracy::checkin::picture", (obj, callback, cameraErrorCallback) => {
        navigator.camera.getPicture((imageURI) => {
            obj.file = basename(imageURI);
            obj.uri = imageURI;
            callback();
        }, cameraErrorCallback, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });
    });

    controller.registerCall("accuracy::checkin::sendImage", (cb, obj) => {
        window.resolveLocalFileSystemURL(obj.uri,
            (fileEntry) => fileEntry.file(function(imageFile) {
                var formdata = new FormData();
                formdata.append('file', imageFile);
                formdata.append('token', obj.token);
                formdata.append('employee_id', obj.employee_id);
                controller.accuracyServer.call("./saveImage/", null, {
                    data: formdata,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: () => cb(),
                    error: () => cb("O envio fracassou, verifique sua conexão com a internet e entre em contato com o suporte")
                });
            }, () => cb()), () => cb());
    });

    controller.registerCall("accuracy::checkin::send", (cb, obj) => {
        controller.accuracyServer.call("./saveAnswer/", obj, {
            success: () => {
                cb();
                controller.sync.job("accuracy::checkin::sendImage", obj);
            },
            error: () => cb("O envio fracassou, verifique sua conexão com a internet e entre em contato com o suporte")
        });
    });

    controller.registerCall("accuracy::checkin::object", (campaign, store, callback, geolocationErrorCallback, type="checkIn") => {
        navigator.geolocation.getCurrentPosition((position) => callback([{
            type: type,
            time: moment().parse("HH:mm"),
            created_date: moment().parse("DD/MM/YYYY"),
            store_id: store.id,
            campaign_id: campaign.id,
            employee_id: controller.call("accuracy::authentication::data")[0].id,
            token: Guid.raw(),
            file: Guid.raw(),
            questions: [],
            verifyCoordinates: {
                local: `${position.coords.latitude},${position.coords.longitude}`,
                store: as.applicationState.store.coordinates
            },
            approved: DistanceMeter(as.applicationState.store.coordinates, position.coords) >
                controller.confs.accuracy.geofenceLimit ? "N" : "Y"
        }]), geolocationErrorCallback);
    });

};
