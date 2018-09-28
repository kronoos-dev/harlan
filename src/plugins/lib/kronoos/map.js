import GoogleMapsLoader from 'google-maps';
import geolib from 'geolib';
import _ from 'underscore';

GoogleMapsLoader.LIBRARIES = ['geometry', 'places'];
GoogleMapsLoader.REGION = 'BR';
GoogleMapsLoader.LANGUAGE = 'pr-BR';
GoogleMapsLoader.KEY = 'AIzaSyA_UdPQ1cHRfTdtYu-kPxiXIDSMVWKcqrI';

var googleClass = null;
var callbacks = [];

function loadGoogleClasses(callback) {
    if (googleClass) {
        callback(googleClass);
        return true;
    }

    callbacks.push(callback);

    if (googleClass === false) return false;
    googleClass = false;

    GoogleMapsLoader.load(g => {
        googleClass = g;
        let cbs = callbacks;
        callbacks = [];
        for (let cb of cbs) cb(googleClass);
    });

    return false;
}

const worldDimension = { height: 256, width: 256 };
const zoomMax = 21;

export default class KronoosMap {
    generateMap(mapElement, positions, callback, options = {}) {
        loadGoogleClasses(g => {
            let loadOptions = Object.assign({
                center: {lat: -15.77972,lng: -47.92972},
                zoom: 4
            }, options);

            let map = new g.maps.Map(mapElement.get(0), loadOptions);

            let bounds = new google.maps.LatLngBounds();
            _.each(positions, x => bounds.extend(x));
            map.setCenter(bounds.getCenter()); //or use custom center
            map.fitBounds(bounds);

            if (callback) callback(g, map);
        });
    }
}

export { KronoosMap };
