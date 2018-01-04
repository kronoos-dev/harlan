module.exports = controller => {
    if (controller.confs.kronoos.isKronoos) {
        controller.unregisterTrigger('authentication::authenticated', 'welcomeScreen::authenticated');
        controller.unregisterTrigger('serverCommunication::websocket::authentication', 'accountOverview');
    }
};
