export default controller => {

    let webSocket;

    controller.registerCall('portofolioManager::init', () => {
        webSocket = controller.serverCommunication.webSocket();
        controller.interface.helpers.activeWindow('.portofolio');
    });

};
