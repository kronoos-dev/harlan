module.exports = function (controller) {

    controller.registerBootstrap("comment", function () {
        $("#action-comments").click(function (e) {
            e.preventDefault();
            controller.call("comment");
        });
    });

    var removeComment = function (id, comment, item) {
        return function (e) {
            controller.serverCommunication.call("DELETE FROM 'HARLANCOMMENTS'.'DOCUMENT'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            id: id,
                            comment: comment
                        },
                        success: function () {
                            item.remove();
                        }
                    })));

        };
    };

    controller.registerCall("comment::load", function (args) {
        var ret = args[0],
                id = args[1];

        var modal = controller.call("modal");
        modal.title("Comentários do Registro");
        modal.subtitle("Comentários anexados ao resultado salvo.");
        modal.addParagraph("Registre aqui comentários relevantes para o registro.");
        var form = modal.createForm();
        var list = form.createList();
        $(ret).find("BPQL > body > comments > node").each(function (idx, node) {
            var jnode = $(node);
            var item = list.item("fa-times", [
                new Date(parseInt(jnode.find("date").text()) * 1000).toLocaleString(),
                jnode.find("company").text(),
                jnode.find("text").text()]);
            item.click(removeComment(id, jnode.find("comment").text(), item));
        });

        var inputComment = form.addInput("comment", "text", "Comentário");
        form.element().submit(function (e) {
            controller.serverCommunication.call("INSERT INTO 'HARLANCOMMENTS'.'DOCUMENT'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            id: id,
                            comment: inputComment.val()
                        },
                        success: function () {
                            toastr.success("Seu comentário foi registrado com sucesso");
                        }
                    })));
            e.preventDefault();
            modal.close();
        });

        form.addSubmit("comment", "Comentar");
        form.addSubmit("exit", "Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("comment", function () {
        var results = controller.call("selectedResults");
        if (!results.length) {
            return;
        }

        if (results.length > 1) {
            toastr.warning("Para acessar os comentários selecione um único resultado.");
            return;
        }

        var resultId = results.data("save-id");

        if (!resultId) {
            toastr.warning("É necessário que o resultado esteja salvo.");
            return;
        }

        controller.serverCommunication.call("SELECT FROM 'HARLANCOMMENTS'.'DOCUMENT'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    data: {
                        id: resultId
                    },
                    success: function (ret) {
                        controller.call("comment::load", [ret, resultId]);
                    }
                })));

    });
};