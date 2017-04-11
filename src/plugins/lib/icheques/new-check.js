import { CMC7Validator } from "./cmc7-validator";
import { CPF, CNPJ } from  "cpf_cnpj";
import squel from "squel";
import _ from "underscore";
import StringMask from 'string-mask';
import validCheck from "./data/valid-check";

const CMC7_BANK_ACCOUNT = /^(\d{3})(\d{4})\d{11}\d{4}(\d{7})\d$/,
MATCH_NON_DIGITS = /[^\d]/g,
CMC7_MASK = new StringMask("00000000 0000000000 000000000000");

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
            .where("CMC = ?", check.cmc.replace(MATCH_NON_DIGITS, '')).toString())[0].values[0] > 0;
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

            if (checkAlreadyExists(data) || _.findIndex(storage, function (compare) {
                if (!compare || !compare.cmc) {
                    return false;
                }
                return compare.cmc === data.cmc;
            }) !== -1) {
                toastr.warning("O cheque informado já foi cadastrado.", "Efetue uma busca no sistema.");
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

            form.addSubmit("checkout", "Enviar para Monitoramento").click(function (e) {
                e.preventDefault();
                newCheckWrapper = null;
                controller.call("icheques::checkout", _.filter(storage, (i) => {
                    return i;
                }));
                modal.close();
            }).addClass("green-button");

            modal.createActions().add("Cancelar Operação").click(function (e) {
                e.preventDefault();
                modal.close();
                newCheckWrapper = null;
            });
        };

        var newCheckFormAction = null;

        controller.registerCall("icheques::chequePicture::confirm", (imageData, callback) => {
            controller.confirm({
                title: "Essa foto do seu cheque ficou legal?",
                subtitle: "Deseja realmente prosseguir com essa imagem?",
                paragraph: "Fotos de cheques de baixa qualidade, rasurados ou muito amassados serão descartadas."
            },
            () => callback(imageData),
            () => controller.call("icheques::chequePicture", callback), (modal, formdata) => {
                form.element().insertAfter($('<img />', {
                    src: `data:image/jpeg;base64,${imageData}`
                }));
            });
        });

        controller.registerCall("icheques::imagetocmc", (imageData, cmcValue, callback) => {
            /* alreadyExists */
            if (cmcValue) callback(cmcValue);
            else if (!imageData) callback();
            else controller.server.call("SELECT FROM 'ICHEQUES'.'IMAGECMC'", {
                data: imageData,
                dataType: "json",
                success: (cmcValue) => callback(cmcValue),
                error: () => callback()
            });
        });

        controller.registerCall("icheques::chequePicture", (callback) => {
            if (navigator.camera) {
                controller.confirm({
                    title: "Vamos tirar uma foto do seu cheque?",
                    subtitle: "Com a foto do cheque podemos preencher alguns dados automágicamente.",
                    paragraph: "Tire uma foto da face do cheque onde o mesmo não esteja amassado ou dobrado, cheques rasurados podem não serem reconhecidos automáticamente."
                }, () => navigator.camera.getPicture(
                        (imageData) => controller.call("icheques::chequePicture::confirm", imageData, callback),
                        () => controller.alert({
                        title: "Uoh! Não conseguimos capturar a foto do cheque.",
                        subtitle: "Talvez não tenha autorizado nosso aplicativo a utilizar a câmera de seu dispositivo",
                        paragraph: "Não tem problema, tentaremos novamente ou você pode cancelar e cadastrar manual seu cheque."
                    }, () => controller.call("icheques::checkPicture", callback)), {
                        quality: 90,
                        destinationType: Camera.DestinationType.DATA_URL,
                    }), () => callback(null));
            }
            callback(null);
        });

        controller.registerCall("icheques::newcheck", function (callback, cmcValue, cpfValue) {
            controller.call("icheques::chequePicture", (image) =>
                controller.call("icheques::imagetocmc", image, cmcValue, (cmcValue) =>
                    controller.call("icheques::newcheck::form", callback, cmcValue, cpfValue, image)));
        });


        controller.registerCall("icheques::newcheck::form", function (callback, cmcValue, cpfValue, image = null) {
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
            var inputCMC7 = form.addInput("CMC7", "text", controller.confs.isPhone ? "Impresso na parte inferior."
            : "A seqüência impressa na parte inferior do cheque em código de barra.", dataCMC7, "CMC7 <a href=\"#\">(Ajuda)</a>").val(cmcValue).mask("00000000 0000000000 000000000000");
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

                let cmc7Val = cmc7.replace(MATCH_NON_DIGITS, '');
                if (!/^\d{30}$/.test(cmc7Val) || !new CMC7Validator(cmc7Val).isValid()) {
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

                let finish = () => callback({
                    document: document,
                    ammount: inputValue.val(),
                    expire: expire,
                    cmc: cmc7Val,
                    observation: inputObservacao.val(),
                    image: image
                });

                if (!validCheck(cmc7Val)) {
                    controller.confirm({
                        icon: "socialShare",
                        title: "A instituição bancária informada não é coberta pelo iCheques.",
                        subtitle: "Mesmo assim você gostaria de adicionar o cheque em sua carteira?",
                        paragraph: "Você poderá antecipá-lo com nossos parceiros financeiros ou simplesmente administrá-lo em sua carteira."
                    }, finish);
                } else {
                    finish();
                }

                modal.close();
                newCheckFormAction = null;
                return true;
            };

            form.element().submit(newCheckFormAction);

            form.addSubmit("addcheck", "Adicionar Cheque").addClass("strong green-button");

            var actions = modal.createActions();
            actions.add("Arquivo BAN ou REM").click(function (e) {
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
                src: "/images/icheques/cheque.svg"
            }));

            form.addSubmit("understand", "Entendi!");
            form.element().submit(function (e) {
                e.preventDefault();
                modal.close();
            });
        });

    };
