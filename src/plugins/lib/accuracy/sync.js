module.exports = function (controller) {

    controller.registerTrigger("accuracy::loggedin", "sync", (authData, callback) => {
        callback();
        controller.call("accuracy::sync", authData);
    });

    controller.registerCall("accuracy::sync::create", (authData) => {
        /* try send data */
        /* failed */
    });


    controller.registerCall("accuracy::sync", (authData) => {
        /* try send data */
        /* failed */
    });

};
