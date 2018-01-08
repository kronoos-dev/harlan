var owasp = require('owasp-password-strength-test');

module.exports = controller => {
    controller.registerCall('admin::changePassword', function(username) {
        var modal = controller.call('modal');
        modal.title('Nova Senha Usuário');
        modal.subtitle('Digite a nova senha de usuário.');
        modal.addParagraph('Cuidado para não criar uma nova senha para estranhos, certifique que você está' +
                            ' passando a senha para um contato conhecido.');

        var form = modal.createForm(),
            inputPassword = form.addInput('newpassword', 'password', 'Nova Senha'),
            inputConfirmPassword = form.addInput('newpassword-confirm', 'password', 'Confirmar Nova Senha');

        form.element().submit(function(e) {
            e.preventDefault();

            var errors = [],
                password = inputPassword.val(),
                confirmPassword = inputConfirmPassword.val();

            if (!owasp.test(password).strong) {
                inputPassword.addClass('error');
                errors.push('A senha que você tenta configurar é muito fraca, tente' +
                             ' uma com 10 (dez) dígitos, números, caracteres maísculos,' +
                             ' minúsculos e especiais.');
            } else if (password !== confirmPassword) {
                inputPassword.addClass('error');
                inputConfirmPassword.addClass('error');
                errors.push('A senhas informadas não conferem, verifique e tente novamente.');
            } else {
                inputPassword.removeClass('error');
                inputConfirmPassword.removeClass('error');
            }

            if (errors.length) {
                for (var i in errors) {

                    toastr.error(errors[i], 'Não foi possível prosseguir devido a um erro.');
                }
                return;
            }
            controller.call('confirm', {
                subtitle: 'Certifique-se de que a nova senha não esta sendo criada para um estranho, confirme de que este não se trata de um golpe.'
            }, () => {
                controller.serverCommunication.call('UPDATE \'BIPBOPCOMPANYS\'.\'PASSWORD\'',
                    controller.call('error::ajax', controller.call('loader::ajax', {
                        method: 'POST',
                        data: {
                            username: username,
                            password: inputPassword.val()
                        },
                        success: function() {
                            modal.close();
                        }
                    })));
            });
        });

        form.addSubmit('new-password', 'Alterar Senha');

        modal.createActions().add('Cancelar').click(function(e) {
            e.preventDefault();
            modal.close();
        });

    });
};
