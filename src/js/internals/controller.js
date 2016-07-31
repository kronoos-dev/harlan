import async from 'async';
import assert from 'assert';
import url from 'url';
import _ from 'underscore';

import ServerCommunication from './library/server-communication';
import ImportXMLDocument from './library/import-xml-document';
import Interface from './library/interface.js';
import I18n from './library/i18n.js';
import Store from './library/store.js';

var Controller = function() {

    this.database = new SQL.Database();
    this.confs = require('./config');
    var language = null;

    this.i18n = new I18n(localStorage.language ||
        navigator.language ||
        navigator.userLanguage || 'pt', this);

    this.language = () => {
        return language;
    };

    var bootstrapCalls = {};
    var calls = {};
    var events = {};

    this.endpoint = {};

    /**
     * List all possible calls
     * @returns {Array}
     */
    this.listCalls = () => {
        return Object.keys(calls);
    };

    this.query = url.parse(window.location.href, true).query;

    this.registerBootstrap = (name, callback) => {
        bootstrapCalls[name] = callback;
        return this;
    };

    this.interface = new Interface(this);

    this.unregisterTriggers = (name, except = []) => {
        for (let i in events[name]) {
            if (except.indexOf(i) != -1) {
                continue;
            }
            delete events[name][i];
        }
    };

    this.unregisterTrigger = (name, ...list) => {
        if (events[name]) {
            for (let e of list) {
                if (events[name][e]) {
                    delete events[name][e];
                }
            }
        }
    };

    this.registerTrigger = (name, id, callback) => {
        console.log(':: register trigger ::', name);
        if (!(name in events)) {
            events[name] = {};
        }
        events[name][id] = callback;
    };

    this.trigger = (name, args, onComplete) => {

        var run = () => {
            if (onComplete) {
                onComplete();
            }
        };

        console.log(':: trigger ::', name, args);
        if (!(name in events)) {
            run();
            return this;
        }

        var submits = events[name] ? Object.keys(events[name]).length : 0;
        if (submits === 0) {
            run();
            return this;
        }

        var runsAtEnd = () => {
            if (!--submits) {
                console.log(':: trigger :: end ::', name);
                run();
            }
        };

        console.log(':: trigger :: init ::', name);

        for (let triggerName in events[name]) {
            if (!events[name][triggerName]) {
                submits--;
                continue;
            }
            console.log(`${name} executing ${triggerName}`);
            events[name][triggerName](args, runsAtEnd);
        }

        return this;
    };

    this.registerCall = (name, callback) => {
        console.log(':: register :: ', name);
        this.trigger(`call::register::${name}`);
        calls[name] = callback;
        return this;
    };

    this.listCalls = (regex) => {
        regex = regex || /.*/;
        for (let key in calls) {
            if (regex.test(key)) {
                console.log(`harlan.call('${key}')`, calls[key]);
            }
        }
    };

    this.reference = (name) => {
        return (...parameters) => {
            this.call(name, ...parameters);
        };
    };

    this.call = (name, ...parameters) => {
        console.log(':: call ::', name, parameters);
        assert.ok(name in calls);
        var data = calls[name](...parameters);
        this.trigger(`call::${name}`, parameters);
        return data;
    };

    this.server = this.serverCommunication = new ServerCommunication(this);
    this.xml = this.importXMLDocument = new ImportXMLDocument(this);

    this.store = new Store(this);

    this.run = () => {
        var calls = bootstrapCalls; /* prevent race cond */
        bootstrapCalls = {};

        var me = this;

        //debugDevil(calls, me);

        async.auto(calls, (err, results) => {
            console.log(':: bootstrap ::', err, results);
            me.trigger('bootstrap::end');
        });
    };

    /* Service Worker */
    require('./modules/service-worker')(this);

    /* Web3 */
    require('./modules/web3');

    /* Parsers */
    require('./parsers/placas-wiki')(this);
    require('./parsers/cbusca')(this);
    require('./parsers/ccbusca')(this);
    require('./parsers/socialprofile')(this);

    /* Forms */
    require('./forms/receita-certidao')(this);

    /* Modules */
    require('./modules/logs/watch-onerror.js')(this);
    require('./modules/analytics/google-analytics')(this);
    require('./modules/security/antiphishing')(this);
    require('./modules/i18n')(this);
    require('./modules/autocomplete')(this);
    require('./modules/find-database')(this);
    require('./modules/loader')(this);
    require('./modules/error')(this);
    require('./modules/endpoint')(this);
    require('./modules/database-search')(this);
    require('./modules/modal')(this);
    require('./modules/welcome-screen')(this);
    require('./modules/authentication')(this);
    require('./modules/report')(this);
    require('./modules/module')(this);
    require('./modules/selected-results')(this);
    require('./modules/find-company')(this);
    require('./modules/find-document')(this);
    require('./modules/xml-document')(this);
    require('./modules/section')(this);
    require('./modules/iugu')(this);
    require('./modules/database-error')(this);
    require('./modules/messages')(this);
    require('./modules/main-search')(this);
    require('./modules/oauth-io')(this);
    require('./modules/url-parameter')(this);
    require('./modules/result')(this);
    require('./modules/demonstrate')(this);
    require('./modules/download')(this);
    require('./modules/form')(this);
    require('./modules/forgot-password')(this);
    require('./modules/iframe-embed')(this);
    require('./modules/site')(this);
    require('./modules/placas-wiki')(this);
    require('./modules/credits')(this);
    require('./modules/alert')(this);
    //require('./modules/push-notification')(this);
    require('./modules/softphone')(this);
    require('./modules/password')(this);
    require('./modules/progress')(this);
    require('./modules/subaccount')(this);
    require('./modules/more-results')(this);
    require('./modules/instant-search')(this);
    require('./modules/tooltip')(this);
    require('./modules/icheques')(this);
    require('./modules/dive')(this);
    require('./modules/socialprofile')(this);
    require('./modules/kronoos')(this);
    require('./modules/billing-information')(this);
    require('./modules/bipbop')(this);
    require('./modules/admin/index')(this);
    require('./modules/email-activation')(this);
    require('./modules/timeline')(this);
    require('./modules/data-company')(this);
    require('./modules/ccbusca')(this);
    require('./modules/geolocation')(this);
    require('./modules/generate-relations')(this);
    require('./modules/admin/contact-types')(this);

    /**
     * From day to night and night to day
     * An endless sea of choice
     * If you should ever lose your way
     * Just listen to your voice
     */

    return this;
};

module.exports = () => {
    return new Controller();
};
