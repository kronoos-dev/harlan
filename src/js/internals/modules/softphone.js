import JsSIP from 'jssip';
import {
    queue
} from 'async';

var useragent, runningConfiguration, makecall;

module.exports = (controller) => {

    controller.registerCall("softphone::configuration", (callback) => {
        if (!localStorage.softphoneConfiguration) {
            if (callback) {
                controller.call("softphone::configure", callback);
            }
            return null;
        }
        var configuration = JSON.parse(localStorage.softphoneConfiguration);
        if (callback) callback(configuration);
        return configuration;
    });

    controller.registerCall("softphone::configure", (callback) => {
        let form = controller.call("form", (items) => {
                let configuration = {
                    'ws_servers': items.websocket,
                    'uri': `sip:${items.authorizationUser}@${items.domain}`,
                    'authorization_user': items.authorizationUser,
                    'password': items.password,
                    'register_expires': 9000,
                    'register': true,
                    'domain': items.domain
                };
                localStorage.softphoneConfiguration = JSON.stringify(configuration);
                controller.call("softphone::disconnect");
                callback(configuration);
            }),
            currentConfiguration = controller.call("softphone::configuration");
        form.configure({
            "title": "Instalação de Softphone",
            "subtitle": "Preencha as configurações abaixo.",
            "paragraph": "As subchaves possibilitam você trabalhar em um cadastro independente.",
            "gamification": "star",
            "screens": [{
                "magicLabel": true,
                "fields": [
                    [{
                        "name": "authorization-user",
                        "type": "text",
                        "placeholder": "Nome de Usuário",
                        "labelText": "Nome de Usuário",
                        "optional": false
                    }, {
                        "name": "password",
                        "type": "password",
                        "placeholder": "Senha",
                        "labelText": "Senha",
                        "optional": false
                    }], {
                        "name": "websocket",
                        "type": "text",
                        "placeholder": "Endereço SIP (wss://localhost/)",
                        "optional": false,
                        "labelText": "Endereço SIP-WS"
                    }, {
                        "name": "domain",
                        "type": "text",
                        "placeholder": "Domínio",
                        "optional": false,
                        "labelText": "Domínio",
                    }
                ]
            }]
        });
    });

    controller.registerTrigger("softphone::disconnected", "softphone", (data, cb) => {
        cb();
        controller.call("softphone::disconnect");
    });

    controller.registerTrigger("softphone::connected", "softphone", (data, cb) => {
        cb();
        /* pass */
    });

    controller.registerTrigger("softphone::registered", "softphone", (data, cb) => {
        cb();
        if (makecall && useragent) {
            makecall(useragent);
            makecall = null;
        }
    });

    controller.registerTrigger("softphone::unregistered", "softphone", (data, cb) => {
        cb();
        controller.call("softphone::disconnect");
    });

    controller.registerTrigger("softphone::registrationFailed", "softphone", (data, cb) => {
        cb();
        controller.call("softphone::disconnect");
    });

    controller.registerCall("softphone", (callback) => {
        if (useragent && useragent.isRegistered()) {
            callback(useragent);
            return;
        }
        makecall = callback;
        if (useragent) {
            return;
        }

        controller.call("softphone::configuration", (configuration) => {
            useragent = new JsSIP.UA(configuration);
            let events = ['connected', 'disconnected', 'registered', 'unregistered', 'registrationFailed', 'newSession', 'newMessage'];
            for (let event of events) {
                useragent.on(event, function() {
                    controller.trigger(`softphone::${event}`, Array.from(arguments));
                });
            }
            runningConfiguration = configuration;
            useragent.start();
        });
    });

    controller.registerCall("softphone::disconnect", (callback) => {
        if (!useragent) {
            if (callback) callback();
        }
        useragent.useragent.unregister();
        useragent.stop();
        makecall = null;
        useragent = null;
        runningConfiguration = null;
        if (callback) callback();
    });

    var defaultCallHandler = (callback, address, onEnd) => {
        let modal = controller.call("modal"),
            title = modal.title("Estamos realizando a ligação."),
            subtitle = modal.subtitle("Aguarde enquanto realizamos sua ligação."),
            paragraph = modal.paragraph("");

        modal.onClose = () => {
            controller.call("softphone::terminateCalls");
            if (onEnd) onEnd();
        };

        modal.createActions().cancel();

        let remoteView = document.createElement("video"),
            selfView = document.createElement("video");

        modal.element().append(selfView);
        modal.element().append(remoteView);

        var session = callback({
            confirmed: function (data) {
                console.log("confirmed");
                selfView.src = window.URL.createObjectURL(session.connection.getLocalStreams()[0]);
                remoteView.play();
                remoteView.volume = 1;
            },
            addstream: function (data) {
                console.log("addstream");
                var stream = data.stream;
                remoteView.src = window.URL.createObjectURL(stream);
                remoteView.play();
                remoteView.volume = 1;
            },
            progress: function(data) {
                title.text("progress");
                subtitle.text("in-progress-call");
                paragraph.text("in-progress-call");
            },
            failed: function(data) {
                title.text("failed");
                subtitle.text("failed-call");
                paragraph.text("failed-call");
            },
            ended: function(data) {
                modal.close();
            }
        });
    };

    controller.registerCall("softphone::terminateCalls", (callback) => {
        if (!useragent) {
            if (callback) callback();
        }
        useragent.terminateSessions();
        if (callback) callback();
    });

    controller.registerCall("softphone::call", (address, onEnd = null, callHandler = null) => {
        controller.call("softphone", (ua) => {
            let uri = address.indexOf('@') === -1 ?
                `sip:${address}@${runningConfiguration.domain}` :
                `sip:${address}`;

            (callHandler || defaultCallHandler)((eventHandlers) => {
                return ua.call(uri, {
                    'sessionTimersExpires': 900,
                    'eventHandlers': eventHandlers,
                    'mediaConstraints': {
                        'audio': true,
                        'video': false
                    },
                }, address, onEnd);
            });
        });
    });

};
