/* global self, clients */

self.addEventListener('push', function (event) {
    event.waitUntil(self.registration.showNotification("Temos uma mensagem para você!", {
        body: 'Você recebeu uma mensagem, para acessar clique aqui e abra sua conta.',
        icon: '/images/android/drawable-xxxhdpi/ic_launcher.png',
        tag: 'harlan-new-message'
    }));

});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(clients.matchAll({type: "window"}).then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url === '/' && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow) {
            return clients.openWindow('/');
        }
    }));
});
