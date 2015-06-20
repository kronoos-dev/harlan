var FIND_MODULE = "BPQL > body > module > node";

module.exports = function (controller) {

    var installedModules = null;

    var addScript = function (val) {
        $("body").append($("<script />").attr({
            src: val
        }));
    };

    controller.registerTrigger("authentication::authenticated", function (args, callback) {
        controller.serverCommunication.call("SELECT FROM 'HARLANMODULES'.'JS'", {
            success: function (ret) {
                installedModules = ret;
                $(ret).find(FIND_MODULE).each(function (idx, node) {
                    addScript($(node).text());
                });
            },
            complete: function () {
                callback();
            }
        });
    });

    controller.registerBootstrap("module", function () {
        $("#action-show-modules").click(function (e) {
            e.preventDefault();
            controller.call("module");
        });
    });

    var removeModule = function (e) {
        e.preventDefault();

        var jelement = $(this);

        var modal = controller.call("modal");
        modal.title("Administrador de Módulos");
        modal.subtitle("Deseja realmente remover esse módulo?");
        modal.addParagraph("Após remover será necessário você reiniciar a aplicação para que suas alterações tenham efeito.");
        var form = modal.createForm();
        form.element().submit(function (e) {
            e.preventDefault();
            controller.serverCommunication.call("DELETE FROM 'HARLANMODULES'.'JS'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            module: jelement.data("module")
                        },
                        success: function (ret) {
                            installedModules = ret;
                            jelement.remove();
                            toastr.success("Módulo removido com sucesso.", "Reinicie o sistema.");
                        }
                    })));
            modal.close();
        });

        form.addSubmit("continue", "Remover Módulo");
        form.addSubmit("cancel", "Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

    };

    controller.registerCall("module", function () {
        var modal = controller.call("modal");
        modal.title("Administrador de Módulos");
        modal.subtitle("Enriqueça seu sistema com módulos.");
        modal.addParagraph("O sistema de módulos do Harlan foi desenvolvido para que nós e terceiros possam adicionar novas funcionalidades ao sistema. Para agregar um módulo a sua interface é necessário que digite abaixo o ENDPOINT do JavaScript a ser requisitado.");

        var form = modal.createForm();

        if (installedModules) {
            var list = form.createList();
            $(installedModules).find(FIND_MODULE).each(function (idx, node) {
                var module = $(node).text();
                list.item("fa-times", module).data("module", module).click(removeModule);
            });
            list.element().addClass("remove-modules");
        }

        var module = form.addInput("module", "text", "Endereço do módulo.");
        form.addSubmit("continue", "Adicionar Módulo");
        form.addSubmit("cancel", "Cancelar").click(function (e) {
            e.preventDefault();
            modal.close();
        });

        form.element().submit(function (e) {
            e.preventDefault();
            controller.serverCommunication.call("INSERT INTO 'HARLANMODULES'.'JS'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            module: module.val()
                        },
                        success: function (ret) {
                            installedModules = ret;
                            toastr.success("Módulo adicionado com sucesso.");
                            addScript(module.val());
                        }
                    })));
            modal.close();
        });
    });
};