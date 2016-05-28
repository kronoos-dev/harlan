import _ from "underscore";

const CNJ_REGEX_TPL = '(\\s|^)(\\d{7}\\-?\\d{2}.?\\d{4}\\.?\\d{1}\\.?\\d{2}\\.?\\d{4})(\\s|$)';
const CNJ_REGEX = new RegExp(CNJ_REGEX_TPL);

module.exports = function(controller) {

    controller.registerCall("kronoos::juristek", (proc, name, callback) => {
        controller.server.call("SELECT FROM 'JURISTEK'.'KRONOOS'", {
            data : {
                data : `SELECT FROM 'CNJ'.'PROCESSO' WHERE 'PROCESSO' = '${proc}'`
            },
            success: (ret) => {
                console.debug(ret);
            }
        });
    });

    controller.registerCall("kronoos::juristek::name", (name, callback) => {

        var CNJ_NUMBER = new RegExp(`${CNJ_REGEX_TPL}((?!${CNJ_REGEX_TPL}).)*${name}`, 'gi');
        console.debug(`${CNJ_REGEX_TPL}((?!${CNJ_REGEX_TPL}).)*${name}`);
        controller.server.call("SELECT FROM 'JUSSEARCH'.'CONSULTA'", {
            data: {
                data: name
            },
            success: function(ret) {
                var procs = [];
                $(ret).find("BPQL > body article").each((idx, article) => {
                    console.debug($(article).text());
                    procs = procs.concat($(article).text().match(CNJ_NUMBER));
                });
                callback(_.uniq(_.filter(procs).map((e) => {
                    return e.match(CNJ_REGEX)[0].replace(/[^\d]/g, '');
                })));
            }
        });
    });

};
