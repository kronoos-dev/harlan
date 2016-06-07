module.exports = (controller) => {
    controller.unregisterTrigger("authentication::authenticated", "welcomeScreen::authenticated");
    controller.unregisterTrigger("call::authentication::loggedin", "icheques::welcome");
};
