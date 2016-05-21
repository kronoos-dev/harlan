/* global module */

module.exports = function(controller) {

    controller.registerCall("confirm", controller.confirm = function(parameters, onConfirm, onCancel) {
        parameters = parameters || {};
        var modal = controller.call("modal");
        modal.gamification(parameters.icon || "hammer");
        modal.title(parameters.title || "Você confirma essa operação?");
        modal.subtitle(parameters.subtitle || "Uma vez confirmado você não poderá desfazer esta operação.");
        if (parameters.paragraph) {
            modal.addParagraph(parameters.paragraph);
        }

        var form = modal.createForm();
        form.element().submit(function(e) {
            e.preventDefault();
            modal.close();
            if (onConfirm)
                onConfirm();
        });

        form.addSubmit("continue", parameters.confirmText || controller.i18n.system.confirm());

        var actions = modal.createActions();

        actions.add(controller.i18n.system.cancel()).click(function(e) {
            e.preventDefault();
            if (onCancel)
                onCancel();
            modal.close();
        });

        return {
            actions: actions,
            modal: modal,
            form: form
        };
    });

    controller.registerCall("alert", controller.alert = function(parameters, action) {
        parameters = parameters || {};
        var modal = controller.call("modal");
        modal.gamification(parameters.icon || "fail");
        modal.title(parameters.title || "Atenção!");
        modal.subtitle(parameters.subtitle || "Os campos preenchidos não conferem, tente novamente.");
        if (parameters.paragraph) {
            modal.addParagraph(parameters.paragraph);
        }

        var form = modal.createForm();
        form.cancelButton(controller.i18n.system.ok() || parameters.okText, () => {
            if (action) {
                action();
            }
            modal.close();
        });

        return {
            modal: modal,
            form: form
        };
    });
};
