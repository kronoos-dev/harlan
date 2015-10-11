/* global module */

module.exports = function (controller) {
    controller.registerTrigger("findDatabase::table::RFB::CERTIDAO", "receitaCertidao::form", function (args, callback) {
        args.dom.find("input[name='nascimento']").mask("99/99/9999");
        callback();
    });
};