
import { DistanceMeter } from './distance-meter';

function basename(str){
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1)
    base = base.substring(0, base.lastIndexOf("."));
    return base;
}

module.exports = function (controller) {

    controller.registerCall("accuracy::checkin::picture", (obj, failed) => {
        navigator.camera.getPicture(() => {
            obj.file = basename(imageURI);
            obj.uri = imageURI;
        }, failed, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
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
