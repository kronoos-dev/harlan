module.exports = controller => {
    controller.registerCall("admin::contactTypes", () => {
        return {
            "financeiro": "Financeiro",
            "comercial": "Comercial",
            "tecnico": "Técnico"
        };
    });
};
