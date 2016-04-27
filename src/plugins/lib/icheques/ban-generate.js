import { BANFactory } from "./ban-factory.js";

const SPACES = /\s+/;
var company = null;

module.exports = function(controller) {

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::ban::register", function(currentCompany, callback) {
        callback();
        company = currentCompany;
    });

    controller.registerCall("icheques::ban::generate", (clientId, results, myCompany = null) => {
        myCompany = myCompany || company;
        clientId = clientId || '00000';
        new BANFactory(results, myCompany).generate(...controller.call("icheques::ban::refining"));
    });

    controller.registerCall("icheques::ban::refining", (clientId, results, myCompany = null) => {
        var modal = controller.call("modal");

        modal.title("Refinando os Dados");
        modal.subtitle("Aguarde, estamos refinando os dados para gerar o melhor .ban para você.");
        modal.paragraph("Estamos neste momento capturando as informações dos cheques e seus titulares para a geração do arquivo BAN.");
        var setProgress = modal.addProgress();

        return [modal, setProgress, (blob) => {
            controller.call("download", file, `iwba_${clientId}_${moment().format("DDMMYYhhmmss")}.ban`);
        }];
    });


};
