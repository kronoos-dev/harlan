module.exports = function (controller) {

    controller.registerBootstrap("juntaEmpresaMigration", function () {
        if (!/juntaempresa\.com\.br/.test(document.referrer)) {
            return;
        }

        controller.call("juntaEmpresaMigration");
    });

    controller.registerCall("juntaEmpresaMigration", function (callback) {
        callback();
        
        var modal = controller.call("modal");
        modal.title("O Junta Empresa mudou!");
        modal.subtitle("Agora se chama Harlan é muito melhor!");
        modal.addParagraph("Os registros salvos são guardados permanentemente na nuvem e se tornam acessíveis sem a necessidade de consulta, basta pesquisar no campo de pesquisa superior. Para isso você deve dar um nome e descrição para que possamos localizar o registro sempre que você desejar.");
        var form = modal.createForm();
        form.element().submit(function () {

        });

        form.addSubmit("input", "Acesso Grátis", function (e) {
            e.preventDefault();
            controller.call("authentication::force", BIPBOP_FREE);
        });

    });

};