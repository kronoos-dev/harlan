module.exports = function (controller) {

    var webSocket;

    controller.registerCall("portofolioManager::init", function () {
        webSocket = controller.serverCommunication.webSocket();
        controller.interface.helpers.activeWindow(".portofolio");
    });

};
