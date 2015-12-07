module.exports = function (locale, controller) {

    var userLanguage = locale.split("-")[0];
    var validLanguages = {
        "pt": require("../i18n/pt")
    };

    var language = validLanguages[userLanguage] ? userLanguage : "pt";


    document.documentElement.setAttribute("lang", language);

    try {
        moment.locale(language);
        numeral.language(language.toLowerCase());
    } catch (e) {
        console.log(e);
    }

    return validLanguages[language];
};