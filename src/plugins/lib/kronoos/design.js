import emailRegex from "email-regex";

module.exports = function(controller) {

    /* Document Title and Favicon */
    document.title = "Soluções em Gerenciamento de Riscos e Compliance | Kronoos";
    controller.interface.helpers.changeFavicon(`/images/kronoos-favicon.png`);

    /* Apply SCSS */
    require("../../styles/kronoos/application.js");
    require("../../styles/kronoos/site.js");
    require("../../styles/kronoos/print.js");

    /* HTML Templates */
    $("body")
        .append(require('../../templates/kronoos/site.html.js'))
        .append(require('../../templates/kronoos/application.html.js'))
        .append(require('../../templates/kronoos/print.html.js'));

    /* Actions */
    require("./design/resize");
    require("./design/print")(controller);
    require("./design/disabled-events")(controller);
    require("./design/login-events")(controller);
    require("./design/site-events")(controller);

};
