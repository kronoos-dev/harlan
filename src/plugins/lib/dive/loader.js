/* global module, moment, require, toastr */
var TEST_EXTENSION = /\.csv$/;

module.exports = function (controller, config) {

    var getFile = function (inputFile) {
        var files = inputFile.get(0).files;
        if (!files.length) {
            throw "Selecione um arquivo!";
        }

        var file = files.item(0);
        if (!TEST_EXTENSION.test(file.name)) {
            throw "A extensão do arquivo deve ser CSV (comma-separated values)";
        }
        return file;
    };

    controller.registerCall("dive::load", function (inputFile) {
        var file = getFile(inputFile),
                modal = controller.call("modal");

        modal.title("Carregando Arquivo");
        modal.subtitle("Os resultados estão sendo processados");
        modal.addParagraph("Os registros estão sendo carregados na API BIPBOP, esta operação pode levar alguns minutos. Para arquivos muito grandes pode levar até algumas horas, deixe esta página aberta até o fim do carregamento.");

        var progress = modal.addProgress();

        /* can't call it directly, CORS and WebWorkers */
        $.get(`${config.url}/worker.js`, function (data) {
            var worker = new Worker(window.URL.createObjectURL(new Blob([data], {type: "text/javascript"})));
            worker.onmessage = function (message) {
                if (!message.data) {
                    worker.terminate();
                    modal.close();
                    return;
                }

                if (message.data.method === "error") {
                    toastr.warning("Um dos seus registros não pode ser processado, verifique o CPF e data de nascimento antes de carregar novamente.",
                            sprintf("O documento %s não pode ser carregado.", message.data.data.record[0]));
                } else if (message.data.method === "progress") {
                    progress(message.data.data);
                }
            };
            worker.postMessage({
                file: file,
                apiKey: controller.serverCommunication.apiKey()
            });
        });
    });

    controller.registerCall("dive::new", function () {
        var modal = controller.call("modal");
        modal.gamification("harlan");
        modal.title("Importador de Carteira");
        modal.subtitle("Vamos importar sua carteira de cobrança.");
        modal.addParagraph("Dive é o poderoso módulo Harlan desenvolvido para empresas de cobrança utilizando a fantástica API BIPBOP. Essas duas ferramentas tornam possível a obtenção e compreensão de dados precisos e úteis para empresas de recuperação de ativos problemáticos e em situação especial. Tenha uma visão 360º e em tempo real da situação de todos os seus credores. Os compreenda e recupere melhor seus ativos.");
        var form = modal.createForm(),
                inputFile = form.addInput("file", "file", "Carteira de Cobrança").magicLabel(),
                acceptTerms = form.addCheckbox("terms", "Eu concordo com os <a href='#'>termos de uso</a> e <a href='#'>confidencialidade</a>.");

        form.addSubmit("submit", "Mergulhar").click(function (e) {
            e.preventDefault();
            if (!acceptTerms[1].is(':checked')) {
                toastr.warning("Você precisa aceitar os termos de uso e confidencialidade para poder continuar.",
                "Você não aceitou os termos para continuar.");
                return;
            }

            try {
                controller.call("dive::load", inputFile);
                modal.close();
            } catch (exception) {
                toastr.warning(exception);
            }
        });

        var actions = modal.createActions();
        actions.add("Sair").click(function (e) {
            e.preventDefault();
            modal.close();
        });
    });


};
