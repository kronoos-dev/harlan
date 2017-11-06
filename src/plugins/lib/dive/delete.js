module.exports = controller => {

    controller.registerCall("dive::delete", (entity, callback) => {
        controller.confirm({}, () => {
            controller.server.call("DELETE FROM 'DIVE'.'ENTITY'",
            controller.call("error::ajax", controller.call("loader::ajax", {
                dataType: "json",
                data: {label: entity.label},
                success: () => {
                    $(`*[data-entity='${entity._id}']`).remove();
                    if (callback) callback();
                    else toastr.success("Cobrança removida da base de dados com sucesso.",
                        "A cobrança selecionada não consta mais em sua base de dados.");
                }
            })));
        });
    });

};
