module.exports = controller => {

    if (!(controller.query.banId && controller.query.apiKey )) {
        return;
    }

    controller.server.call('SELECT FROM \'ICHEQUESFIDC\'.\'OPERATION\'',
        controller.call('error::ajax', {
            data: {
                apiKey: controller.query.apiKey,
                id: controller.query.banId
            },
            success: ret => {
                let storage = [];
                let companyObj = controller.call('data::company', $(ret).find('body > company'));

                $(ret).find('check').each(function() {
                    storage.push(controller.call('icheques::parse::element', this));
                });

                controller.call('icheques::ban::generate', {
                    values: storage
                }, companyObj);
            }
        })
    );

};
