import { CPF } from 'cpf_cnpj';

module.exportes = (controller) => {

    /* Design SCSS do Accuracy APP */
    require("../../styles/accuracy.js");

    /* Input de Login */
    const inputDocument = $("#input-cpf")
        .mask('000.000.000-00', {reverse: true});

    /* Verifica se o usuário já está logado */
    controller.call("accuracy::login", true, () => {
        /* need login */
        controller.interface.helpers.activeWindow(".login-accuracy");
    }, () => {
        /* change to the app screen */
        controller.interface.helpers.activeWindow(".app");
    });

    /* Manipula o Formulário de Login */
    $("#form-login-accuracy").submit((e) => {
        e.preventDefault();
        let cpfDocument = inputDocument.val();
        if (!CPF.isValid(cpfDocument)) {
            toastr.error("O documento informado não é válido",
                "Verifique o documento informado e tente novamente");
            inputDocument.addClass("error");
            return;
        }

        cpfDocument = CPF.strip(cpfDocument);

        controller.registerCall("accuracy::login::auth", cpfDocument, () => {
            controller.interface.helpers.activeWindow(".app");
        }, (errorMessage) => {
            toastr.error(errorMessage, "Não foi possível concluir a autenticação.");
            inputDocument.addClass("error");
        });
    });

    $("#clear-login-accuracy").click((e) => {
        e.preventDefault();

    });


};
