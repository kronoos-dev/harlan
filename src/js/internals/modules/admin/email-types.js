module.exports = (controller) => {
    controller.registerCall("admin::emailTypes", () => {
        return {
            "financeiro": "Financeiro",
            "comercial": "Comercial",
            "tecnico": "Técnico"
        };
    });
};
