module.exports = function (controller) {

    controller.registerBootstrap("history", function () {
        $("#action-history").click(function (e) {
            e.preventDefault();
            controller.call("history");
        });
    });

    controller.registerCall("history", function () {
        var results = controller.call("selectedResults");
        if (!results.length) {
            return;
        }

        var modal = controller.call("modal");
        modal.title("Busca de Comprovante");
        modal.subtitle("Busque por um comprovante.");
        modal.addParagraph("Pesquise de maneira prática e ágil por um comprovante de consulta.");

        var form = modal.createForm();
        var autocomplete = controller.call("autocomplete", form.addInput("filter", "text", "Ex.: Há um mês, 2/5/2009, ontem."));
        autocomplete.setIcon("fa-search");

        var list = form.createList();
        
        
        
        form.addSubmit("exit", "Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });
};