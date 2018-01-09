module.exports = controller => {
    controller.registerTrigger('findDatabase::table::RFB::CERTIDAO', 'receitaCertidao::form', ({dom}, callback) => {
        dom.find('input[name=\'nascimento\']').mask('00/00/0000');
        callback();
    });
};
