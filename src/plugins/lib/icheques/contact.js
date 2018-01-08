/* global toastr */

module.exports = function (controller) {

    controller.registerCall('icheques::contact', function () {
        
        var modal = controller.call('modal');
        modal.title('Entrar em Contato');
        modal.subtitle('Somos rápidos em responder!');
        modal.addParagraph('Utilize o link de ajuda caso tenha ficado alguma dúvida, se não ajudar, entre em contato conosco.');
        var form = modal.createForm();
        form.addInput('name', 'text', 'Nome');
        form.addInput('email', 'email', 'Endereço de E-mail');
        form.addInput('company', 'text', 'Empresa (opcional)');
        form.addTextarea('message', 'Mensagem');
        form.element().submit(function (e) {
            e.preventDefault();
            modal.close();
            controller.serverCommunication.call('SELECT FROM \'ICHEQUESAUTHENTICATION\'.\'MESSAGE\'', {
                method: 'POST',
                data : form.element().serialize(),
                success: function () {
                    toastr.success('Sua mensagem foi enviada com sucesso', 'Em breve vamos respondê-lo.');
                }
            });
        });
        
        form.addSubmit('send', 'Enviar Mensagem');
        modal.createActions().add('Sair').click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    $('.icheques-site .action-message').click(function (e) {
        e.preventDefault();
        controller.call('icheques::contact');
    });
    
};