module.exports = (controller) => {

    $(".kronoos-site .action-about-us").click((e) => {
        e.preventDefault();
        var modal = controller.call("modal");
        modal.gamification("pass");
        modal.title("Quem somos?");
        modal.paragraph(require("../../markdown/kronoos/team.html.js"));
        var form = modal.createForm();
        form.cancelButton("Sair");
    });

    $(".kronoos-site .action-use").click((e) => {
        e.preventDefault();
        var modal = controller.call("modal");
        modal.gamification("pass");
        modal.title("Termos de Uso");
        modal.paragraph(require("../../markdown/kronoos/terms-of-use.html.js"));
        var form = modal.createForm();
        form.cancelButton("Sair");
    });

    $(".kronoos-site .action-privacy").click((e) => {
        e.preventDefault();
        var modal = controller.call("modal");
        modal.gamification("pass");
        modal.title("Política de Privacidade");
        modal.paragraph(require("../../markdown/kronoos/politics-of-privacy.html.js"));
        var form = modal.createForm();
        form.cancelButton("Sair");
    });

    $(".kronoos-site .pep-know-more").click((e) => {
        e.preventDefault();
        var modal = controller.call("modal");
        modal.gamification("pass");
        modal.title("Pessoas Políticamente Expostas");
        modal.subtitle("O que é PEP? (Pessoa políticamente exposta.)");
        modal.paragraph(require("../../markdown/kronoos/pep.html.js"));
        var form = modal.createForm();
        form.cancelButton("Sair");
    });

};
