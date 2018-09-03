import oneTime from 'one-time';

module.exports = controller => {
    const kronoosCall = oneTime(args => $.getScript('/js/kronoos.js', () => controller.trigger('kronoos::init', args)));
    const refinCall = oneTime(() => $.getScript('https://www.npmjs.com/package/harlan-icheques-refin'));
    if (!controller.confs.icheques.hosts.includes(document.location.hostname)) return;

    controller.registerBootstrap('icheques::init::plataform', callback => $.getScript('/js/icheques.js', () => {

        if (navigator.userAgent.match(/iPad/i) !== null) {
            callback();
            return;
        }

        callback();

        controller.registerTrigger('serverCommunication::websocket::authentication::end', 'kronoosPlugin', (args, callbackAuthentication) => {
            callbackAuthentication();
            if (controller.confs.user.tags.indexOf('no-refin').indexOf() === -1) refinCall();
            if (/federal\s*invest/i.test(controller.confs.user.commercialReference)) return;
            kronoosCall(args);
        });
    }));
};
