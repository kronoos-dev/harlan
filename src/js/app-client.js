import 'babel-polyfill';
import 'es6-shim';
import 'dom4';
import './internals/library/safari-hacks';

import Interface from './internals/library/interface';
import ServerCommunication from './internals/library/server-communication';
import ImportXMLDocument from './internals/library/import-xml-document';
import I18n from './internals/library/i18n';
import browserUpdate from 'browser-update';

(function(d) {
    const Harlan = require('./internals/controller');

    let harlan = new Harlan();
    d.harlan = harlan;

    harlan.database = new SQL.Database();
    harlan.interface = new Interface(harlan);
    harlan.i18n = new I18n(localStorage.language ||
        navigator.language ||
        navigator.userLanguage || 'pt', this);
    harlan.server = harlan.serverCommunication = new ServerCommunication(harlan);
    harlan.xml = harlan.importXMLDocument = new ImportXMLDocument(harlan);

    harlan.run();
})(window);
