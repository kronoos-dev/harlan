import 'babel-polyfill';
import 'es6-shim';
import 'dom4';

import Interface from './internals/library/interface';
import ServerCommunication from './internals/library/server-communication';
import ImportXMLDocument from './internals/library/import-xml-document';
import Store from './internals/library/store';
import I18n from './internals/library/i18n';

(function(d) {
    var Harlan = require("./internals/controller");

    d.harlan = new Harlan();

    d.harlan.database = new SQL.Database();
    d.harlan.interface = new Interface(d.harlan);
    d.harlan.i18n = new I18n(localStorage.language ||
        navigator.language ||
        navigator.userLanguage || 'pt', this);
    d.harlan.server = d.harlan.serverCommunication = new ServerCommunication(d.harlan);
    d.harlan.xml = d.harlan.importXMLDocument = new ImportXMLDocument(d.harlan);

    /* Service Worker */
    require('./internals/modules/service-worker')(d.harlan);

    /* Parsers */
    require('./internals/parsers/placas-wiki')(d.harlan);
    require('./internals/parsers/cbusca')(d.harlan);
    require('./internals/parsers/ccbusca')(d.harlan);
    require('./internals/parsers/ccf')(d.harlan);
    require('./internals/parsers/ieptb')(d.harlan);
    require('./internals/parsers/rfbcnpj')(d.harlan);
    require('./internals/parsers/socialprofile')(d.harlan);

    /* Forms */
    require('./internals/forms/receita-certidao')(d.harlan);

    /* Modules */
    require('./internals/modules/logs/watch-onerror')(d.harlan);
    require('./internals/modules/analytics/google-analytics')(d.harlan);
    require('./internals/modules/security/antiphishing')(d.harlan);
    require('./internals/modules/i18n')(d.harlan);
    require('./internals/modules/bank-account')(d.harlan);
    require('./internals/modules/autocomplete')(d.harlan);
    require('./internals/modules/find-database')(d.harlan);
    require('./internals/modules/loader')(d.harlan);
    require('./internals/modules/error')(d.harlan);
    require('./internals/modules/geolocation')(d.harlan);
    require('./internals/modules/endpoint')(d.harlan);
    require('./internals/modules/database-search')(d.harlan);
    require('./internals/modules/modal')(d.harlan);
    require('./internals/modules/welcome-screen')(d.harlan);
    require('./internals/modules/authentication')(d.harlan);
    require('./internals/modules/report')(d.harlan);
    require('./internals/modules/module')(d.harlan);
    require('./internals/modules/selected-results')(d.harlan);
    require('./internals/modules/find-company')(d.harlan);
    require('./internals/modules/find-document')(d.harlan);
    require('./internals/modules/xml-document')(d.harlan);
    require('./internals/modules/section')(d.harlan);
    require('./internals/modules/iugu')(d.harlan);
    require('./internals/modules/database-error')(d.harlan);
    require('./internals/modules/messages')(d.harlan);
    require('./internals/modules/main-search')(d.harlan);
    require('./internals/modules/oauth-io')(d.harlan);
    require('./internals/modules/url-parameter')(d.harlan);
    require('./internals/modules/result')(d.harlan);
    require('./internals/modules/demonstrate')(d.harlan);
    require('./internals/modules/download')(d.harlan);
    require('./internals/modules/form')(d.harlan);
    require('./internals/modules/forgot-password')(d.harlan);
    require('./internals/modules/iframe-embed')(d.harlan);
    require('./internals/modules/site')(d.harlan);
    require('./internals/modules/placas-wiki')(d.harlan);
    require('./internals/modules/credits')(d.harlan);
    require('./internals/modules/alert')(d.harlan);
    //require('./internals/modules/push-notification')(d.harlan);
    require('./internals/modules/softphone')(d.harlan);
    require('./internals/modules/password')(d.harlan);
    require('./internals/modules/progress')(d.harlan);
    require('./internals/modules/subaccount')(d.harlan);
    require('./internals/modules/more-results')(d.harlan);
    require('./internals/modules/instant-search')(d.harlan);
    require('./internals/modules/tooltip')(d.harlan);
    require('./internals/modules/icheques')(d.harlan);
    require('./internals/modules/dive')(d.harlan);
    require('./internals/modules/socialprofile')(d.harlan);
    require('./internals/modules/kronoos')(d.harlan);
    require('./internals/modules/billing-information')(d.harlan);
    require('./internals/modules/bipbop')(d.harlan);
    require('./internals/modules/admin/index')(d.harlan);
    require('./internals/modules/account-overview')(d.harlan);
    require('./internals/modules/email-activation')(d.harlan);
    require('./internals/modules/timeline')(d.harlan);
    require('./internals/modules/data-company')(d.harlan);
    require('./internals/modules/ccbusca')(d.harlan);
    require('./internals/modules/generate-relations')(d.harlan);
    require('./internals/modules/admin/contact-types')(d.harlan);
    require('./internals/modules/smartsupp')(d.harlan);
    require('./internals/modules/cordova')(d.harlan);
    require('./internals/modules/blockui')(d.harlan);

    /**
     * From day to night and night to day
     * An endless sea of choice
     * If you should ever lose your way
     * Just listen to your voice
     */

    d.harlan.run();
})(window);
