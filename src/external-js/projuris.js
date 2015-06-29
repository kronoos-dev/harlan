/* global harlan, numeral, Infinity, NaN */

var REGEX_TRIBUNAL = /SELECT\s+FROM\s+'([^']*)'\.'([^']*)'/i;
var REGEX_SIGLA = /\'sigla\'\s*=\s*'([^']*)'/i;
var REGEX_PARAMETER = /\'(numero_oab|processo|)\'\s*=\s*'([^']*)'/i;
 
harlan.trigger("projuris::init");
harlan.interface.instance.logo.empty().append($("<div />").addClass("logo-projuris"));
harlan.interface.addCSSDocument("css/projuris.min.css");

$(".scroll-down .actions").hide();
$("#input-q").attr({
    placeholder: "Qual processo você esta procurando?",
    value: harlan.serverCommunication.apiKey,
    disabled: "disabled"
});

harlan.registerCall("loader::catchElement", function () {
    return [];
});

$("title").text("Projuris | Processos Jurídicos Acompanhados no Sistema");
$("link[rel='shortcut icon']").attr("href", "images/favicon-projuris.png");

harlan.serverCommunication.call("SELECT FROM 'PUSHJURISTEK'.'REPORT'", harlan.call("loader::ajax", {
    success: function (document) {

        var section = harlan.call("section")(
                "Processos Cadastrados",
                "Processos jurídicos acompanhados no sistema",
                "Créditos disponíveis e extrato");
        var jdocument = $(document);
        var result = harlan.call("generateResult");

        result.addItem("Usuário", jdocument.find("BPQL > body > username").text());

        var credits = parseInt(jdocument.find("BPQL > body > limit").text());
        var usedCredits = parseInt(jdocument.find("BPQL > body > total").text());
        var perc = (usedCredits / credits) * 100;

        console.log("Ainda restam para o usuário: " + perc.toString());

        if (perc == Infinity || isNaN(perc)) {
            perc = 0;
        }
        
        result.addItem("Créditos Contratados", numeral(credits).format('0,')).addClass("center");
        result.addItem("Créditos Utlizados", numeral(usedCredits).format('0,')).addClass("center");
        
        var radial = harlan.interface.widgets.radialProject(result.addItem(null, "").addClass("center").find(".value"), perc);
        
        if (perc > 0.8) radial.addClass("warning animated flash");
        else if (perc > 0.6) radial.addClass("attention animated flash");
        
        
        result.addItem().append($("<input />").addClass("submit").attr({
            type: "submit",
            value: "Comprar mais Créditos"
        })).click(function (e) {
            e.preventDefault();
            window.location.href = "http://www.projuris.com.br/";
        });


        var pushs = jdocument.find("BPQL > body push");
        if (pushs.length) {
            result.addSeparator("Extrato de Processos", "Processos Realizados", pushs.length === 1 ?
                    "1 processo" : pushs.length.toString() + " processos");

            pushs.each(function (idx, node) {
                var jnode = $(node);
                var resultNode = harlan.call("generateResult");
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

                result.generate().append(resultNode.generate().addClass("table"));
            });
        }


        section[1].append(result.generate());

        $(".app-content").append(section[0]);
    }
}));

