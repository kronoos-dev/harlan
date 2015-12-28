var JURISTEK_QUERYS = require("./lib/juristek-querys"),
        queue = require("async").queue;

(function (controller) {

    controller.registerTrigger("proshield::search", "spcnet::proshield::search", function (state, callback) {
        var juristekQueue = queue(function (task, callback) {
            controller.serverCommunication.call(task[2], {
                data: state.data,
                success: function (ret) {

                },
                completed: function () {
                    callback();
                }
            });


        }, 10);
        juristekQueue.drain = function () {
            callback();
        };
        juristekQueue.push(JURISTEK_QUERYS);
    });

})(harlan);