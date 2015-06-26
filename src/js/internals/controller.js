var uniqid = require('uniqid');
var async = require("async");
var assert = require("assert");
var url = require('url');

var ServerCommunication = require("./library/serverCommunication");
var ImportXMLDocument = require("./library/importXMLDocument");

module.exports = function () {

    this.confs = require("./config.js");

    this.i18n = (function (language) {
        var validLanguages = {
            "en": require("./i18n/en"),
            "pt": require("./i18n/pt")
        };
        
        return validLanguages[language] ? validLanguages[language] : validLanguages.en;
    })((localStorage.language || localharnavigator.language || navigator.userLanguage).split("-")[0]);

    var bootstrapCalls = {};
    var calls = {};
    var events = {};

    this.query = url.parse(window.location.href, true).query;

    this.registerBootstrap = function (name, callback) {
        bootstrapCalls[name] = callback;
        return this;
    };

    this.interface = (function () {

        var sheet = (function () {
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(""));
            document.head.appendChild(style);
            return style.sheet;
        })();

        this.addCSSRule = function (selector, rules) {
            var index = sheet.cssRules.length;
            if ("insertRule" in sheet) {
                sheet.insertRule(selector + "{" + rules + "}", index);
            }
            else if ("addRule" in sheet) {
                sheet.addRule(selector, rules, index);
            }
            return this.addCSSRule;
        };

        this.addCSSDocument = function (href, media, type) {
            $("head").append($("<link />").attr({
                rel: "stylesheet",
                type: type || "text/css",
                href: href,
                media: media || "screen"
            }));
            return this.addCSSDocument;
        };

        this.widgets = require("./widgets/widgets.js");

        return this;
    })();

    this.registerTrigger = function (name, callback) {
        console.log(":: register trigger ::", name);
        if (!(name in events)) {
            events[name] = [];
        }
        events[name].push(callback);
    };

    this.trigger = function (name, args, onComplete) {

        console.log(":: trigger ::", name);
        if (!(name in events)) {
            return this;
        }

        var submits = events[name].length;
        var runsAtEnd = function () {
            if (!--submits) {
                console.log(":: trigger :: end ::", name);
                if (onComplete)
                    onComplete();
            }
        };

        console.log(":: trigger :: init ::", name);
        for (var triggerId in events[name]) {
            events[name][triggerId](args, runsAtEnd);
        }

        return this;
    };

    this.registerCall = function (name, callback) {
        console.log(":: register :: ", name);
        this.trigger("call::register::" + name);
        calls[name] = callback;
        return this;
    };

    this.call = function (name, args, pageTitle, pageUrl) {
        this.trigger("call::" + name);
        console.log(":: call ::", name);
        assert.ok(name in calls);
        return calls[name](args);
    };

    this.serverCommunication = new ServerCommunication(this);
    this.importXMLDocument = new ImportXMLDocument(this);

    /**
     * From day to night and night to day
     * An endless sea of choice
     * If you should ever lose your way
     * Just listen to your voice
     */

    this.store = (function () {
        var elements = {};

        /**
         * Store a value
         * @param mixed value
         * @returns idx
         */
        this.set = function (key, value) {
            elements[key] = value;
            return this;
        };

        this.get = function (key) {
            return elements[key];
        };

        /**
         * Recover a value
         * @param int idx
         * @returns mixed
         */
        this.unset = function (idx) {
            delete elements[idx];
            return this;
        };

        return this;
    })();



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
    require("./modules/resultGenerator")(this);
    require("./modules/demonstrate")(this);
    require("./modules/forgotPassword")(this);
    require("./modules/iframeEmbed")(this);
    require("./modules/googleAnalytics")(this);

    return this;
};