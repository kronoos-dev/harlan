module.exports = controller => {
    const siteTemplate = require('../../templates/dive-site.html.js');
    const emailRegex = require('email-regex');

    require('../../styles/dive.js');

    if (!controller.confs.dive.isDive) {
        return;
    }

    document.title = 'Mergulhe sua cobrança em dados. | Dive';
    controller.interface.helpers.changeFavicon('//cdn-dive.harlan.com.br/favicon.png');
    $(controller.confs.container).append(siteTemplate);

    const resize = () => {
        $('body > .dive-site .call-to-action').css({
            'min-height': $(window).height(),
            height: $(window).height()
        });
    };

    $(window).resize(resize);
    resize();

    /* única forma segura de sair do sistema e voltar a home */
    $('body > .dive-site .action-login').click(() => controller.interface.helpers.activeWindow('.login'));

    controller.registerCall('default::page', () => controller.interface.helpers.activeWindow(controller.confs.isPhone ? '.login' : '.dive-site'));

    const emailInput = $('body > .dive-site .email');
    $('body > .dive-site .form-createAccount').submit(e => {
        e.preventDefault();
        if (!emailRegex().test(emailInput.val())) {
            emailInput.addClass('error');
            return;
        }
        emailInput.removeClass('error');
        controller.call('bipbop::createAccount', emailInput.val());
    });

    $('.dive-site .action-buy').click(e => {
        e.preventDefault();
        controller.call('bipbop::createAccount');
    });
};
