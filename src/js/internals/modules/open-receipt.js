module.exports = function (controller) {

    controller.registerCall("openReceipt", function () {
        var results = controller.call("selectedResults");

        results.find(".xml2html").each(function (idx, elem) {
            var jElement = $(elem);
            var receiptUrl = jElement.data("document").find("receipt-url");
            
            if (!receiptUrl.length) {
                toastr.warning("Não há recibo para o resultado selecionado.");
                return;
            }
            
            receiptUrl.each(function (idx, url) {
                window.open($(url).text());
            });
        });

    });

    controller.registerBootstrap("openReceipt", function (callback) {
        callback();
        $("#action-open-receipt").click(function (e) {
            e.preventDefault();
            controller.call("openReceipt");
        });
    });

};