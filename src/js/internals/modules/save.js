module.exports = function (controller) {

    controller.registerCall("save::follow", function (args) {
        var searchForm = args[0],
                searchTableNode = args[1],
                searchDatabaseNode = args[2],
                searchSection = args[3];

        var modal = controller.call("modal");
        modal.title("Acompanhar Registro");
        modal.subtitle("Acompanhar a Pesquisa");

        modal.addParagraph("Os registros salvos são guardados permanentemente na nuvem e se tornam acessíveis sem a necessidade de consulta, basta pesquisar no campo de pesquisa superior. Para isso você deve dar um nome e descrição para que possamos localizar o registro sempre que você desejar.");

        var form = modal.createForm();
        var name = form.addInput("name", "text", "Digite um nome.");
        var description = form.addInput("description", "text", "Digite uma descrição.");
        var autocomplete = controller.call("findDocument::autocomplete", [name, description]);
        autocomplete.setIcon("fa-search");
        form.addSubmit("save", "Salvar");
        form.addSubmit("cancel", "Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

        var database = searchDatabaseNode.attr("name");
        var table = searchTableNode.attr("name");

        form.element().submit(function (e) {
            e.preventDefault();

            controller.serverCommunication.call("INSERT INTO 'HARLAN'.'DOCUMENT'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        method: "POST",
                        dataType: "xml",
                        data: {
                            name: name.val(),
                            description: description.val(),
                            queue: "SELECT FROM '" + database + "'.'" + table + "'",
                            parameters: searchForm.serialize()
                        },
                        success: function (ret) {
                            toastr.success("O formulário será acompanhado a partir de agora", "Registro acompanhado com sucesso");
                        }
                    })));


            modal.close();
        });

    });

    controller.registerCall("save", function () {
        var results = controller.call("selectedResults");
        if (!results.length) {
            return;
        }

        var modal = controller.call("modal");
        if (results.length > 1) {
            modal.title("Salvar Registros");
            modal.subtitle("Armanezene os Resultados");
        } else {
            modal.title("Salvar Registro");
            modal.subtitle("Armanezene o Resultado");
        }

        modal.addParagraph("Os registros salvos são guardados permanentemente na nuvem e se tornam acessíveis sem a necessidade de consulta, basta pesquisar no campo de pesquisa superior. Para isso você deve dar um nome e descrição para que possamos localizar o registro sempre que você desejar.");

        var form = modal.createForm();
        var name = form.addInput("name", "text", "Digite um nome.");
        var description = form.addInput("description", "text", "Digite uma descrição.");
        var autocomplete = controller.call("findDocument::autocomplete", [name, description]);
        autocomplete.setIcon("fa-search");
        form.addSubmit("save", "Salvar");
        form.addSubmit("cancel", "Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

        form.element().submit(function (e) {
            e.preventDefault();
            controller.call("save::result", [
                name.val(),
                description.val(),
                results
            ]);
            modal.close();
        });
    });

    controller.registerCall("save::results", function (args) {
        var name = args[0],
                description = args[1],
                results = args[2];

        results.each(function (idx, result) {
            controller.call("save::result", [name, description, result]);
        });
    });

    controller.registerCall("save::result", function (args) {
        var name = args[0],
                description = args[1],
                result = args[2];

        var resultCounter = 0;
        var callbackSuccess = function ( ) {
            if (--resultCounter === 0) {
                toastr.success("Todos os registros foram salvos com sucesso.", "Resultados salvos");
            }
        };
        var jResult = $(result);
        jResult.find(".xml2html").each(function (idx, html) {
            var jNode = $(html);
            var query = jNode.data("document").find("header query").first();
            if (!query.length) {
                return;
            }

            var form = jNode.data("form");
            if (!form) {
                return;
            }

            resultCounter++;
            var xmlData = jNode.data("document").get(0);

            controller.serverCommunication.call("INSERT INTO 'HARLAN'.'DOCUMENT'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        method: "POST",
                        dataType: "xml",
                        data: {
                            name: name,
                            description: description,
                            query: query.text(),
                            parameters: $.param(form),
                            pushDocument: (window.ActiveXObject ?
                                    xmlData.xml :
                                    (new XMLSerializer()).serializeToString(xmlData)),
                            pushDocumentCharset: "UTF-8",
                            pushDocumentContentType: "application/xml"
                        },
                        success: function (ret) {
                            callbackSuccess();
                            jResult.data("save-id", $(ret).find("BPQL > body > id").text());
                            jResult.find(".content").first().append($("<i />").addClass("saved"));
                        }
                    })));
        });
    });

    controller.registerBootstrap("save", function () {
        $("#action-save").click(function (e) {
            e.preventDefault();
            controller.call("save");
        });
    });

};