/* global module, Notification, ServiceWorkerRegistration */

module.exports = function (controller) {

    var keyPushEndpoint = function () {
        return "keyPushEndpoint-" + controller.serverCommunication.userHash();
    };

    controller.registerTrigger("authentication::logout", "pushNotification::authentication::logout", function (opts, cb) {
        if (!localStorage[keyPushEndpoint()]) {
            cb();
            return;
        }

        controller.serverCommunication.call("DELETE FROM 'HARLANPUSH'.'ENDPOINT'",
                controller.call("error::ajax", {
                    data: {
                        endpoint: localStorage[keyPushEndpoint()]
                    },
                    complete: function () {
                        delete localStorage[keyPushEndpoint()];
                        cb();
                    }
                }));
    });

    controller.registerTrigger("authentication::authenticated", "pushNotification::authentication::authenticate", function (opts, cb) {
        cb();

        if (controller.server.freeKey()) {
            return;
        }

        /* Notification Check */
        if (typeof ServiceWorkerRegistration === "undefined") {
            return;
        }

        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.warn('Notifications aren\'t supported.');
            return;
        }

        if (!('PushManager' in window)) {
            console.warn('Push messaging isn\'t supported.');
            return;
        }

        if (localStorage[keyPushEndpoint()]) {
            /* habilitado */
            return;
        }

        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            var report = controller.call("report");
            report.title("Você gostaria de receber notificações?");
            report.subtitle("Nossa aplicação pode notificar no celular e navegador sobre eventos de seu interesse.");
            report.paragraph("Fique sabendo de qualquer atualização que surgir do seu celular ou navegador, para habilitar clique no botão abaixo.");
            report.button("Ativar Notificações", function () {
                serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true}).then(function (subscription) {
                    controller.serverCommunication.call(
                            "INSERT INTO 'HARLANPUSH'.'ENDPOINT'",
                            controller.call("error::ajax", {
                                data: {
                                    endpoint: subscription.endpoint
                                },
                                success: function () {
                                    controller.call("alert", {
                                        icon: "pass",
                                        title: "Notificações Ativadas",
                                        subtitle: "Agora você receberá notificações desta conta neste dispositivo.",
                                        paragraph: "Para as desativar basta executar o logout."
                                    });
                                    if (navigator.serviceWorker && navigator.serviceWorker.controller)
                                        navigator.serviceWorker.controller.postMessage(controller.server.apiKey());
                                    localStorage[keyPushEndpoint()] = subscription.endpoint;
                                    report.close();
                                }
                            }));
                }).catch(function (e) {
                    console.error("Push Notification", e);
                    controller.call("alert", {
                        title: "Não foi possível ativar as notificações!",
                        subtitle: "Provávelmente seu browser não suporta ou não há permissões requeridas."
                    });
                });
            });
            report.gamification("socialShare");
            $(".app-content").append(report.element());
        });
    });
};
