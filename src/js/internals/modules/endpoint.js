module.exports = controller => {

    controller.registerBootstrap('endpoint', callback => {
        callback();
        $('#action-show-endpoint').click(e => {
            e.preventDefault();
            controller.call('endpoint');
        });
    });

    controller.registerCall('endpoint', () => {
        const apiKey = controller.serverCommunication.apiKey();
        controller.call('alert', {
            icon: 'locked',
            title: 'Chave de API',
            subtitle: 'Atenção! Manipule com segurança.',
            paragraph: `A chave de API <strong class="apiKey">${apiKey}</strong> do seu usuário deve ser manipulada com segurança absoluta, não devendo ser repassada a terceiros. Tenha certeza que você sabe o que está fazendo.`
        });
    });
};
