import _ from 'underscore';

function graus2Radianos(graus) {
    return graus * ( Math.PI / 180 );
}

export function DistanceMeter(pontoInicial, {latitude, longitude}) {

    if (typeof pontoInicial === 'string') {
        pontoInicial = _.object(['latitude', 'longitude'],
            pontoInicial.split(',').map(parseFloat));
    }

    const R = 6371;

    const dLat = graus2Radianos(latitude) - graus2Radianos(pontoInicial.latitude);
    const dLon = graus2Radianos(longitude) - graus2Radianos(pontoInicial.longitude);

    const sin = Math.sin(dLat / 2) * Math.sin(dLat / 2);
    const cos = Math.cos(graus2Radianos(pontoInicial.latitude)) * Math.cos(graus2Radianos(latitude));
    const sinL = Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const a = sin + cos * sinL;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1000);

}
