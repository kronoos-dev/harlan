module.exports = function (controller) {

    controller.registerBootstrap("endpoint", function () {
        $("#action-show-endpoint").click(function (e) {
            e.preventDefault();
            controller.call("endpoint");
        });
    });

    controller.registerCall("endpoint", function () {
        var results = controller.call("selectedResults");
        if (!results.length) {
            return;
        }

        var modal = controller.call("modal");
        
        modal.title("Copie a URL de Endpoint");
        modal.subtitle("Conecte sua aplicação a API BIPBOP.");
        modal.addParagraph("Com a URL exibida abaixo você pode requisitar diretamente a BIPBOP para que esta entregue os mesmos dados que estão sendo dispostos na interface. Com uma integração você pode automatizar processos dentro de sua empresa, gerando agilidade e confiança com as informações sempre atualizadas.");

        var formInputs = modal.createForm();
        results.find(".xml2html").each(function (idx, node) {
            var jNode = $(node);
            jNode.data("document").find("header query").each(function (queryIdx, queryNode) {

                var fields = []; 
                $(jNode.data("form")).each(function (idxForm, form) {
                    fields.push("'" + form.name.toUpperCase() + "' = '" + form.value + "'");
                });

                var query = $(queryNode).text();
                if (fields.length) {
                    query += " WHERE " + fields.join(" AND ");
                }

                formInputs.addInput(idx.toString() + "_" + queryIdx.toString() + "_input", "text", "SELECT").attr({
                    disabled: "disabled"
                }).val(query);
            });
        });


        var exitForm = modal.createForm();
        exitForm.addSubmit("exit", "Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });
};