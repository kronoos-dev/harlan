module.exports = (controller) => {
    controller.unregisterTrigger("authentication::authenticated", "welcomeScreen::authenticated");
};
