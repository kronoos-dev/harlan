module.exports = function (controller) {

    var bulletRocket = function (value) {
        return value ? "fa-rocket" : "fa-circle-o";
    };

    controller.registerCall("push", function () {
        var results = controller.call("selectedResults");
        if (!results.length) {
            return;
        }

        if (results.length > 1) {
            controller.call("push::modal", [null, results]);
        }

        controller.serverCommunication.call("SELECT FROM 'HARLAN'.'DocumentDetails'",
                controller.call("error::ajax", controller.call("loader::ajax", {
                    data: {
                        id: results.data("save-id")
                    },
                    success: function (ret) {
                        var freq = 0;
                        if ($(ret).find("pushFrequency").length)
                            freq = parseInt($(ret).find("pushFrequency").text());
                        controller.call("push::modal", [freq, results]);
                    }
                })));

    });

    controller.registerCall("push::modal", function (args) {

        var interval = args[0], results = args[1];

        var modal = controller.call("modal");
        modal.title("Atualização Cadastral");
        modal.subtitle("Com que frequência você deseja atualizar o registro?");
        modal.addParagraph("Matenha seu registro sempre atualizado, seja avisado quando alguma coisa mudar.");

        var form = modal.createForm();
        var list = form.createList();

        var changeFrequency = function (v) {
            return function (e) {
                e.preventDefault();
                interval = v;
                $(this).parent().find("i").removeClass("fa-rocket").addClass("fa-circle-o");
                $(this).find("i").removeClass("fa-circle-o").addClass("fa-rocket");
            };
        };

        list.item(bulletRocket(interval === 0), "Diáriamente").click(changeFrequency(0));
        list.item(bulletRocket(interval === 1), "Semanalmente").click(changeFrequency(1));
        list.item(bulletRocket(interval === 2), "Quinzenalmente").click(changeFrequency(2));
        list.item(bulletRocket(interval === 3), "Mensalmente").click(changeFrequency(3));
        list.item(bulletRocket(interval === 4), "Anualmente").click(changeFrequency(4));

        form.element().submit(function (e) {
            e.preventDefault();
            controller.call("push::ajax", [results, interval]);
            modal.close();
        });
        form.addSubmit("save", "Salvar");
        form.addSubmit("cancel", "Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    controller.registerCall("push::ajax", function (args) {
        var results = args[0], interval = args[1];

        if (interval === null) {
            toastr.warning("Você deve selecionar um intervalo de atualização.", "Selecione uma frequencia de atualizações!");
            return;
        }

        var items = 0;
        var successCallback = function () {
            if (--items === 0) {
                toastr.success("Todos os resultados foram salvos com sucesso!");
            }
        };

        results.each(function (idx, node) {
            items++;
            controller.call("push::ajaxItem", [interval, node, successCallback]);
        });

    });

    controller.registerCall("push::ajaxItem", function (args) {
        var interval = args[0], node = args[1], successCallback = args[2];
        var jNode = $(node);
        var id = jNode.data("save-id");
        if (!id) {
            toastr.warning("Um resultado não salvo não pode ter sua frequencia de atualizações alterada.");
            return;
        }

        controller.serverCommunication.call("UPDATE 'HARLAN'.'PushFrequency'", controller.call("error::ajax", controller.call("loader::ajax", {
            data: {
                interval: interval,
                id: id
            },
            success: function () {
                successCallback();
            }
        })));
    });

    controller.registerBootstrap("push", function () {
        $("#action-refresh").click(function (e) {
            e.preventDefault();
            controller.call("push");
        });
    });

};