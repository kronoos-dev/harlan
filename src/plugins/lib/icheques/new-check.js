/* global toastr, moment, module, require, numeral */

var CPF = require("cpf_cnpj").CPF,
        CNPJ = require("cpf_cnpj").CNPJ,
        CMC7_BANK_ACCOUNT = /^(\d{3})(\d{4})\d{11}\d{4}(\d{7})\d$/,
        MATCH_NON_DIGITS = /[^\d]/g,
        squel = require("squel"),
        _ = require("underscore"),
        StringMask = require('string-mask');

var CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

var validCheck = require("./data/valid-check");

module.exports = function (controller) {

    var newCheckWrapper = null;

    var setCMC7Document = function (cmc7, document) {
        localStorage[cmc7.replace(MATCH_NON_DIGITS, '')
                .replace(CMC7_BANK_ACCOUNT, 'check-$1-$2-$3')] = document;
    };

    var checkAlreadyExists = function (check) {
        return controller.database.exec(squel
                .select()
                .from("ICHEQUES_CHECKS")
                .field("COUNT(1)")
                .where("CMC = ?", check.cmc.replace(MATCH_NON_DIGITS, '')).toString())[0]values[0] > 0;
    };

    controller.registerCall("icheques::check::alreadyExists", checkAlreadyExists);

    var getCMC7Storage = function (cmc7) {
        cmc7 = cmc7.replace(MATCH_NON_DIGITS, '');
        if (cmc7.length !== 30) {
            return null;
        }
        return localStorage[cmc7.replace(CMC7_BANK_ACCOUNT, 'check-$1-$2-$3')];
    };

    var newCheck = function (data, checkList, storage, modal) {
        data.cmc = data.cmc.replace(MATCH_NON_DIGITS, '');

        if (!validCheck(data.cmc)) {
            toastr.warning("A instituição bancária emissora do cheque não é aceita pelo sistema.", "A instituição bancária não é aceita pelo iCheques.");
            return;
        }

        if (checkAlreadyExists(data) || _.findIndex(storage, function (compare) {
            return compare.cmc === data.cmc;
        }) !== -1) {
            toastr.warning("O cheque informado já foi cadastrado.", "Efeture uma busca no sistema.");
            return;
        }

        var item = checkList.item("fa-times-circle-o", [
            CMC7_MASK.apply(data.cmc),
            data.expire.isValid() ? data.expire.format("DD/MM/YYYY") : "",
            data.observation || data.document,
            data.ammount ? "R$ " + data.ammount : "Valor não informado"
        ]);


        data.ammount = Math.floor(numeral(data.ammount)._value * 100);

        data[CPF.isValid(data.document) ? "cpf" : "cnpj"] = data.document;
        delete data.document;
        data.expire = (data.expire.isValid() ? data.expire : moment().add(5, 'months')).format("YYYYMMDD");

        storage.push(data);

        item.click(function () {
            delete storage[storage.indexOf(data)];
            item.remove();
            if (storage.length <= 0)
                modal.close();
        });
    };

    var generateCustomer = function (data) {
        var storage = [], modal = controller.call("modal");
        modal.title("Adicionar Cheques");
        modal.subtitle("Acompanhamento de Cheques");
        modal.addParagraph("Fique no controle, acompanhe todos os cheques abaixo e seja avisado caso algum deles possua ocorrências por sustação, furto ou outras fraudes.");

        var form = modal.createForm();
        var checkList = form.createList();

        newCheck(data, checkList, storage);

        newCheckWrapper = function (data) {
            newCheck(data, checkList, storage);
        };

        form.addSubmit("newcheck", "Novo Cheque").click(function (e) {
            e.preventDefault();
            controller.call("icheques::newcheck");
        });
        form.addSubmit("checkout", "Acompanhar").click(function (e) {
            e.preventDefault();
            newCheckWrapper = null;
            controller.call("icheques::checkout", storage);
            modal.close();
        });

        modal.createActions().add("Cancelar Operação").click(function (e) {
            e.preventDefault();
            modal.close();
            newCheckWrapper = null;
        });
    };

    var newCheckFormAction = null;

    controller.registerCall("icheques::newcheck", function (callback, cmcValue, cpfValue) {
        if (newCheckFormAction && !newCheckFormAction()) {
            return;
        }

        callback = callback || newCheckWrapper || generateCustomer;
        cpfValue = cpfValue || (cmcValue ? getCMC7Storage(cmcValue) : null);

        var modal = controller.call("modal");
        modal.title("Adicionar Cheque");
        modal.subtitle("Preencha as informações abaixo do cheque.");
        modal.addParagraph("Preencha e confirme as informações, você será notificado no e-mail assim que validarmos o cheque. Se tiver um scanner de cheques você pode usá-lo agora.");

        var form = modal.createForm();
        var dataCMC7 = {};
        var dataCPF = {};
        var inputCMC7 = form.addInput("CMC7", "text", "A seqüência impressa na parte inferior do cheque em código de barra.", dataCMC7, "CMC7 <a href=\"#\">(Ajuda)</a>").val(cmcValue).mask("00000000 0000000000 000000000000");
        var options = {
            onKeyPress: function (input, e, field, options) {
                var masks = ['000.000.000-009', '00.000.000/0000-00'],
                        mask = (input.length > 14) ? masks[1] : masks[0];
                inputDocument.mask(mask, options);
            }
        };
        var inputDocument = form.addInput("CPF/CNPJ", "text", "CPF/CNPJ impresso no cheque.", dataCPF, "CPF/CNPJ <a href=\"#\">(Ajuda)</a>").mask("000.000.000-00", options).val(cpfValue || "");

        dataCMC7.label.addClass("help cmc7");
        dataCPF.label.addClass("help cmc7");

        var obj = {
            append: form.multiField(),
            labelPosition: "before"
        };

        var inputValue = form.addInput("Valor", "text", "Valor", obj, "R$").mask('000.000.000.000.000,00', {reverse: true}).addClass("money");
        obj.label.addClass("money");

        var inputExpire = form.addInput("Vencimento", "text", "Vencimento", obj, "Vencimento").mask("00/00/0000");
        inputExpire.pikaday();
        var inputObservacao = form.addInput("Observação", "text", "Observação", {}, "Observação");

        inputCMC7.change(function () {
            var document = getCMC7Storage(inputCMC7.val());
            if (!document) {
                return;
            }
            inputDocument.val(document);
        });

        newCheckFormAction = function (e) {
            if (e) {
                e.preventDefault();
            }
            var errors = [],
                    document = inputDocument.val(),
                    cmc7 = inputCMC7.val(),
                    expire = moment(inputExpire.val(), ["DD/MM/YYYY", "DD/MM/YY"]);

            if (inputExpire.val() && !expire.isValid()) {
                errors.push("A data do cheque não parece conferir.");
                inputExpire.addClass("error");
            } else {
                inputExpire.removeClass("error");
            }

            if (!/^\d{30}$/.test(cmc7.replace(MATCH_NON_DIGITS, ''))) {
                errors.push("O CMC7 do cheque não confere.");
                inputCMC7.addClass("error");
            } else {
                inputCMC7.removeClass("error");
            }

            if (!CPF.isValid(document) && !CNPJ.isValid(document)) {
                errors.push("CPF/CNPJ do cheque não confere.");
                inputDocument.addClass("error");
            } else {
                inputDocument.removeClass("error");
            }

            if (errors.length) {
                for (var i in errors) {
                    toastr.warning("Verifique o campo e tente novamente!", errors[i]);
                }
                return false;
            }

            setCMC7Document(cmc7, document);

            callback({
                document: document,
                ammount: inputValue.val(),
                expire: expire,
                cmc: cmc7,
                observation: inputObservacao.val()
            });

            modal.close();
            newCheckFormAction = null;
            return true;
        };

        form.element().submit(newCheckFormAction);

        form.addSubmit("addcheck", "Adicionar Cheque").addClass("strong");

        var actions = modal.createActions();
        actions.add("Arquivo BAN").click(function (e) {
            e.preventDefault();
            newCheckFormAction = null;
            modal.close();
            controller.call("icheques::fidc");
        });

        actions.add("Fechar").click(function (e) {
            e.preventDefault();
            newCheckFormAction = null;
            modal.close();
        });
    });

    controller.registerTrigger("icheques::newcheck", "icheques::newcheck", function (cmc, callback) {
        callback();
        controller.call("icheques::newcheck", null, cmc);
    });

    controller.registerCall("icheques::help::cmc", function () {
        var modal = controller.call("modal"),
                form = modal.createForm();

        form.element().append($("<img />").attr({
            src: "images/icheques/cheque.svg"
        }));

        form.addSubmit("understand", "Entendi!");
        form.element().submit(function (e) {
            e.preventDefault();
            modal.close();
        });
    });

    require("./ban-file")(controller);
};
