import { BANFactory } from "./ban-factory.js";

const SPACES = /\s+/;

var removeDiacritics = require('diacritics').remove;
var company = null;

module.exports = function(controller) {

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::ban::register", function(currentCompany, callback) {
        callback();
        company = currentCompany;
    });

    controller.registerCall("icheques::ban::generate", (clientId, results, myCompany = null) => {
        myCompany = myCompany || company;
        clientId = clientId || '00000';
        let file = new BANFactory(results, myCompany).generate(),
            name = removeDiacritics(myCompany.nome || myCompany.responsavel).replace(SPACES, "-").toUpperCase();

        controller.call("download", file, `iwba_${clientId}_${moment().format("DDMMYYhhmmss")}.ban`);
    });

    controller.registerCall("icheques::ban::refining", (clientId, results, myCompany = null) => {
        var modal = controller.call("modal");

        modal.title("Refinando os dados");
        modal.subtitle("Aguarde, estamos refinando os dados para gerar o melhor .ban para você!");
    });


};
