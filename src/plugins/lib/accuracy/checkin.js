
import { DistanceMeter } from './distance-meter';
import { Sync } from './sync';

function basename(str){
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1)
    base = base.substring(0, base.lastIndexOf("."));
    return base;
}

module.exports = function (controller) {

    controller.registerCall("accuracy::checkin::init", (campaign, store, callback, errorCallback, cameraError, type='checkin') =>
        controller.call("accuracy::checkin::object", campaign, store, (obj) =>
            controller.call("accuracy::checkin::picture", obj, () => callback(obj), cameraError), errorCallback, type));

    controller.registerCall("accuracy::checkin::picture", (obj, callback, failed) => {
        navigator.camera.getPicture(() => {
            obj.file = basename(imageURI);
            obj.uri = imageURI;
            callback();
        }, failed, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });
    });


    controller.registerCall("accuracy::checkin::send", (obj) => {
        controller.accuracyServer.call("./saveAnswer/", obj, {
            
        });
    });

    controller.registerCall("accuracy::checkin::object", (campaign, store, callback, errorCallback, type="checkIn") => {
        navigator.geolocation.getCurrentPosition((position) => callback([{
            "type":type,
            "time":moment().parse("HH:mm"),
            "created_date":moment().parse("DD/MM/YYYY"),
            "store_id":store.id,
            "campaign_id":campaign.id,
            "employee_id":controller.call("accuracy::authentication::data")[0].id,
            "token":Guid.raw(),
            "file":Guid.raw(),
            "questions":[],
            "verifyCoordinates":{
                "local": `${position.coords.latitude},${position.coords.longitude}`,
                "store": as.applicationState.store.coordinates
            },
            "approved": DistanceMeter(as.applicationState.store.coordinates, position.coords) >
            controller.confs.accuracy.geofenceLimit ? "N" : "Y"
        }]), errorCallback);
    });

};
