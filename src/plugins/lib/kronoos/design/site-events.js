module.exports = (controller) => {
    
    $("body > .kronoos-site .action-login").click(function() {
        controller.interface.helpers.activeWindow(".login");
    });

    controller.registerCall("default::page", function() {
        controller.interface.helpers.activeWindow(".kronoos-site");
    });

    var emailInput = $("body > .kronoos-site .email");
    $("body > .kronoos-site .form-createAccount").submit(function(e) {
        e.preventDefault();
        if (!emailRegex().test(emailInput.val())) {
            emailInput.addClass("error");
            return;
        }
        emailInput.removeClass("error");
        controller.call("kronoos::site::contact",
            emailInput.val(),
            "Realizar Orçamento",
            "Olá! Nossa empresa gostaria de solicitar um orçamento para utilizar vossa ferramenta, desde já aguardamos resposta.");
    });

};
