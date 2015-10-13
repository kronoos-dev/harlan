/* global module, numeral */

var uniqid = require('uniqid');
var async = require("async");
var assert = require("assert");
var url = require('url');

var ServerCommunication = require("./library/serverCommunication");
var ImportXMLDocument = require("./library/importXMLDocument");
var Interface = require("./library/interface.js");
var I18n = require("./library/i18n.js");
var Store = require("./library/store.js");

var Controller = function () {

    this.confs = require("./config");

    var language = null;

    this.i18n = new I18n(localStorage.language || 
            navigator.language || 
            navigator.userLanguage || "pt", this);

    this.language = function () {
        return language;
    };

    var bootstrapCalls = {};
    var calls = {};
    var events = {};

    /**
     * List all possible calls
     * @returns {Array}
     */
    this.listCalls = function () {
        return Object.keys(calls);
    };

    this.query = url.parse(window.location.href, true).query;

    this.registerBootstrap = function (name, callback) {
        bootstrapCalls[name] = callback;
        return this;
    };

    this.interface = new Interface(this);

    this.registerTrigger = function (name, id, callback) {
        console.log(":: register trigger ::", name);
        if (!(name in events)) {
            events[name] = {};
        }
        events[name][id] = callback;
    };

    this.trigger = function (name, args, onComplete) {

        var run = function () {
            if (onComplete) {
                onComplete();
            }
        };

        console.log(":: trigger ::", name);
        if (!(name in events)) {
            return this;
        }

        var submits = events[name] ? Object.keys(events[name]).length : 0;
        if (submits === 0) {
            run();
            return this;
        }

        var runsAtEnd = function () {
            if (!--submits) {
                console.log(":: trigger :: end ::", name);
                run();
            }
        };

        console.log(":: trigger :: init ::", name);

        for (var triggerName in events[name]) {
            console.log(name + " executing " + triggerName);
            events[name][triggerName](args, runsAtEnd);
        }

        return this;
    };

    this.registerCall = function (name, callback) {
        console.log(":: register :: ", name);
        this.trigger("call::register::" + name);
        calls[name] = callback;
        return this;
    };

    this.call = function (name, args) {
        this.trigger("call::" + name);
        console.log(":: call ::", name);
        assert.ok(name in calls);
        if (calls[name]) {
            return calls[name](args);
        }
    };

    this.serverCommunication = new ServerCommunication(this);
    this.importXMLDocument = new ImportXMLDocument(this);

    /**
     * From day to night and night to day
     * An endless sea of choice
     * If you should ever lose your way
     * Just listen to your voice
     */

    this.store = new Store(this);

    this.run = function () {
        async.auto(bootstrapCalls, function (err, results) {
            console.log(":: bootstrap ::", err, results);
        });
    };

    /* Parsers */
    require("./parsers/placasWiki")(this);
    require("./parsers/juntaEmpresa")(this);

    /* Forms */
    require("./forms/receitaCertidao")(this);

    /* Modules */
    require("./modules/i18n")(this);
    require("./modules/autocomplete")(this);
    require("./modules/openReceipt")(this);
    require("./modules/findDatabase")(this);
    require("./modules/loader")(this);
    require("./modules/error")(this);
    require("./modules/endpoint")(this);
    require("./modules/clipboard")(this);
    require("./modules/remove")(this);
    require("./modules/databaseSearch")(this);
    require("./modules/comments")(this);
    require("./modules/modal")(this);
    require("./modules/welcomeScreen")(this);
    require("./modules/authentication")(this);
    require("./modules/history")(this);
    require("./modules/module")(this);
    require("./modules/selectedResults")(this);
    require("./modules/searchJuntaEmpresa")(this);
    require("./modules/save")(this);
    require("./modules/findCompany")(this);
    require("./modules/findDocument")(this);
    require("./modules/xmlDocument")(this);
    require("./modules/section")(this);
    require("./modules/databaseError")(this);
    require("./modules/messages")(this);
    require("./modules/mainSearch")(this);
    require("./modules/push")(this);
    require("./modules/oauth-io")(this);
    require("./modules/urlParameter")(this);
    require("./modules/generateResult")(this);
    require("./modules/demonstrate")(this);
    require("./modules/forgotPassword")(this);
    require("./modules/iframeEmbed")(this);
    require("./modules/analytics")(this);
    require("./modules/site")(this);
    require("./modules/placasWiki")(this);
    require("./modules/proshield")(this);

    return this;
};

module.exports = function () {
    return new Controller();
};
