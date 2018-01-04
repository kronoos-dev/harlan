module.exports = function (controller) {

    var sheet = (function () {
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(''));
        document.head.appendChild(style);
        return style.sheet;
    })();

    this.addCSSRule = function (selector, rules) {
        var index = sheet.cssRules.length;
        if ('insertRule' in sheet) {
            sheet.insertRule(selector + '{' + rules + '}', index);
        }
        else if ('addRule' in sheet) {
            sheet.addRule(selector, rules, index);
        }
        return this.addCSSRule;
    };

    this.addCSSDocument = function (href, media, type) {
        $('head').append($('<link />').attr({
            rel: 'stylesheet',
            type: type || 'text/css',
            href: href,
            media: media || 'screen'
        }));
        return this.addCSSDocument;
    };

    this.widgets = require('../widgets/widgets');
    this.helpers = require('../interface/interface');

    return this;
};