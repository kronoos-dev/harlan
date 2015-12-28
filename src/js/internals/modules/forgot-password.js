module.exports = function (controller) {
    controller.registerBootstrap("forgotPassword", function (callback) {
        callback();
        $("#forgot-password").click(function () {
            var modal = controller.call("modal");
            modal.title("Recupere sua senha");
            modal.subtitle("Insira seus dados para prosseguir");
            modal.addParagraph("Para recuperar seu nome de usuário e/ou senha, você tem de saber o endereço de email que usou quando se registrou no Harlan.");
            var form = modal.createForm();
            form.element().submit(function (e) {
                e.preventDefault();
                
            });
            form.addInput("email", "text", "Endereço de e-mail.");
            form.addSubmit("recover", "Recuperar");
            form.addSubmit("exit", "Sair").click(function (e) {
                e.preventDefault();
                modal.close();
            });
        });
    });
}; 