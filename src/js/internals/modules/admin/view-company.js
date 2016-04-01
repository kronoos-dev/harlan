var changeCase = require("change-case");
var uniqid = require("uniqid");

module.exports = (controller) => {

    controller.registerCall("admin::viewCompany", function(companyNode, append) {

        var company = $(companyNode);

        var name = company.children("nome").text(),
            username = company.children("username").text(),
            cnpj = company.children("cnpj").text(),
            cpf = company.children("cpf").text(),
            credits = parseInt(company.children("credits").text());

        var [section, results, actions] = controller.call("section",
            `Administração ${name || username}`,
            `Conta registrada para documento ${cnpj || cpf || username}`,
            `Visualizar, editar e controlar o acesso do usuário ${username}`);

        section.addClass("admin-company");

        /* We live in citys we never seen in screen */
        var result = controller.call("result");
        result.addItem("Assinante", name);

        if (cnpj) result.addItem("CNPJ", cnpj);
        if (cpf) result.addItem("CPF", cpf);
        if (credits) result.addItem("Créditos Sistema", numeral(credits / 100.).format('$0,0.00'));

        var inputApiKey = result.addItem("Chave de API", companyNode.children("apiKey").text());
        result.addItem("Usuário", username);
        result.addItem("Contrato Aceito", companyNode.children("contractAccepted").text() == "true" ? "Aceito" : "Não Aceito");

        var isActive = company.children("status").text() === "1",
            activeLabel = result.addItem("Situação", isActive ? "Ativo" : "Bloqueado");

        var phones = company.children("telefones").children("telefones");
        if (phones.length) {
            result.addSeparator("Telefones",
                "Lista de Telefones para Contato",
                "O telefone deve ser usado apenas para emergências e tratativas comerciais.");

            var [ddd, phone, pabx, name, kind] = [
                phones.children("telefones:eq(0)"),
                phones.children("telefones:eq(1)"),
                phones.children("telefones:eq(2)"),
                phones.children("telefones:eq(3)"),
                phones.children("telefones:eq(3)")
            ];

            result.addItem(`${name} - ${kind}`, `(${ddd}) ${phone} ${pabx}`);
        }

        var endereco = company.children("endereco");
        if (endereco.length) {
            result.addSeparator("Endereço",
                "Endereço registrado para emissão de faturas",
                "As notas fiscais e faturas são enviadas para este endereço cadastrado, se certifique que esteja atualizado.");

            var appendAddressItem = (item, value) => {
                if (value) {
                    return result.addItem(item, value);
                }
                return null;
            };

            appendAddressItem("Endereço", endereco.find("endereco:eq(0)").text());
            appendAddressItem("Número", endereco.find("endereco:eq(1)").text());
            appendAddressItem("Complemento", endereco.find("endereco:eq(2)").text());
            appendAddressItem("Bairro", endereco.find("endereco:eq(3)").text());
            appendAddressItem("Cidade", endereco.find("endereco:eq(4)").text());
            appendAddressItem("CEP", endereco.find("endereco:eq(5)").text());
            appendAddressItem("Estado", endereco.find("endereco:eq(6)").text());

        }

        result.addSeparator("Contrato",
            "Informações do Serviço Contratado",
            "Informações referentes ao contrato comercial estabelecido entre as partes.");

        var contrato = company.children("contrato");
        appendAddressItem("Dia Vencimento", contrato.find("contrato:eq(0)").text());
        appendAddressItem("Valor", numeral(parseFloat(contrato.find("contrato:eq(1)").text())).format('$0,0.00'));
        appendAddressItem("Pacote de Consultas", contrato.find("contrato:eq(2)").text());
        appendAddressItem("Valor da Consulta Excedente", numeral(parseFloat(contrato.find("contrato:eq(3)").text())).format('$0,0.00'));
        appendAddressItem("Tipo do Contrato", changeCase.titleCase(contrato.find("contrato:eq(4)").text()));
        appendAddressItem("Criação", moment.unix(parseInt(contrato.find("contrato:eq(5)").text())).fromNow());

        var emails = company.children("email").children("email");
        if (emails.length) {
            result.addSeparator("Endereços de Email",
                "Endereços de e-mail registrados",
                "As notificações geradas pelo sistema são enviadas para estes e-mails.");

            emails.each(function(idx, value) {
                result.addItem($("email:eq(1)", value).text(), $("email:eq(0)", value).text());
            });
        }

        results.append(result.element());

        (append || $(".app-content")).append(section);

        var lockSymbol = $("<i />").addClass("fa").addClass(isActive ? "fa-lock" : "fa-unlock-alt"),
            lockProcess = false,
            doLocking = (e) => {
                e.preventDefault();
                if (lockProcess) {
                    return;
                }
                controller.serverCommunication.call("UPDATE 'BIPBOPCOMPANYS'.'STATUS'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            account: username,
                            set: !isActive ? 1 : 0,
                        },
                        success: function() {
                            isActive = !isActive;
                            activeLabel.find(".value").text(isActive ? "Ativo" : "Bloqueado");
                            lockSymbol
                                .removeClass("fa-unlock-alt")
                                .removeClass("fa-lock")
                                .addClass(isActive ? "fa-lock" : "fa-unlock-alt");
                        }
                    })));
            };

        controller.call("tooltip", actions, "Editar").append($("<i />").addClass("fa fa-edit")).click((e) => {
            e.preventDefault();
            controller.call("admin::changeCompany");
        });

        controller.call("tooltip", actions, "Editar Contrato").append($("<i />").addClass("fa fa-briefcase")).click((e) => {
            e.preventDefault();
            controller.call("admin::changeContract");
        });

        controller.call("tooltip", actions, "Editar Endereço").append($("<i />").addClass("fa fa-map")).click((e) => {
            e.preventDefault();
            controller.call("admin::changeAddress");
        });

        controller.call("tooltip", actions, "Nova Chave API").append($("<i />").addClass("fa fa-key")).click((e) => {
            controller.call("confirm", {}, () => {
                controller.serverCommunication.call("UPDATE 'BIPBOPCOMPANYS'.'APIKEY'",
                    controller.call("error::ajax", controller.call("loader::ajax", {
                        data: {
                            username: username
                        },
                        success: function(ret) {
                            inputApiKey.find(".value").text($("BPQL > body > apiKey", ret).text());
                        }
                    })));
            });
        });

        controller.call("tooltip", actions, "Nova Senha").append($("<i />").addClass("fa fa-asterisk")).click((e) => {
            e.preventDefault();
            controller.call("admin::changePassword", username);
        });

        controller.call("tooltip", actions, "Bloquear/Desbloquear").append(lockSymbol).click(doLocking);
        
        controller.call("tooltip", actions, "Editar E-mails").append($("<i />").addClass("fa fa-at"));
        controller.call("tooltip", actions, "Editar Telefones").append($("<i />").addClass("fa fa-phone"));
        controller.call("tooltip", actions, "Consumo").append($("<i />").addClass("fa fa-tasks"));
    });
};
