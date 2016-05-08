module.exports = function(controller) {

    if (!(controller.query.banId && controller.query.apiKey )) {
        cb();
        return;
    }

    controller.server.call("SELECT FROM 'iChequesFIDC'.'OPERATION'",
        controller.call("error::ajax", {
        data: {
            apiKey: controller.query.apiKey,
            id: controller.query.banId
        },
        success: (ret) => {
            let storage = [];
            $(ret).find("check").each(function() {
                storage.push(controller.call("icheques::parse::element", this));
            });
            controller.call("icheques::ban::generate", {
                values: storage
            }, args.company);
        },
        complete: () => {
            cb();
        }
    }));

};
