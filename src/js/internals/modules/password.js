import owasp from 'owasp-password-strength-test';

const PASSWORD_TIPS = [
    'Tenha sempre instalado e atualizado em seu micro um programa antivírus e, se possível, programe-o para atualizar as listas de vírus automaticamente quando estiver conectado à internet.',
    'Troque sua senha da internet e do aplicativo periodicamente.',
    'Não acesse seus dados financeiros em equipamentos e/ou locais de pouca confiabilidade.',
    'Não abra arquivos de origem desconhecida, pois podem conter vírus, cavalos de Tróia e outras aplicações prejudiciais que ficam ocultas, mas permitem a fraudadores obter seus dados e posteriormente prejudicá-lo.',
    'Use provedores de acesso confiáveis e certifique-se que possuam políticas de segurança adequadas para o tráfego de informações pela internet.',
    'Muito cuidado com e-mails não solicitados contendo links ou anexos pedindo para que você acesse algum site e atualize seus dados.',
    'Não faça downloads (transferências de arquivos da internet para seu computador) de sites cuja procedência você não conheça.',
    'Atualize sempre as versões dos programas de navegação instalados em seu micro, pois, normalmente, os fabricantes desses programas incorporam maior segurança e criptografia nas versões mais recentes.',
    'Em caso de dúvida sobre a segurança do site ou algum procedimento que executou, entre em contato, prevenção é a melhor forma de segurança.',
    'Ao escolher sua senha não use combinações previsíveis ou mesmo datas de nascimento, números de telefone, placas de seus veículos, documentos de identidade.',
    'Não anote sua senha em lugares de fácil acesso a terceiros ou a tenha em sua bolsa ou carteira.',
    'Nunca revele sua senha a terceiros – ao digitá-la em um terminal qualquer ou no teclado de um microcomputador, certifique-se que outros não possam vê-la ou descobri-la pela movimentação dos dedos.',
    'Nunca digite ou transmita sua senha por telefone, pois ela pode estar sendo rastreada ou registrada na memória do aparelho.',
    'Troque a senha periodicamente.'
];

module.exports = controller => {

    controller.registerBootstrap('password', callback => {
        callback();
        $('#action-change-password').click(e => {
            e.preventDefault();
            controller.call('password::change');
        });
    });

    controller.registerCall('password::change', () => {
        const modal = controller.call('modal');
        modal.title('Troca de Senha');
        modal.subtitle('Troque periódicamente sua senha');
        modal.addParagraph(PASSWORD_TIPS[Math.floor(Math.random() * PASSWORD_TIPS.length)]);
        const form = modal.createForm();
        const inputPassword = form.addInput('password', 'password', 'Senha Antiga');
        const inputNewPassword = form.addInput('password', 'password', 'Nova Senha');
        const inputConfirmPassword = form.addInput('password-confirm', 'password', 'Confirmar Senha');

        form.addSubmit('login', 'Alterar Senha');

        form.element().submit(e => {
            e.preventDefault();

            const errors = [];
            const oldPassword = inputPassword.val();
            const password = inputNewPassword.val();
            const confirmPassword = inputConfirmPassword.val();

            if (!owasp.test(password).strong) {
                inputNewPassword.addClass('error');
                errors.push('A senha que você tenta configurar é muito fraca, tente' +
                             ' uma com 10 (dez) dígitos, números, caracteres maísculos,' +
                             ' minúsculos e especiais.');
            } else if (password !== confirmPassword) {
                inputNewPassword.addClass('error');
                inputConfirmPassword.addClass('error');
                errors.push('As senhas não conferem, verifique e tente novamente.');
            } else {
                inputNewPassword.removeClass('error');
                inputConfirmPassword.removeClass('error');
            }

            if (errors.length) {
                for (const i in errors) {
                    toastr.warning(errors[i], 'Não foi possível prosseguir.');
                }
                return;
            }

            controller.serverCommunication.call('SELECT FROM \'BIPBOPADMIN\'.\'PASSWORD\'', controller.call('error::ajax', {
                data: {
                    password : oldPassword,
                    'password-old': oldPassword,
                    'password-new': password,
                    'password-repeat': confirmPassword
                },
                success() {
                    controller.call('alert', {
                        icon: 'pass',
                        title: 'Sua senha foi alterada com sucesso!',
                        subtitle: 'A partir de agora você pode utilizar sua nova senha.',
                        paragraph: PASSWORD_TIPS[Math.floor(Math.random() * PASSWORD_TIPS.length)]
                    });
                }}));
        });

        modal.createActions().add('Cancelar').click(e => {
            e.preventDefault();
            modal.close();
        });
    });
};
