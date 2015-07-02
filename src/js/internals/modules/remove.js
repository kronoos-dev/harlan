module.exports = function (controller) {

    controller.registerBootstrap("remove", function (callback) {
        callback();
        $("#action-remove").click(function (e) {
            e.preventDefault();
            controller.call("remove");
        });
    });

    controller.registerCall("remove", function () {
        var results = controller.call("selectedResults");
        if (!results.length) {
            return;
        }

        var modal = controller.call("modal");
        modal.title("Remover Registros");
        modal.subtitle("Apague os Resultados.");
        modal.addParagraph("Os recibos referentes a consulta continuarão disponíveis por cinco anos após a remoção no extrato da BIPBOP, remove o registro caso deseje para uma operação de acompanhamento ou caso não haja mais relevância para a informação.");
        var form = modal.createForm();
        form.element().submit(function (e) {
            e.preventDefault();
            controller.call("remove::results", results);
            modal.close();
        });
        form.addSubmit("continue", "Continuar");
        form.addSubmit("cancel", "Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("remove::results", function (results) {
        var resultCounter = 0;
        var callbackSuccess = function ( ) {
            if (--resultCounter === 0) {
                toastr.success("Todos os registros foram removidos com sucesso.", "Resultados removidos.");
            }
        };
        results.each(function (idx, document) {
            var jdocument = $(document);


            var dataId = jdocument.data("save-id");
            if (!dataId) {
                jdocument.removeData("save-id");
                return;
            }

            resultCounter++;

            controller.serverCommunication.call("DELETE FROM 'HARLAN'.'DOCUMENT'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {id: dataId},
                        success: function () {
                            var removeElement = jdocument.data("on-remove");
                            if (removeElement)
                                removeElement.remove();

                            var saved = jdocument.find(".saved");
                            if (saved.length) {
                                saved.remove();
                            } else {
                                var parent = jdocument.closest(".group-type");
                                jdocument.remove();
                                if (!parent.find(".result").length) {
                                    parent.remove();
                                }
                            }
                            jdocument.removeData("save-id");
                            callbackSuccess();
                        }
                    })));
        });
    });
};