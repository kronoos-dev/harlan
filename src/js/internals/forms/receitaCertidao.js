module.exports = function (controller) {
    controller.registerTrigger("findDatabase::table::RFB::CERTIDAO", "receitaCertidao::form", function (args, callback) {
        args.dom.find("input[name='nascimento']").mask("00/00/0000");
        callback();
    });
};
