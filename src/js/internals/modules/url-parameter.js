module.exports = function (controller) {

    var hasUrlParameter = false;

    controller.registerBootstrap('urlParameter', function (callback) {
        callback();

        if (typeof controller.query.q === 'undefined') {
            return;
        }

        $('.app .input-q').val(controller.query.q.replace(/\/$/, ''));
        $('.app .main-search').submit();
    });

};
