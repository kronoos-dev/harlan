module.exports = (controller) => {
    if (controller.confs.kronoos.isKronoos) {
        controller.registerCall("authentication::loggedin", function() {
            controller.interface.helpers.activeWindow(".kronoos-application");
        });
    }
};
