module.exports = function (locale, controller) {

    userLanguage = locale.split("-")[0];
    var validLanguages = {
        "pt": require("../i18n/pt")
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
};