module.exports = (controller) => {
    controller.registerCall("authentication::loggedin", function() {
        controller.interface.helpers.activeWindow(".kronoos-application");
    });
};
