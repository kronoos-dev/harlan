import { DistanceMeter } from './distance-meter';
import Guid from 'guid';

function basename(str){
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1)
    base = base.substring(0, base.lastIndexOf("."));
    return base;
}

module.exports = function (controller) {

    controller.registerCall("accuracy::checkin::init", (campaign, store, callback, geolocationErrorCallback, type='checkin') =>
        controller.call("accuracy::checkin::object", campaign, store, (obj) =>
            controller.call("accuracy::checkin::picture", obj, callback, cameraErrorCallback), geolocationErrorCallback, type));

    controller.registerCall("accuracy::checkin::picture", (obj, callback, cameraErrorCallback) => {
        if (!navigator.camera || !navigator.camera.getPicture) {
            callback(obj);
            return;
        }

        navigator.camera.getPicture((imageURI) => {
            obj[0].file = basename(imageURI);
            obj[0].uri = imageURI;
            callback(obj);
        }, cameraErrorCallback, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });
    });

    controller.registerCall("accuracy::checkin::sendImage", (cb, obj) => {
        window.resolveLocalFileSystemURL(obj[0].uri,
            (fileEntry) => fileEntry.file((imageFile) => {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    let formdata = new FormData();
                    let imageBlob = new Blob([ this.result ], { type: "image/jpeg" } );
                    formdata.append('file', imageBlob, obj[0].file + ".jpg");
                    formdata.append('token', obj[0].file);
                    formdata.append('employee_id', obj[0].employee_id);
                    controller.accuracyServer.call("saveImages", {}, {
                        type: 'POST',
                        data: formdata,
                        cache: false,
                        contentType: false,
                        processData: false,
                        success: () => cb(),
                        error: () => cb("O envio fracassou, verifique sua conexão com a internet e entre em contato com o suporte")
                    });
                };
                reader.readAsArrayBuffer(imageFile);
            }, (e) => {
                console.error(e);
                cb();
            }), (e) => {
                console.error(e);
                cb();
            });
    });

    controller.registerCall("accuracy::checkin::send", (cb, obj) => {
        controller.accuracyServer.call("saveAnswer/", obj, {
            success: () => {
                cb();
                if (obj[0].uri) {
                    controller.sync.job("accuracy::checkin::sendImage", obj);
                }
            },
            error: () => cb("O envio fracassou, verifique sua conexão com a internet e entre em contato com o suporte")
        });
    });

    controller.registerCall("accuracy::checkin::object", (campaign, store, callback, geolocationErrorCallback, type="checkIn") => {
        navigator.geolocation.getCurrentPosition((position) => callback([{
            type: type,
            time: moment().format("HH:mm"),
            created_date: moment().format("DD/MM/YYYY"),
            store_id: store.id,
            campaign_id: campaign.id,
            employee_id: controller.call("accuracy::authentication::data")[0].id,
            token: Guid.raw(),
            file: Guid.raw(),
            questions: [],
            verifyCoordinates: {
                local: `${position.coords.latitude},${position.coords.longitude}`,
                store: store.coordinates
            },
            approved: DistanceMeter(store.coordinates, position.coords) >
                controller.confs.accuracy.geofenceLimit ? "N" : "Y"
        }]), geolocationErrorCallback);
    });

};
