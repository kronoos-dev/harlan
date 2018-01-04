import _ from 'underscore';

function graus2Radianos(graus) {
    return graus * ( Math.PI / 180 );
}

export function DistanceMeter(pontoInicial, pontoFinal) {

    if (typeof pontoInicial === 'string') {
        pontoInicial = _.object(['latitude', 'longitude'],
            pontoInicial.split(',').map(parseFloat));
    }

    var R = 6371;

    var dLat = graus2Radianos(pontoFinal.latitude) - graus2Radianos(pontoInicial.latitude);
    var dLon = graus2Radianos(pontoFinal.longitude) - graus2Radianos(pontoInicial.longitude);

    var sin = Math.sin(dLat / 2) * Math.sin(dLat / 2);
    var cos = Math.cos(graus2Radianos(pontoInicial.latitude)) * Math.cos(graus2Radianos(pontoFinal.latitude));
    var sinL = Math.sin(dLon / 2) * Math.sin(dLon / 2);

    var a = sin + cos * sinL;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1000);

}
