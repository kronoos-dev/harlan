module.exports = function (locale, controller) {

    var userLanguage = locale.split("-")[0];
    var validLanguages = {
        "pt": require("../i18n/pt")
    };

    var validPikaday = {
        pt: {
            format: 'DD/MM/YYYY',
            i18n: {
                "previousMonth": "Mes Anterior", "nextMonth": "Mes Seguinte",
                "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
                "weekdays": ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
                "weekdaysShort": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
            }
        }
    };

    var numeralConversor = {
        "pt": "pt-br"
    };


    var language = validLanguages[userLanguage] ? userLanguage : "pt";

    document.documentElement.setAttribute("lang", language);

    var pikaday = $.fn.pikaday;
    $.fn.pikaday = function () {
        var args = Array.from(arguments);
        if (typeof args[0] !== "object") {
            args[0] = {};
        }
        args[0].format = validPikaday[language].format;
        args[0].i18n = validPikaday[language].i18n;
        return pikaday.apply(this, args);
    };

    try {
        moment.locale(language);
        numeral.language(numeralConversor[language]);
    } catch (e) {
        console.log(e);
    }

    var validLanguage = validLanguages[language];
    validLanguage.pikaday = validPikaday[language];
    return validLanguage;
};
