import JsSIP from 'jssip';
JsSIP.debug.enable('JsSIP:*');

var useragent /* jssip instance */ ,
    runningConfiguration /* jssip configuration */ ,
    makecall /* callback for registered jssip */ ,
    cachedPCConfig /* cached peer connection config */ ;

module.exports = (controller) => {

    controller.registerTrigger("findDatabase::instantSearch", "softphone", function(args, callback) {
        callback();
        let [text, modal] = args;

        if (!/phone|limpar|configuração/i.test(text)) {
            return;
        }

        modal.item("Limpar Configuração Softphone",
                "Configuração Softphone Harlan",
                "Caso deseje utilizar o softphone deverá ser feita a configuração.")
            .addClass("softphone")
            .click(function() {
                controller.confirm({}, () => {
                    controller.alert({
                        icon: "pass",
                        title: "As configurações foram todas limpas com sucesso.",
                        subtitle: "Caso deseje utilizar o softphone terá de realizar a configuração.",
                        paragraph: "As configurações do softphone foram limpas deste computador, ninguém desta máquina poderá utilizar suas credenciais para realizar ligações."
                    });
                    delete localStorage.softphoneConfiguration;
                });
            });
    });

    controller.registerBootstrap("softphone", (cb) => {
        cb();
        controller.interface.helpers.menu.add("Discar", "phone").nodeLink.click((e) => {
            e.preventDefault();
            controller.call("softphone::keypad");
        });
    });

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
            "paragraph": "Caso não possua um provedor de VoIP via navegador verifique os planos da <a href=\"https://www.conectenos.com.br/\">Conecte-nos.</a>",
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
                "paragraph": "A configuração do <a href=\"https://www.xirsys.com\">XIRSYS</a> é obrigatória para que você tenha qualidade de ligação.",
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
            gamification = modal.gamification(),
            session,
            title = modal.title("Estamos realizando a ligação."),
            paragraph = modal.paragraph("Aguarde enquanto conectamos você ao número discado, certifique que seu headset esteja conectado. Não recomendamos o uso de caixas de som para ligação pois as mesmas podem causar eco e ruídos na ligação. Nós desejamos que sua ligação seja proveitosa.");

        let lastIcon, gamificationIcon = (icon) => {
            if (lastIcon) {
                gamification.removeClass(lastIcon);
            }
            lastIcon = icon;
            gamification.addClass(icon);
        };

        gamificationIcon("phone-icon-1");

        modal.onClose = () => {
            if (session) {
                try {
                    session.connection.close();
                    session.terminate();
                } catch (e) {}
            } else {
                controller.call("softphone::terminateCalls");
            }
            if (onEnd) onEnd();
        };

        let actions = modal.createActions(),
            lastTimeout, slider = actions.add("Volume").click(() => {
                let modal = controller.call("modal"),
                    form = modal.createForm();
                form.addInput("volume-slider", "range", "", {}, "", remoteView.volume).attr({
                    step: 0.1,
                    min: 0,
                    max: 1
                }).on("input", function() {
                    remoteView.volume = $(this).val();
                    localStorage.softphoneVolume = $(this).val();
                    if (lastTimeout) {
                        clearTimeout(lastTimeout);
                    }
                    lastTimeout = setTimeout(() => {
                        modal.close();
                    }, 600);
                });
                modal.createActions().cancel();
            });

        let muteButton = actions.add("Mudo"),
            muteText = muteButton.find("a");

        muteButton.click(() => {
            if (session.isMuted().audio) {
                session.unmute();
                muteText.text("Mudo");
            } else {
                session.mute();
                muteText.text("Remover Mudo");
            }
        });

        actions.cancel();

        let remoteView = document.createElement("video"),
            selfView = document.createElement("video");
        remoteView.src = "../assets/US_ringback_tone.ogg";
        remoteView.volume = localStorage.softphoneVolume ? parseInt(localStorage.softphoneVolume, 10) : 1
        remoteView.play();
        selfView.volume = 0;

        $([remoteView, selfView]).hide();

        modal.element().append(selfView);
        modal.element().append(remoteView);

        session = callback({
            confirmed: function(data) {
                selfView.src = window.URL.createObjectURL(session.connection.getLocalStreams()[0]);
                selfView.play();
            },
            addstream: function(data) {
                var stream = data.stream;
                remoteView.src = window.URL.createObjectURL(stream);
                remoteView.play();
            },
            progress: function(data) {
                gamificationIcon("phone-icon-5");
                title.text("Ligação em progresso");
                paragraph.text("Você está conectado ao número discado. Quando não desejar ser escutado clique no botão mute. Caso não esteja ouvindo bem a ligação você pode regular o volume no link logo abaixo. Nós desejamos que a ligação seja proveitosa.");

            },
            failed: function(data) {
                gamificationIcon("phone-icon-3");
                title.text("Falha ao estabelecer a ligação");
                paragraph.text("Ocorreu uma falha ao tentar estabelecer uma ligação, provávelmente a rede ou provedor VoIP esteja com alguma deficiência. Se certifique que o número existe e tente novamente mais tarde.");
                remoteView.stop();
                setTimeout(() => {
                    modal.close();
                }, 1600);
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
                    if (pcConfig) {
                        pcConfig.bundlePolicy = "max-bundle";
                        pcConfig.gatheringTimeout = 2000;
                    }
                    let session = ua.call(uri, {
                        'sessionTimersExpires': 500,
                        'eventHandlers': eventHandlers,
                        'mediaConstraints': {
                            'audio': true,
                            'video': false
                        },
                        'pcConfig': pcConfig ? pcConfig : null
                    }, address, onEnd);
                    return session;
                });
            });
        });
    });

    controller.registerCall("softphone::keypad", (callback, value = "") => {
        callback = callback || controller.reference("softphone::call");
        let modal = controller.call("modal");
        modal.gamification().addClass("phone-icon-7");
        modal.title("Digite o número de telefone.");
        modal.subtitle("Use o teclado para digitar ou as botões visíveis na interface.");
        modal.paragraph("Você pode digitar qualquer caracter com seu teclado ou os tradicionais usando as teclas disponíveis abaixo. Antes de submeter o número confirme, isso evita ligações indesejadas e custos adicionais. Atenção, as ligações podem estar sendo gravadas pelo provedor SIP ou pela plataforma.");
        let form = modal.createForm(),
            actions = modal.createActions(),
            phoneInput = form.addInput("phone", "text", "Telefone para Discagem", {}, false).val(value);

        actions.add("Limpar").click((e) => {
            e.preventDefault();
            phoneInput.val("");
        });
        actions.cancel();


        form.element().append($("<div />").addClass("input-submit")
            .append(phoneInput)
            .append(form.addSubmit("submit", "Discar")));

        phoneInput.focus();

        form.element().submit((e) => {
            e.preventDefault();
            modal.close();
            callback(phoneInput.val());
        });

        let digitInput = function(e) {
            e.preventDefault();
            phoneInput.val(phoneInput.val() + $(this).val());
        };

        form.addSubmit("send-1", "1").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-2", "2").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-3", "3").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-4", "4").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-5", "5").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-6", "6").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-7", "7").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-8", "8").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-9", "9").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-*", "*").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-0", "0").addClass("phone-keyboard").click(digitInput);
        form.addSubmit("send-#", "#").addClass("phone-keyboard").click(digitInput);

    });

};
