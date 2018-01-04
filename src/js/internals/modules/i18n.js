/**
 * Internationalized strings in the document
 */
module.exports = function (controller) {

    var i18nTag = function (domDocument, attribute) {
        var i18nAttr = 'data-i18n';
        if (attribute) {
            i18nAttr += '-' + attribute;
        }

        console.log('I18n::' + i18nAttr);
        $(domDocument).find('*[' + i18nAttr + ']').each(function (idx, node) {
            var jnode = $(node);
            var components = jnode.attr(i18nAttr).split('.');
            
            var file = components.shift();
            if (!controller.i18n[file]) {
                return;
            }
            
            var key = components.join('.');
            var fncptr = controller.i18n[file][key];
            if (!fncptr) {
                return;
            }

            if (attribute) {
                jnode.attr(attribute, fncptr());
            } else {
                jnode.text(fncptr());
            }
        });
    };

    controller.registerCall('i18n', function (domDocument) {
        i18nTag(domDocument, null);
        i18nTag(domDocument, 'alt');
        i18nTag(domDocument, 'value');
        i18nTag(domDocument, 'title');
        i18nTag(domDocument, 'placeholder');
        i18nTag(domDocument, 'content');
    });

    controller.registerBootstrap('i18n', function (callback) {
        callback();
        controller.call('i18n', document);
    });
};