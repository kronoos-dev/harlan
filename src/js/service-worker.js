import localForage from 'localforage';

const genericMessage = (resolve, reject, event, error = null, opts = {}) => {
    return self.registration.showNotification(opts.title || 'Temos uma mensagem para você!', Object.assign({
        body: 'Você recebeu uma mensagem, para acessar clique aqui e abra sua conta.',
        icon: '/images/android/drawable-xxxhdpi/ic_launcher.png',
        tag: 'harlan-new-message'
    }, opts)).then(resolve).catch(reject);
};

self.addEventListener('push', event =>
    event.waitUntil(new Promise((resolve, reject) =>
        localForage.getItem('apikey', (err, apiKey) => {

            let message = (...args) => genericMessage(resolve, reject, event, ...args);
            if (err || !apiKey) {
                message(err);
                return;
            }

            let url = `https://irql.bipbop.com.br/?q=SELECT%20FROM%20%27HARLANMESSAGES%27.%27SEARCH%27&apiKey=${apiKey}&skip=0&limit=1`;
            fetch(url).then(response => response.text().then(text => {
                const parseXML = require('xml-reader');
                const queryXML = require('xml-query');

                let ast = parseXML.parseSync(text);
                let query = queryXML(ast);

                let nodeId = query.find('messages').find('node').find('id');
                if (!nodeId.length) {
                    message(event);
                    return;
                }

                let messageId = nodeId.text();
                let messageUrl = `https://irql.bipbop.com.br/?q=SELECT%20FROM%20%27HARLANMESSAGES%27.%27GET%27&apiKey=${apiKey}&skip=0&limit=1&id=${messageId}`;
                fetch(messageUrl).then(response => response.text().then(messageText => {
                    let messageAst = parseXML.parseSync(messageText);
                    let messageQuery = queryXML(messageAst);
                    message(null, {
                        title: messageQuery.find('subject').text().replace(/^[^\|]+\|/, '').trim(),
                        body: messageQuery.find('text').text(),
                        data: {
                            apiKey,
                            id: messageId,
                            content: messageText
                        }
                    });
                })).catch(error => message(error));
            })).catch(error => message(error));
        }))));

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.matchAll({type: 'window'}).then(clist => {
        return clients.openWindow(`/?apiKey=${event.notification.data.apiKey}&message=${event.notification.data.id}`);
    }));
});

self.addEventListener('message', ({data}) => {
    localForage.setItem('apikey', data);
});
