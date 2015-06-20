module.exports = function (controller) {
    controller.registerTrigger("findDatabase::table::RFB::CERTIDAO", function (args) {
        args.dom.find("input[name='nascimento']").mask("99/99/9999");
    });
};