/* global toastr */

var TRY_AGAIN_IN = 3000,
        SEARCH_REGEX = /cheq?u?e?/i,
        FIDC = /fid?c?/i,
        TEST_BAN_EXTENSION = /\.ban$/,
        CMC7_TEST = /^\d{8}<\d{10}>\d{12}$/,
        CPF = require("cpf_cnpj").CPF,
        validCNPJ = require("cpf_cnpj").CNPJ,
        byline = require("byline"),
        fileReaderStream = require("filereader-stream"),
        concat = require("concat-stream"),
        async = require("async"),
        StringMask = require("string-mask"),
        filesize = require("filesize");

var cpfMask = new StringMask("000.000.000-00");
var cnpjMask = new StringMask("00.000.000/0000-00");

(function (controller) {

    var documentGenerator = function (documentCalls, appendElement, document, task, afterExecution) {
        /* @TODO Avaliar se esse código tem um race-condition */
        /* @TODO Arrumar eventual race-condition */
        if (!documentCalls[document]) {
            documentCalls[document] = [];

            var section = controller.call("section",
                    "iCheque",
                    "Prevenção a fraudes na sua carteira de cheques.",
                    "Documento " + (CPF.isValid(document) ? cpfMask : cnpjMask).apply(document)),
                    result = controller.call("generateResult");

            section[1].append(result.generate());
            section[0].addClass("icheque loading");
            appendElement.append(section[0]);

            var after = function () {
                section[0].removeClass("loading");
                var calls = documentCalls[document];
                documentCalls[document] = async.queue(function (object, callback) {
                    object.after(section, result, callback);
                }, 2);
                documentCalls[document].push(calls);
            };

            controller.serverCommunication.call("SELECT FROM 'CBUSCA'.'CONSULTA'", {
                data: {
                    documento: task.document
                },
                success: function (ret) {
                    result.generate().append(controller.call("xmlDocument", ret));
                    after();
                },
                error: function () {
                    result.addItem(CPF.isValid(task.document) ? "CPF" : "CNPJ", (CPF.isValid(document) ? cpfMask : cnpjMask).apply(document));
                    after();
                }
            });
        }

        documentCalls[document].push({task: task, after: afterExecution});
    };

    var serverCommunication = function (task, callback) {
        controller.serverCommunication.call("INSERT INTO 'PUSH'.'SYNC'",
                controller.call("error::ajax", {
                    data: {
                        "pushQuery": "SELECT FROM 'CHEQUELEGAL'.'CONSULTA'",
                        "cmc": task.cmc7,
                        "documento": task.document
                    },
                    success: function (ret) {
                        task.data = ret;
                        callback();
                    },
                    error: function () {
                        if (++task.trys >= 5) {
                            task.error = Array.from(arguments);
                            callback();
                            return;
                        }

                        /* try again in n time */
                        setTimeout(function () {
                            serverCommunication(task, callback);
                        }, TRY_AGAIN_IN);
                    }
                }));
    };

    var queueGenerator = function (documentGenerators, appendElement) {
        return async.queue(function (task, callback) {
            task.trys = 0;
            documentGenerator(documentGenerators, appendElement, task.document, task, function (section, result, documentCallback) {
                var separator = result.addSeparator("Verificação de Cheque",
                        "Verificação de Dados do Cheque",
                        "Cheque CMC7 " + task.cmc7.replace(/[^\d]/g, '#'));

                separator.addClass("external-source loading");

                serverCommunication(task, function () {
                    task.response(!task.error);
                    separator.data("icheque", task); /* embed task at separator @ front-end driven */
                    separator.removeClass("loading").addClass(task.error ? "error" : "success");
                    documentCallback();
                    callback();
                });
            });
        }, 5);
    };

    controller.interface.addCSSDocument("css/icheque.min.css");

    controller.registerTrigger();
    controller.registerCall();

    controller.registerTrigger("findDatabase::instantSearch", "icheque::instantSearch", function (args, callback) {
        callback();
        if (SEARCH_REGEX.test(args[0])) {
            args[1].item("iCheque", "Prevenção a fraudes na sua carteira de cheques.", "Consulta manual de cheques.").addClass("icheque");
        }
        if (SEARCH_REGEX.test(args[0]) || FIDC.test(args[0])) {
            args[1].item("iCheque", "Prevenção a fraudes na sua carteira de cheques.", "Arquivo de operação para FIDC.")
                    .addClass("icheque")
                    .click(function (e) {
                        e.preventDefault();
                        controller.call("icheque::fidc");
                    });
        }
    });

    var getFile = function (inputFile) {
        var files = inputFile.get(0).files;
        if (!files.length) {
            throw "Selecione um arquivo!";
        }

        var treatment = files.item(0);
        if (!TEST_BAN_EXTENSION.test(treatment.name)) {
            throw "A extensão recebida do arquivo não confere!";
        }
        return treatment;
    };

    var reponseManager = function (length, elements) {
        var processed = 0, confirmed = 0;
        console.log("Created!");

        elements.cheques.find(".value").text(length);
        var updateElements = function () {
            elements.proccessedCheque.find(".value").text(processed.toString());
            elements.radial.proccessedCheque.change(processed / length * 100);
            elements.radial.confirmedCheque.change(confirmed / length * 100);
        };

        return function (isConfirmed) {
            processed++;
            confirmed += isConfirmed ? 1 : 0;
            updateElements();
        };
    };

    controller.registerCall("icheque::fidc::enter", function (inputFile, modal) {

        try {
            var file = getFile(inputFile);
            var section = controller.call("section",
                    "iCheque",
                    "Tratamento de Arquivo");

            $(".app-content").append(section[0].addClass("icheque-ban"));

            var resultManager = controller.call("generateResult");
            resultManager.addItem("Arquivo", file.name);
            resultManager.addItem("Tamanho", filesize(file.size));

            section[1].append(resultManager.generate());
            var documentGenerators = [];
            var queue = queueGenerator(documentGenerators, section[1]);

            fileReaderStream(file).pipe(concat(function (buffer) {
                /* @TODO TROCAR POR STREAM URGENTE! ARQUIVOS GRANDES 
                 * PODEM CONSUMIR TODA A RAM DA MAQUINA :(
                 * 
                 * @PRIZE UM HAPPY-HOUR COM HEINEKEN GARRAFAO
                 */
                var results = buffer.toString().split("\r\n");

                var elements = {radial: {}};

                elements.cheques = resultManager.addItem("Cheques", 0);
                elements.proccessedCheque = resultManager.addItem("Cheques Processados", 0);
                resultManager.block();
                elements.radial.proccessedCheque = resultManager.generateRadial("Cheques Processados", 0);
                elements.radial.confirmedCheque = resultManager.generateRadial("Cheques Positivos", 0);
                var responser = reponseManager((results.length - 3) / 2, elements);

                for (var key = 1; key < results.length - 2; key++) {
                    if (key % 2 !== 0) {
                        continue;
                    }

                    var task = {
                        document: results[key - 1].substring(17, 17 + 14).trim(),
                        cmc7: results[key].substring(34, 34 + 32).trim(),
                        response: responser
                    };

                    queue.push(task);
                }

            }));

            modal.close();
        } catch (e) {
            toastr.warning(e);
            inputFile.addClass("error");
            return;
        }
    });

    controller.registerCall("icheque::fidc", function () {

        var modal = controller.call("modal");

        modal.title("iCheque");
        modal.subtitle("Safekeeping para Carteiras de Cheque");
        modal.addParagraph("Para realizar a verificação de cheques em tempo real será necessário que você selecione o arquivo abaixo.");

        var form = modal.createForm();
        var inputFile = form.addInput("fidc-file", "file", "Selecionar arquivo.", {}, "Arquivo de Fundo FIDC");

        form.addSubmit("submit", "Enviar").click(function (e) {
            e.preventDefault();
            controller.call("icheque::fidc::enter", inputFile, modal);
        });

        form.cancelButton(null, function () {
            modal.close();
        });

    });

    /*
     *  Nada como um nado estilo livre nesse mar 
     *  nado de peito que é desse jeito que eu curto nadar 
     *  nadar da pedra pra praia, da praia pra pedra, 
     *  do canto pro meio, do meio pro canto, do raso pro fundo 
     *  do fundo do peito, de dentro da onda 
     *  pra fora da linha da arrebentação da ressaca do mundo 
     *  alguns segundos só na apnéia 
     *  sem respiração, só pra abrir o pulmão e as idéias 
     *  só pra sentir saudade do oxigênio 
     *  e respirar de novo e me lembrar de que isso é um prêmio 
     
     *  Link: http://www.vagalume.com.br/gabriel-pensador/tempestade.html#ixzz3stkENplW
     */

})(harlan);