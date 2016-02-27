/* global controller, numeral, Infinity, NaN, moment */
(function (controller) {
    var REGEX_TRIBUNAL = /SELECT\s+FROM\s+'([^']*)'\.'([^']*)'/i;
    var REGEX_SIGLA = /\'sigla\'\s*=\s*'([^']*)'/i;
    var REGEX_PARAMETER = /\'(numero_oab|processo|)\'\s*=\s*'([^']*)'/i;

    controller.trigger("projuris::init");
    controller.interface.helpers.logo.empty().append($("<div />").addClass("logo-projuris"));
    require("./styles/projuris.js");

    $(".scroll-down .actions").hide();
    $("#input-q").attr({
        placeholder: "Qual processo você esta procurando?",
        value: controller.serverCommunication.userHash().toString(),
        disabled: "disabled"
    });

    controller.registerCall("loader::catchElement", function () {
        return [];
    });

    $("title").text("Projuris | Processos Jurídicos Acompanhados no Sistema");
    $("link[rel='shortcut icon']").attr("href", "images/favicon-projuris.png");

    controller.serverCommunication.call("SELECT FROM 'PUSHJURISTEK'.'REPORT'", controller.call("loader::ajax", {
        success: function (document) {

            var section = controller.call("section",
                    "Processos Cadastrados",
                    "Processos jurídicos acompanhados no sistema",
                    "Créditos disponíveis e extrato");
            var jdocument = $(document);
            var result = controller.call("result");

            result.addItem("Usuário", jdocument.find("BPQL > body > username").text());

            var credits = parseInt(jdocument.find("BPQL > body > limit").text());
            var usedCredits = parseInt(jdocument.find("BPQL > body > total").text());
            var perc = (usedCredits / credits) * 100;

            if (perc == Infinity || isNaN(perc)) {
                perc = 0;
            }

            result.addItem("Créditos Contratados", numeral(credits).format('0,')).addClass("center");
            result.addItem("Créditos Utlizados", numeral(usedCredits).format('0,')).addClass("center");

            var radial = controller.interface.widgets.radialProject(result.addItem(null, "").addClass("center").find(".value"), perc);

            if (perc > 0.8) {
                radial.element.addClass("warning animated flash");
            } else if (perc > 0.6) {
                radial.element.addClass("attention animated flash");
            }


            var pushs = jdocument.find("BPQL > body push");
            if (pushs.length) {
                result.addSeparator("Extrato de Processos", "Processos Realizados", pushs.length === 1 ?
                        "1 processo" : pushs.length.toString() + " processos");

                pushs.each(function (idx, node) {
                    var jnode = $(node);
                    var resultNode = controller.call("result");
                    resultNode.addItem("Título", jnode.attr("label"));
                    resultNode.addItem("Versão", jnode.attr("version") || "0").addClass("center");
                    resultNode.addItem("Criação", moment(jnode.attr("created")).format('L')).addClass("center").addClass("center");
                    resultNode.addItem("Atualização", moment(jnode.attr("nextJob")).fromNow());

                    var sigla = jnode.find("data").text().match(REGEX_SIGLA);
                    if (sigla) {
                        resultNode.addItem("Sigla", sigla[1]);
                    }

                    var tribunal = jnode.find("data").text().match(REGEX_TRIBUNAL);
                    if (tribunal) {
                        resultNode.addItem(tribunal[1], tribunal[2]).css("width", "20%");
                    }

                    var parameter = jnode.find("data").text().match(REGEX_PARAMETER);
                    if (parameter) {
                        resultNode.addItem(parameter[1], parameter[2]);
                    }

                    result.element().append(resultNode.element().addClass("table"));
                });
            }

            section[1].append(result.element());
            $(".app-content").append(section[0]);
        }
    }));
})(harlan);