import JsSIP from 'jssip';
JsSIP.debug.enable('JsSIP:*');

var useragent /* jssip instance */ ,
    runningConfiguration /* jssip configuration */ ,
    makecall /* callback for registered jssip */ ,
    cachedPCConfig /* cached peer connection config */ ;

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
                let configuration = $.extend(items, {
                    ws_servers: items.websocket,
                    uri: `sip:${items.authorizationUser}@${items.domain}`,
                    authorization_user: items.authorizationUser,
                    password: items.password,
                    register_expires: 9000,
                    use_preloaded_route: true,
                    register: true,
                    domain: items.domain
                });
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
            "magicLabel": true,
            "screens": [{
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
            }, {
                "title": "Configuração da Plataforma XIRSYS",
                "subtitle": "O XIRSYS é um serviço que permite a você uma melhor qualidade na ligação.",
                "paragraph": "A configuração do XIRSYS é obrigatória para que você tenha qualidade de ligação.",
                "fields": [
                    [{
                        "name": "xirsys-ident",
                        "type": "text",
                        "placeholder": "Nome de Usuário",
                        "labelText": "Nome de Usuário",
                        "optional": false
                    }, {
                        "name": "xirsys-room",
                        "type": "text",
                        "placeholder": "Sala",
                        "labelText": "Sala",
                        "optional": false,
                        "value": "default"
                    }], {
                        "name": "xirsys-secret",
                        "type": "text",
                        "placeholder": "Chave de API Xirsys",
                        "labelText": "Chave de API Xirsys",
                        "optional": false
                    },
                    [{
                        "name": "xirsys-domain",
                        "type": "text",
                        "placeholder": "Domínio",
                        "value": window.location.hostname,
                        "optional": false,
                        "labelText": "Domínio"
                    }, {
                        "name": "xirsys-application",
                        "type": "text",
                        "value": "default",
                        "placeholder": "Aplicação",
                        "optional": false,
                        "labelText": "Aplicação",
                    }]
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
            return;
        }
        useragent.unregister();
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
            paragraph = modal.paragraph(""),
            form = modal.createForm(),
            slider = form.addInput("volume-slider", "range", "", {}, "", 1).attr({
                step: 0.1,
                min: 0,
                max: 1
            });

        modal.onClose = () => {
            controller.call("softphone::terminateCalls");
            if (onEnd) onEnd();
            slider.off("input");
        };

        let muteButton = modal.createActions().add("Mute").click(() => {
            if (session.isMuted().audio) {
                session.unmute();
                muteButton.find('a').text("Mute");
            } else {
                session.mute();
                muteButton.find('a').text("Unmute");
            }
        });
        modal.createActions().cancel();

        let remoteView = document.createElement("video"),
            selfView = document.createElement("video");

        $([remoteView, selfView]).hide();

        modal.element().append(selfView);
        modal.element().append(remoteView);

        slider.on("input", () => {
            let volume = slider.val();
            remoteView.volume = volume;
        });

        var session = callback({
            confirmed: function(data) {
                selfView.src = window.URL.createObjectURL(session.connection.getLocalStreams()[0]);
                selfView.play();
                selfView.volume = 1;
            },
            addstream: function(data) {
                var stream = data.stream;
                remoteView.src = window.URL.createObjectURL(stream);
                remoteView.play();
                remoteView.volume = 1;
            },
            progress: function(data) {
                title.text("Estamos realizando a ligação.");
                subtitle.text("A sua ligação está em curso...");
                paragraph.text("");
            },
            failed: function(data) {
                title.text("Falha ao estabelecer a ligação");
                subtitle.text("Tivemos um problema ao tentar estabelecer sua ligação.");
                paragraph.text("Verifique suas configurações e tente novamente mais tarde.");
            },
            ended: function(data) {
                modal.close();
            }
        });
    };

    controller.registerCall("softphone::terminateCalls", (callback) => {
        if (!useragent) {
            if (callback) callback();
            return;
        }
        useragent.terminateSessions();
        if (callback) callback();
    });

    controller.registerCall("softphone::xirsys", (callback) => {
        if (cachedPCConfig) {
            callback(cachedPCConfig);
            return;
        }

        controller.call("softphone::configuration", (configuration) => {
            $.ajax({
                url: "https://service.xirsys.com/ice",
                data: {
                    ident: configuration.xirsysIdent,
                    secret: configuration.xirsysSecret,
                    domain: configuration.xirsysDomain,
                    application: configuration.xirsysApplication,
                    room: configuration.xirsysRoom,
                    secure: 1
                },
                success: (data, status) => {
                    cachedPCConfig = data.d;
                    callback(data.d);
                },
                error: () => {
                    controller.confirm({
                        icon: "fail",
                        title: "Não foi possível estabelecer uma boa ligação com o XIRSYS.",
                        subtitle: "Se você estiver atrás de um firewall a qualidade de sua ligação pode ficar comprometida.",
                        paragraph: "Empresas que não utilizam tecnologia IPv6 ou que seus computadores não possuem endereço IPv4 real podem ter a qualidade de sua ligação sériamente comprometida, refaça a configuração VoIP."
                    }, () => {
                        callback(null);
                    });
                }
            });
        });
    });

    controller.registerCall("softphone::call", (address, onEnd = null, callHandler = null) => {
        controller.call("softphone", (ua) => {
            let uri = address.indexOf('@') === -1 ?
                `sip:${address}@${runningConfiguration.domain}` :
                `sip:${address}`;

            controller.call("softphone::xirsys", (pcConfig) => {
                (callHandler || defaultCallHandler)((eventHandlers) => {
                    return ua.call(uri, {
                        'sessionTimersExpires': 900,
                        'eventHandlers': eventHandlers,
                        'mediaConstraints': {
                            'audio': true,
                            'video': false
                        },
                        'pcConfig': pcConfig ? pcConfig.iceServers : null
                    }, address, onEnd);
                });
            });
        });
    });

};
