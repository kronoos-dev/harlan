module.exports = controller => {
    if (controller.confs.kronoos.isKronoos) {
        controller.registerCall('authentication::loggedin', () => {
            controller.interface.helpers.activeWindow('.kronoos-application');
        });
    }
};
