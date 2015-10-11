/* global module, numeral */

var uniqid = require('uniqid');
var async = require("async");
var assert = require("assert");
var url = require('url');

var ServerCommunication = require("./library/serverCommunication");
var ImportXMLDocument = require("./library/importXMLDocument");

var Controller = function () {

    var myself = this;

    myself.confs = require("./config");

    var language = null;

    myself.i18n = (function (locale) {

        userLanguage = locale.split("-")[0];
        var validLanguages = {
            "pt": require("./i18n/pt")
        };

        language = validLanguages[userLanguage] ? userLanguage : "pt";


        document.documentElement.setAttribute("lang", language);

        try {
            moment.locale(locale);
            numeral.language(locale.toLowerCase());
        } catch (e) {
            console.log(e);
        }

        return validLanguages[language];
    })(localStorage.language || navigator.language || navigator.userLanguage || "pt");

    myself.language = function () {
        return language;
    };

    var bootstrapCalls = {};
    var calls = {};
    var events = {};

    /**
     * List all possible calls
     * @returns {Array}
     */
    myself.listCalls = (function () {
        return Object.keys(calls);
    });

    myself.query = url.parse(window.location.href, true).query;

    myself.registerBootstrap = function (name, callback) {
        bootstrapCalls[name] = callback;
        return myself;
    };

    myself.interface = (function () {

        var myself = this;

        var sheet = (function () {
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(""));
            document.head.appendChild(style);
            return style.sheet;
        })();

        myself.addCSSRule = function (selector, rules) {
            var index = sheet.cssRules.length;
            if ("insertRule" in sheet) {
                sheet.insertRule(selector + "{" + rules + "}", index);
            }
            else if ("addRule" in sheet) {
                sheet.addRule(selector, rules, index);
            }
            return myself.addCSSRule;
        };

        myself.addCSSDocument = function (href, media, type) {
            $("head").append($("<link />").attr({
                rel: "stylesheet",
                type: type || "text/css",
                href: href,
                media: media || "screen"
            }));
            return myself.addCSSDocument;
        };

        myself.widgets = require("./widgets/widgets");
        myself.helpers = require("./interface/interface");

        return myself;
    })();

    myself.registerTrigger = function (name, id, callback) {
        console.log(":: register trigger ::", name);
        if (!(name in events)) {
            events[name] = {};
        }
        events[name][id] = callback;
    };

    myself.trigger = function (name, args, onComplete) {

        var run = function () {
            if (onComplete) {
                onComplete();
            }
        };

        console.log(":: trigger ::", name);
        if (!(name in events)) {
            return myself;
        }

        var submits = events[name] ? Object.keys(events[name]).length : 0;
        if (submits === 0) {
            run();
            return myself;
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

        return myself;
    };

    myself.registerCall = function (name, callback) {
        console.log(":: register :: ", name);
        myself.trigger("call::register::" + name);
        calls[name] = callback;
        return myself;
    };

    myself.call = function (name, args) {
        myself.trigger("call::" + name);
        console.log(":: call ::", name);
        assert.ok(name in calls);
        if (calls[name]) {
            return calls[name](args);
        }
    };

    myself.serverCommunication = new ServerCommunication(myself);
    myself.importXMLDocument = new ImportXMLDocument(myself);

    /**
     * From day to night and night to day
     * An endless sea of choice
     * If you should ever lose your way
     * Just listen to your voice
     */

    myself.store = (function () {
        var myself = this;

        var elements = {};

        /**
         * Store a value
         * @param key
         * @param value
         * @returns idx
         */
        myself.set = function (key, value) {
            elements[key] = value;
            return myself;
        };

        /**
         * 
         * @param {string} key
         * @returns mixed
         */
        myself.get = function (key) {
            return elements[key];
        };

        /**
         * Recover a value
         * @param {int} idx
         * @returns mixed
         */
        myself.unset = function (idx) {
            delete elements[idx];
            return myself;
        };

        return myself;
    })();

    myself.run = function () {
        async.auto(bootstrapCalls, function (err, results) {
            console.log(":: bootstrap ::", err, results);
        });
    };

    /* Parsers */
    require("./parsers/placasWiki")(myself);
    require("./parsers/juntaEmpresa")(myself);

    /* Forms */
    require("./forms/receitaCertidao")(myself);

    /* Modules */
    require("./modules/i18n")(myself);
    require("./modules/autocomplete")(myself);
    require("./modules/openReceipt")(myself);
    require("./modules/findDatabase")(myself);
    require("./modules/loader")(myself);
    require("./modules/error")(myself);
    require("./modules/endpoint")(myself);
    require("./modules/clipboard")(myself);
    require("./modules/remove")(myself);
    require("./modules/databaseSearch")(myself);
    require("./modules/comments")(myself);
    require("./modules/modal")(myself);
    require("./modules/welcomeScreen")(myself);
    require("./modules/authentication")(myself);
    require("./modules/history")(myself);
    require("./modules/module")(myself);
    require("./modules/selectedResults")(myself);
    require("./modules/searchJuntaEmpresa")(myself);
    require("./modules/save")(myself);
    require("./modules/findCompany")(myself);
    require("./modules/findDocument")(myself);
    require("./modules/xmlDocument")(myself);
    require("./modules/section")(myself);
    require("./modules/databaseError")(myself);
    require("./modules/messages")(myself);
    require("./modules/mainSearch")(myself);
    require("./modules/push")(myself);
    require("./modules/oauth-io")(myself);
    require("./modules/urlParameter")(myself);
    require("./modules/generateResult")(myself);
    require("./modules/demonstrate")(myself);
    require("./modules/forgotPassword")(myself);
    require("./modules/iframeEmbed")(myself);
    require("./modules/analytics")(myself);
    require("./modules/site")(myself);
    require("./modules/placasWiki")(myself);
    require("./modules/proshield")(myself);

    return this;
};

module.exports = function () {
    return new Controller();
};
