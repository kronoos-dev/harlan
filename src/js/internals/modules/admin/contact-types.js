module.exports = controller => {
    controller.registerCall('admin::contactTypes', () => ({
        financeiro: 'Financeiro',
        comercial: 'Comercial',
        tecnico: 'Técnico'
    }));
};
