import { BANFactory } from "./ban-factory.js";

const SPACES = /\s+/;

var removeDiacritics = require('diacritics').remove;
var company = null;

module.exports = function(controller) {

    controller.registerTrigger("serverCommunication::websocket::authentication", "icheques::ban::register", function(currentCompany, callback) {
        callback();
        company = currentCompany;
    });

    controller.registerCall("icheques::ban::generate", (results, myCompany = null) => {
        myCompany = myCompany || company;
        let file = new BANFactory(results, myCompany).generate(),
            name = removeDiacritics(myCompany.nome || myCompany.responsavel).replace(SPACES, "-").toUpperCase();

        controller.call("download", file, `iwba_00000_${moment().format("DDMMYYhhmmss")}.ban`);
    });


};
