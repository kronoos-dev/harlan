import { BANFactory } from "./ban-factory.js";

const SPACES = /\s+/,
      DEFAULT_CLIENT_ID = '00000';

var company = null;

module.exports = function(controller) {

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::ban::register", function(currentCompany, callback) {
        callback();
        company = currentCompany;
    });

    controller.registerCall("icheques::ban::generate", (results, myCompany = null) => {
        myCompany = myCompany || company;

        var clientId = localStorage.getItem(`banId_${myCompany.username}`);

        var modal = controller.call("modal");
        modal.title("Código do Cliente BAN");
        modal.subtitle("Digite o código de cliente.");
        modal.paragraph("O código do cliente esta geralmente cadastrado no ERP da empresa, caso não saiba deixe em branco.");
        var form = modal.createForm(),
            clientName = form.addInput("name", "text", "Código ou Nome de Cliente", {}, "", clientId);
        form.addSubmit("submit", "Gerar .BAN");
        form.element().submit((e) => {
            e.preventDefault();
            modal.close();
            var clientId = clientName.val().replace(/\s+/g, ' ').trim();
            localStorage.setItem(`banId_${myCompany.username}`, clientId);
            new BANFactory(controller.server.call, results, myCompany)
                .generate(...controller.call("icheques::ban::refining", results, myCompany));
        });
        modal.createActions().cancel();
    });

    controller.registerCall("icheques::ban::refining", (results, myCompany = null) => {
        var modal = controller.call("modal"),
            clientId = localStorage.getItem(`banId_${myCompany.username}`) || DEFAULT_CLIENT_ID;

        modal.title("Refinando os Dados");
        modal.subtitle("Aguarde, estamos refinando os dados para gerar o melhor .ban para você.");
        modal.paragraph("Estamos neste momento capturando as informações dos cheques e seus titulares para a geração do arquivo BAN.");
        var setProgress = modal.addProgress();

        return [modal, setProgress, (blob) => {
            controller.call("download", blob, `iwba_${clientId}_${moment().format("DDMMYYhhmmss")}.ban`);
        }];
    });


};
