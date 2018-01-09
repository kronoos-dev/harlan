/**
 * Internationalized strings in the document
 */
module.exports = controller => {

    const i18nTag = (domDocument, attribute) => {
        let i18nAttr = 'data-i18n';
        if (attribute) {
            i18nAttr += `-${attribute}`;
        }

        console.log(`I18n::${i18nAttr}`);
        $(domDocument).find(`*[${i18nAttr}]`).each((idx, node) => {
            const jnode = $(node);
            const components = jnode.attr(i18nAttr).split('.');
            
            const file = components.shift();
            if (!controller.i18n[file]) {
                return;
            }
            
            const key = components.join('.');
            const fncptr = controller.i18n[file][key];
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

    controller.registerCall('i18n', domDocument => {
        i18nTag(domDocument, null);
        i18nTag(domDocument, 'alt');
        i18nTag(domDocument, 'value');
        i18nTag(domDocument, 'title');
        i18nTag(domDocument, 'placeholder');
        i18nTag(domDocument, 'content');
    });

    controller.registerBootstrap('i18n', callback => {
        callback();
        controller.call('i18n', document);
    });
};