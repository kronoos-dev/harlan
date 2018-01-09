import emailRegex from 'email-regex';

module.exports = controller => {

    /* Apply SCSS */
    require('../../styles/kronoos/fonts.js');
    require('../../styles/kronoos/application.js');

    /* HTML Templates */
    $(controller.confs.container)
        .append(require('../../templates/kronoos/application.html.js'));

    if (controller.confs.kronoos.isKronoos) {
        /* Document Title and Favicon */
        document.title = 'Soluções em Gerenciamento de Riscos e Compliance | Kronoos';
        controller.interface.helpers.changeFavicon('/images/kronoos/favicon.png');
        controller.confs.loader.animations = ['animated bounceIn'];
        $(controller.confs.container)
            .append(require('../../templates/kronoos/site.html.js'));

        require('../../styles/kronoos/site.js');
    }

    /* Actions */
    require('./design/resize')(controller);
    require('./design/disabled-events')(controller);
    require('./design/login-events')(controller);
    require('./design/mask')(controller);
    require('./design/actions')(controller);
};
