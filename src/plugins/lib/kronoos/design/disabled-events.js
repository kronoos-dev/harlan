module.exports = (controller) => {
    controller.unregisterTrigger("authentication::authenticated", "welcomeScreen::authenticated");
    controller.unregisterTrigger("serverCommunication::websocket::authentication", "accountOverview");
};
